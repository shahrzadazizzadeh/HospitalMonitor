import Link from "next/link";
import { prisma } from "@/lib/db";
import CfuTrendsChart from "@/components/CfuTrendsChart";
import OrganismChart from "@/components/OrganismChart";
import StatusBadge from "@/components/StatusBadge";

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

  // --- Feature 1: Compliance Rate ---
  // (compliant samples / total samples) × 100
  const compliantCount = await prisma.sample.count({
    where: { status: "compliant" },
  });
  const complianceRate =
    sampleCount > 0
      ? ((compliantCount / sampleCount) * 100).toFixed(1)
      : "—";

  // --- Feature 2: Sample Type Breakdown ---
  // Count of samples grouped by sampleType
  const typeBreakdown = await prisma.sample.groupBy({
    by: ["sampleType"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  });

  // --- Feature 3: Excursion Events ---
  // Samples where status is "alert" or "action", most recent first
  const excursions = await prisma.sample.findMany({
    where: { status: { in: ["alert", "action"] } },
    include: {
      location: true,
      organism: true,
    },
    orderBy: { sampleDate: "desc" },
    take: 10,
  });

  // --- Feature 4: CFU Trends by week + sample type ---
  // Average CFU per week, grouped by sampleType
  const allSamples = await prisma.sample.findMany({
    select: { sampleDate: true, cfuCount: true, sampleType: true },
    orderBy: { sampleDate: "asc" },
  });

  const weeklyMap = new Map<string, Map<string, { sum: number; count: number }>>();
  for (const s of allSamples) {
    const d = new Date(s.sampleDate);
    // ISO week label: "YYYY-WNN"
    const startOfYear = new Date(d.getFullYear(), 0, 1);
    const weekNum = Math.ceil(
      ((d.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
    );
    const weekLabel = `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;

    if (!weeklyMap.has(weekLabel)) weeklyMap.set(weekLabel, new Map());
    const typeMap = weeklyMap.get(weekLabel)!;
    if (!typeMap.has(s.sampleType))
      typeMap.set(s.sampleType, { sum: 0, count: 0 });
    const entry = typeMap.get(s.sampleType)!;
    entry.sum += s.cfuCount;
    entry.count += 1;
  }

  const weeklyData = Array.from(weeklyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, typeMap]) => {
      const series: Record<string, number> = {};
      for (const [type, { sum, count }] of typeMap) {
        series[type] = Math.round((sum / count) * 10) / 10;
      }
      return { week, series };
    });

  // --- Feature 5: Organism Distribution ---
  // Count of samples per organism, top 8
  const organismCounts = await prisma.sample.groupBy({
    by: ["organismId"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    where: { organismId: { not: null } },
  });

  const organismIds = organismCounts.map((o) => o.organismId!);
  const organisms = await prisma.organism.findMany({
    where: { id: { in: organismIds } },
  });
  const orgNameMap = new Map(organisms.map((o) => [o.id, o.name]));

  const organismData = organismCounts.slice(0, 8).map((o) => ({
    name: orgNameMap.get(o.organismId!) || "Unknown",
    count: o._count.id,
    pct:
      sampleCount > 0
        ? Math.round((o._count.id / sampleCount) * 1000) / 10
        : 0,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">
          Magnus EM &mdash; Environmental Monitoring Platform
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total Samples" value={sampleCount.toLocaleString()} />
        <StatCard
          label="Compliance Rate"
          value={`${complianceRate}%`}
          color="green"
        />
        <StatCard label="Locations" value={locationCount.toLocaleString()} />
        <StatCard
          label="Alert Events"
          value={alertCount.toLocaleString()}
          color={alertCount > 0 ? "amber" : undefined}
        />
        <StatCard
          label="Action Events"
          value={actionCount.toLocaleString()}
          color={actionCount > 0 ? "red" : undefined}
        />
      </div>

      {/* Sample Type Breakdown */}
      {typeBreakdown.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">
            Samples by Type
          </h2>
          <div className="flex flex-wrap gap-4">
            {typeBreakdown.map((t) => (
              <div key={t.sampleType} className="flex items-center gap-2">
                <span className="text-sm text-slate-600">{t.sampleType}:</span>
                <span className="text-sm font-bold text-slate-900">
                  {t._count.id.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

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
        <>
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CFU Trends Chart */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-slate-700 mb-3">
                CFU Trends by Sample Type
              </h2>
              <CfuTrendsChart data={weeklyData} />
            </div>

            {/* Organism Distribution Chart */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-slate-700 mb-3">
                Microorganism Distribution
              </h2>
              <OrganismChart data={organismData} />
            </div>
          </div>

          {/* Excursion Events Table */}
          {excursions.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-slate-700 mb-3">
                Excursion Events
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-slate-500">
                      <th className="pb-2 pr-4">Date</th>
                      <th className="pb-2 pr-4">Location</th>
                      <th className="pb-2 pr-4">Sample Type</th>
                      <th className="pb-2 pr-4">CFU</th>
                      <th className="pb-2 pr-4">Alert Limit</th>
                      <th className="pb-2 pr-4">Action Limit</th>
                      <th className="pb-2 pr-4">Organism</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {excursions.map((e) => (
                      <tr
                        key={e.id}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="py-2 pr-4">
                          {new Date(e.sampleDate).toLocaleDateString()}
                        </td>
                        <td className="py-2 pr-4">{e.location.name}</td>
                        <td className="py-2 pr-4">{e.sampleType}</td>
                        <td className="py-2 pr-4 font-mono font-bold">
                          {e.cfuCount}
                        </td>
                        <td className="py-2 pr-4 font-mono text-amber-600">
                          {e.alertLimit}
                        </td>
                        <td className="py-2 pr-4 font-mono text-red-600">
                          {e.actionLimit}
                        </td>
                        <td className="py-2 pr-4">
                          {e.organism?.name || "—"}
                        </td>
                        <td className="py-2">
                          <StatusBadge status={e.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <Link
              href="/samples"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
            >
              View All Samples
            </Link>
            <Link
              href="/upload"
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors text-sm"
            >
              Upload More Data
            </Link>
          </div>
        </>
      )}

      <div className="text-xs text-slate-400">Uploads: {uploadCount}</div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: "green" | "amber" | "red";
}) {
  const borderColor =
    color === "green"
      ? "border-l-emerald-500"
      : color === "red"
        ? "border-l-red-500"
        : color === "amber"
          ? "border-l-amber-500"
          : "border-l-blue-500";
  const valueColor =
    color === "green"
      ? "text-emerald-600"
      : color === "red"
        ? "text-red-600"
        : color === "amber"
          ? "text-amber-600"
          : "text-slate-900";
  return (
    <div
      className={`bg-white border border-slate-200 border-l-4 ${borderColor} rounded-xl p-5`}
    >
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${valueColor}`}>{value}</p>
    </div>
  );
}
