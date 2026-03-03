"use client";

import type { LocationMetrics } from "@/lib/report-queries";

function getColor(rate: number): string {
  if (rate >= 95) return "bg-emerald-100 text-emerald-800 border-emerald-300";
  if (rate >= 80) return "bg-yellow-100 text-yellow-800 border-yellow-300";
  if (rate >= 60) return "bg-orange-100 text-orange-800 border-orange-300";
  return "bg-red-100 text-red-800 border-red-300";
}

export default function ComplianceHeatmap({
  locations,
}: {
  locations: LocationMetrics[];
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
      {locations.map((loc) => (
        <div
          key={loc.locationId}
          className={`rounded-lg border p-3 text-center ${getColor(loc.complianceRate)}`}
        >
          <div className="text-xs font-medium truncate" title={loc.nameHe || loc.name}>
            {loc.locationId}
          </div>
          <div className="text-lg font-bold">{loc.complianceRate}%</div>
          <div className="text-xs opacity-70">
            {loc.total} samples
          </div>
        </div>
      ))}
    </div>
  );
}
