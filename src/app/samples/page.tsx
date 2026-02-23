import { prisma } from "@/lib/db";
import SamplesTable from "@/components/SamplesTable";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SamplesPage() {
  const samples = await prisma.sample.findMany({
    include: {
      location: true,
      organism: true,
    },
    orderBy: { sampleDate: "desc" },
  });

  const serialized = samples.map((s) => ({
    ...s,
    sampleDate: s.sampleDate.toISOString(),
    createdAt: s.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Samples</h1>
          <p className="text-slate-500 mt-1">
            {samples.length} environmental monitoring samples
          </p>
        </div>
        <Link
          href="/upload"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
        >
          Upload More
        </Link>
      </div>

      {samples.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <p className="text-slate-500 text-lg mb-4">
            No samples yet. Upload an Excel file to get started.
          </p>
          <Link
            href="/upload"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Upload Data
          </Link>
        </div>
      ) : (
        <SamplesTable samples={serialized} />
      )}
    </div>
  );
}
