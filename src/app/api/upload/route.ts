import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseExcelBuffer, computeStatus } from "@/lib/excel-parser";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload .xlsx, .xls, or .csv" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { samples, errors } = parseExcelBuffer(buffer);

    if (samples.length === 0) {
      return NextResponse.json(
        { error: "No valid data found", details: errors },
        { status: 400 }
      );
    }

    // Create or find facility (default for now)
    const facility = await prisma.facility.upsert({
      where: { id: "default-facility" },
      update: {},
      create: {
        id: "default-facility",
        name: "Meir Hospital",
        nameHe: "בית חולים מאיר",
      },
    });

    // Create upload record
    const upload = await prisma.upload.create({
      data: {
        fileName: file.name,
        fileSize: file.size,
        rowCount: samples.length,
        facilityId: facility.id,
        status: "processing",
      },
    });

    let importedCount = 0;
    const statusCounts = { compliant: 0, alert: 0, action: 0 };

    for (const sample of samples) {
      // Upsert location
      const location = await prisma.location.upsert({
        where: {
          facilityId_locationId: {
            facilityId: facility.id,
            locationId: sample.locationId,
          },
        },
        update: {
          ...(sample.gmpGrade ? { grade: sample.gmpGrade } : {}),
        },
        create: {
          locationId: sample.locationId,
          name: sample.locationId,
          nameHe: sample.locationName !== sample.locationId ? sample.locationName : null,
          grade: sample.gmpGrade || null,
          facilityId: facility.id,
        },
      });

      // Upsert organism
      let organism = null;
      if (sample.organism && sample.organism !== "Unknown") {
        organism = await prisma.organism.upsert({
          where: { name: sample.organism },
          update: {
            ...(sample.gramType ? { gramType: sample.gramType } : {}),
            ...(sample.riskLevel ? { riskLevel: sample.riskLevel } : {}),
          },
          create: {
            name: sample.organism,
            gramType: sample.gramType || null,
            riskLevel: sample.riskLevel || null,
          },
        });
      }

      // Compute status
      const status = computeStatus(
        sample.cfuCount,
        sample.alertLimit,
        sample.actionLimit
      );
      statusCounts[status as keyof typeof statusCounts]++;

      // Create sample
      await prisma.sample.create({
        data: {
          sampleDate: sample.sampleDate,
          sampleType: sample.sampleType,
          cfuCount: sample.cfuCount,
          actionLimit: sample.actionLimit,
          alertLimit: sample.alertLimit,
          status,
          shift: sample.shift || null,
          gmpGrade: sample.gmpGrade || null,
          isoClassification: sample.isoClassification || null,
          contaminationSource: sample.contaminationSource || null,
          locationId: location.id,
          organismId: organism?.id || null,
          uploadId: upload.id,
        },
      });

      importedCount++;
    }

    // Update upload status
    await prisma.upload.update({
      where: { id: upload.id },
      data: { status: "processed" },
    });

    return NextResponse.json({
      success: true,
      summary: {
        fileName: file.name,
        totalRows: samples.length,
        imported: importedCount,
        statuses: statusCounts,
        parseErrors: errors.length,
        errors: errors.slice(0, 10),
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to process file", details: String(error) },
      { status: 500 }
    );
  }
}
