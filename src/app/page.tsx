import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const sampleCount = await prisma.sample.count();
  const locationCount = await prisma.location.count();
  const uploadCount = await prisma.upload.count();

  const alertCount = await prisma.sample.count({
    where: { status: "alert" },
  });
  const actionCount = await prisma.sample.count({
    where: { status: "action" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">
          Magnus EM &mdash; Environmental Monitoring Platform
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Samples" value={sampleCount} />
        <StatCard label="Locations" value={locationCount} />
        <StatCard
          label="Alerts"
          value={alertCount}
          color={alertCount > 0 ? "amber" : undefined}
        />
        <StatCard
          label="Action Exceedances"
          value={actionCount}
          color={actionCount > 0 ? "red" : undefined}
        />
      </div>

      {sampleCount === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <p className="text-slate-500 text-lg mb-4">
            No data yet. Upload an Excel file to get started.
          </p>
          <Link
            href="/upload"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Upload Data
          </Link>
        </div>
      ) : (
        <div className="flex gap-4">
          <Link
            href="/samples"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
          >
            View Samples
          </Link>
          <Link
            href="/upload"
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors text-sm"
          >
            Upload More Data
          </Link>
        </div>
      )}

      <div className="text-xs text-slate-400">
        Uploads: {uploadCount}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color?: "amber" | "red";
}) {
  const valueColor =
    color === "red"
      ? "text-red-600"
      : color === "amber"
        ? "text-amber-600"
        : "text-slate-900";
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${valueColor}`}>{value}</p>
    </div>
  );
}
