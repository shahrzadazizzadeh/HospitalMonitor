"use client";

import type { LocationMetrics } from "@/lib/report-queries";
import ComplianceHeatmap from "./ComplianceHeatmap";

interface Props {
  locationMetrics: LocationMetrics[];
}

function getRowColor(rate: number): string {
  if (rate >= 95) return "";
  if (rate >= 80) return "bg-yellow-50";
  if (rate >= 60) return "bg-orange-50";
  return "bg-red-50";
}

export default function LocationPerformance({ locationMetrics }: Props) {
  const topExcursion = locationMetrics.filter((l) => l.excursions > 0).slice(0, 10);

  return (
    <section id="locations" className="space-y-6">
      <h2 className="text-xl font-bold text-slate-800 border-b pb-2">
        3. Location Performance
      </h2>

      {/* Heatmap */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">
          Compliance Heatmap
        </h3>
        <ComplianceHeatmap locations={locationMetrics} />
      </div>

      {/* Top Excursion Locations Table */}
      {topExcursion.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 overflow-x-auto">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">
            Locations with Excursions
          </h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="pb-2 pr-4">Location</th>
                <th className="pb-2 pr-4">Grade</th>
                <th className="pb-2 pr-4 text-right">Samples</th>
                <th className="pb-2 pr-4 text-right">Excursions</th>
                <th className="pb-2 pr-4 text-right">Compliance</th>
                <th className="pb-2 text-right">Avg CFU</th>
              </tr>
            </thead>
            <tbody>
              {topExcursion.map((loc) => (
                <tr
                  key={loc.locationId}
                  className={`border-b border-slate-100 ${getRowColor(loc.complianceRate)}`}
                >
                  <td className="py-2 pr-4">
                    <div className="font-medium">{loc.locationId}</div>
                    {loc.nameHe && (
                      <div className="text-xs text-slate-400" dir="rtl">
                        {loc.nameHe}
                      </div>
                    )}
                  </td>
                  <td className="py-2 pr-4 text-slate-600">
                    {loc.grade || "—"}
                  </td>
                  <td className="py-2 pr-4 text-right">{loc.total}</td>
                  <td className="py-2 pr-4 text-right font-bold text-red-600">
                    {loc.excursions}
                  </td>
                  <td className="py-2 pr-4 text-right font-bold">
                    {loc.complianceRate}%
                  </td>
                  <td className="py-2 text-right font-mono">{loc.avgCfu}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
