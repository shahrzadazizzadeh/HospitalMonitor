"use client";

import type {
  OrganismMetrics,
  GramTypeBreakdown,
  ContaminationSourceBreakdown,
  RiskBreakdown,
} from "@/lib/report-queries";
import ReportPieChart from "./ReportPieChart";
import ReportBarChart from "./ReportBarChart";

interface Props {
  topOrganisms: OrganismMetrics[];
  gramTypeBreakdown: GramTypeBreakdown[];
  contaminationSources: ContaminationSourceBreakdown[];
  riskBreakdown: RiskBreakdown[];
}

export default function MicrobiologyAnalysis({
  topOrganisms,
  gramTypeBreakdown,
  contaminationSources,
  riskBreakdown,
}: Props) {
  return (
    <section id="microbiology" className="space-y-6">
      <h2 className="text-xl font-bold text-slate-800 border-b pb-2">
        4. Microbiology Analysis
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Organisms */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">
            Most Frequent Organisms
          </h3>
          {topOrganisms.length > 0 ? (
            <div className="h-64">
              <ReportBarChart
                labels={topOrganisms.map((o) => o.name)}
                datasets={[
                  {
                    label: "Isolations",
                    data: topOrganisms.map((o) => o.count),
                    backgroundColor: "#6366f1",
                  },
                ]}
                yLabel="Count"
                horizontal
              />
            </div>
          ) : (
            <p className="text-slate-400 text-sm">No organisms identified</p>
          )}
        </div>

        {/* Gram Type Distribution */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">
            Gram Type Distribution
          </h3>
          {gramTypeBreakdown.length > 0 ? (
            <div className="h-64">
              <ReportPieChart
                labels={gramTypeBreakdown.map(
                  (g) => `${g.gramType} (${g.pct}%)`
                )}
                data={gramTypeBreakdown.map((g) => g.count)}
              />
            </div>
          ) : (
            <p className="text-slate-400 text-sm">No gram type data</p>
          )}
        </div>

        {/* Contamination Sources */}
        {contaminationSources.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Contamination Sources
            </h3>
            <div className="h-64">
              <ReportPieChart
                labels={contaminationSources.map(
                  (c) => `${c.source} (${c.pct}%)`
                )}
                data={contaminationSources.map((c) => c.count)}
              />
            </div>
          </div>
        )}

        {/* Risk Level */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">
            Risk Level Distribution
          </h3>
          <div className="space-y-2">
            {riskBreakdown.map((r) => {
              const barColor =
                r.level === "High"
                  ? "bg-red-500"
                  : r.level === "Medium"
                    ? "bg-amber-500"
                    : r.level === "Low"
                      ? "bg-emerald-500"
                      : "bg-slate-400";
              return (
                <div key={r.level} className="flex items-center gap-3">
                  <span className="text-sm text-slate-600 w-20">{r.level}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
                    <div
                      className={`h-full ${barColor} rounded-full transition-all`}
                      style={{ width: `${r.pct}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-700 w-20 text-right">
                    {r.count} ({r.pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Organism Detail Table */}
      {topOrganisms.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 overflow-x-auto">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">
            Organism Details
          </h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="pb-2 pr-4">Organism</th>
                <th className="pb-2 pr-4 text-right">Isolations</th>
                <th className="pb-2 pr-4 text-right">% of Recoveries</th>
                <th className="pb-2 pr-4">Gram Type</th>
                <th className="pb-2">Risk Level</th>
              </tr>
            </thead>
            <tbody>
              {topOrganisms.map((o) => (
                <tr
                  key={o.name}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="py-2 pr-4 font-medium">{o.name}</td>
                  <td className="py-2 pr-4 text-right">{o.count}</td>
                  <td className="py-2 pr-4 text-right">{o.pct}%</td>
                  <td className="py-2 pr-4">{o.gramType || "—"}</td>
                  <td className="py-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        o.riskLevel === "High"
                          ? "bg-red-100 text-red-700"
                          : o.riskLevel === "Medium"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {o.riskLevel || "—"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
