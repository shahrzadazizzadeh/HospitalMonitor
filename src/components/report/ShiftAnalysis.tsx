"use client";

import type { ShiftMetrics, ShiftTypeCrossTab } from "@/lib/report-queries";
import ReportBarChart from "./ReportBarChart";

interface Props {
  shiftMetrics: ShiftMetrics[];
  shiftTypeCrossTab: ShiftTypeCrossTab[];
}

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function ShiftAnalysis({
  shiftMetrics,
  shiftTypeCrossTab,
}: Props) {
  // Cross-tab: group by shift, show avgCfu per type
  const types = [...new Set(shiftTypeCrossTab.map((ct) => ct.type))].sort();
  const shifts = [...new Set(shiftTypeCrossTab.map((ct) => ct.shift))].sort();

  return (
    <section id="shifts" className="space-y-6">
      <h2 className="text-xl font-bold text-slate-800 border-b pb-2">
        5. Shift Analysis
      </h2>

      {/* Shift Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {shiftMetrics.map((s) => (
          <div
            key={s.shift}
            className="bg-white border border-slate-200 rounded-xl p-5"
          >
            <h4 className="text-sm font-semibold text-slate-700">
              {s.shift}
            </h4>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between">
                <span className="text-xs text-slate-500">Samples</span>
                <span className="text-sm font-bold">{s.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-500">Compliance</span>
                <span
                  className={`text-sm font-bold ${
                    s.complianceRate >= 90
                      ? "text-emerald-600"
                      : s.complianceRate >= 70
                        ? "text-amber-600"
                        : "text-red-600"
                  }`}
                >
                  {s.complianceRate}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-500">Avg CFU</span>
                <span className="text-sm font-mono">{s.avgCfu}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-500">Excursions</span>
                <span className="text-sm text-red-600 font-bold">
                  {s.alert + s.action}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Shift Compliance Bar Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">
          Compliance Rate by Shift
        </h3>
        <div className="h-48">
          <ReportBarChart
            labels={shiftMetrics.map((s) => s.shift)}
            datasets={[
              {
                label: "Compliance %",
                data: shiftMetrics.map((s) => s.complianceRate),
                backgroundColor: "#3b82f6",
              },
            ]}
            yLabel="Compliance %"
          />
        </div>
      </div>

      {/* Shift x Type Cross-Tab */}
      {shiftTypeCrossTab.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 overflow-x-auto">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">
            Average CFU: Shift x Sample Type
          </h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="pb-2 pr-4">Shift</th>
                {types.map((t) => (
                  <th key={t} className="pb-2 pr-4 text-right">
                    {t}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shifts.map((shift) => (
                <tr
                  key={shift}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="py-2 pr-4 font-medium">{shift}</td>
                  {types.map((type) => {
                    const entry = shiftTypeCrossTab.find(
                      (ct) => ct.shift === shift && ct.type === type
                    );
                    return (
                      <td key={type} className="py-2 pr-4 text-right font-mono">
                        {entry ? entry.avgCfu : "—"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
