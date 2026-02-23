import * as XLSX from "xlsx";

export interface ParsedSample {
  sampleDate: Date;
  locationId: string;
  locationName: string;
  sampleType: string;
  cfuCount: number;
  actionLimit: number;
  alertLimit: number;
  organism: string;
}

export interface ParseResult {
  samples: ParsedSample[];
  errors: string[];
}

// Map of known header variations to canonical field names
const HEADER_MAP: Record<string, keyof ParsedSample> = {
  sample_date: "sampleDate",
  date: "sampleDate",
  sampledate: "sampleDate",
  location_id: "locationId",
  locationid: "locationId",
  location_name: "locationName",
  locationname: "locationName",
  location: "locationName",
  sample_type: "sampleType",
  sampletype: "sampleType",
  type: "sampleType",
  cfu_count: "cfuCount",
  cfucount: "cfuCount",
  cfu: "cfuCount",
  action_limit: "actionLimit",
  actionlimit: "actionLimit",
  alert_limit: "alertLimit",
  alertlimit: "alertLimit",
  organism: "organism",
  microorganism: "organism",
};

function excelDateToJS(serial: number): Date {
  // Excel serial date: days since 1899-12-30
  const utcDays = Math.floor(serial - 25569);
  return new Date(utcDays * 86400 * 1000);
}

function mapHeaders(rawHeaders: string[]): Map<number, keyof ParsedSample> {
  const mapping = new Map<number, keyof ParsedSample>();
  for (let i = 0; i < rawHeaders.length; i++) {
    const normalized = rawHeaders[i]
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, "_");
    const field = HEADER_MAP[normalized];
    if (field) {
      mapping.set(i, field);
    }
  }
  return mapping;
}

export function parseExcelBuffer(buffer: Buffer): ParseResult {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rawData = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 });

  if (rawData.length < 2) {
    return { samples: [], errors: ["File has no data rows"] };
  }

  const headers = (rawData[0] as string[]).map(String);
  const columnMap = mapHeaders(headers);

  const requiredFields: (keyof ParsedSample)[] = [
    "sampleDate",
    "locationId",
    "sampleType",
    "cfuCount",
    "actionLimit",
    "alertLimit",
  ];

  const mappedFields = new Set(columnMap.values());
  const missing = requiredFields.filter((f) => !mappedFields.has(f));
  if (missing.length > 0) {
    return {
      samples: [],
      errors: [`Missing required columns: ${missing.join(", ")}`],
    };
  }

  const samples: ParsedSample[] = [];
  const errors: string[] = [];

  for (let rowIdx = 1; rowIdx < rawData.length; rowIdx++) {
    const row = rawData[rowIdx] as unknown[];
    if (!row || row.length === 0) continue;

    try {
      const record: Partial<ParsedSample> = {};
      for (const [colIdx, field] of columnMap) {
        const value = row[colIdx];
        if (value === undefined || value === null || value === "") continue;

        switch (field) {
          case "sampleDate":
            record.sampleDate =
              typeof value === "number"
                ? excelDateToJS(value)
                : new Date(String(value));
            break;
          case "cfuCount":
          case "actionLimit":
          case "alertLimit":
            record[field] = Number(value);
            break;
          default:
            record[field] = String(value);
        }
      }

      // Validate required fields exist
      if (
        !record.sampleDate ||
        record.locationId === undefined ||
        record.sampleType === undefined ||
        record.cfuCount === undefined ||
        record.actionLimit === undefined ||
        record.alertLimit === undefined
      ) {
        errors.push(`Row ${rowIdx + 1}: missing required fields`);
        continue;
      }

      samples.push({
        sampleDate: record.sampleDate,
        locationId: record.locationId,
        locationName: record.locationName || record.locationId,
        sampleType: record.sampleType,
        cfuCount: record.cfuCount,
        actionLimit: record.actionLimit,
        alertLimit: record.alertLimit,
        organism: record.organism || "Unknown",
      });
    } catch (e) {
      errors.push(
        `Row ${rowIdx + 1}: ${e instanceof Error ? e.message : "parse error"}`
      );
    }
  }

  return { samples, errors };
}

export function computeStatus(
  cfuCount: number,
  alertLimit: number,
  actionLimit: number
): string {
  if (cfuCount >= actionLimit) return "action";
  if (cfuCount >= alertLimit) return "alert";
  return "compliant";
}
