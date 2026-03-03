"use client";

import type { GradeMetrics, GradeTrend } from "@/lib/report-queries";
import ReportBarChart from "./ReportBarChart";

interface Props {
  gradeMetrics: GradeMetrics[];
  gradeTrends: GradeTrend[];
}

const GRADE_TARGETS: Record<string, number> = {
  "Grade A": 99,
  "Grade B": 98,
  "Grade C": 97,
  "Grade D": 95,
};

function getStatusColor(rate: number, grade: string): string {
  const target = GRADE_TARGETS[grade] || 95;
  if (rate >= target) return "text-emerald-600";
  if (rate >= target - 5) return "text-amber-600";
  return "text-red-600";
}

export default function GradePerformance({ gradeMetrics, gradeTrends }: Props) {
  // Build chart data: compliance rate per grade per month
  const months = [...new Set(gradeTrends.map((t) => t.month))].sort();
  const grades = [...new Set(gradeTrends.map((t) => t.grade))].sort();
  const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <section id="grades" className="space-y-6">
      <h2 className="text-xl font-bold text-slate-800 border-b pb-2">
        2. Grade Performance
      </h2>

      {/* Grade Summary Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="pb-2 pr-4">Grade</th>
              <th className="pb-2 pr-4 text-right">Samples</th>
              <th className="pb-2 pr-4 text-right">Compliance</th>
              <th className="pb-2 pr-4 text-right">Target</th>
              <th className="pb-2 pr-4 text-right">Avg CFU</th>
              <th className="pb-2 pr-4 text-right">Alerts</th>
              <th className="pb-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {gradeMetrics.map((g) => (
              <tr
                key={g.grade}
                className="border-b border-slate-100 hover:bg-slate-50"
              >
                <td className="py-2 pr-4 font-medium">{g.grade}</td>
                <td className="py-2 pr-4 text-right">{g.total}</td>
                <td
                  className={`py-2 pr-4 text-right font-bold ${getStatusColor(g.complianceRate, g.grade)}`}
                >
                  {g.complianceRate}%
                </td>
                <td className="py-2 pr-4 text-right text-slate-400">
                  {GRADE_TARGETS[g.grade] || 95}%
                </td>
                <td className="py-2 pr-4 text-right font-mono">{g.avgCfu}</td>
                <td className="py-2 pr-4 text-right text-amber-600">
                  {g.alert}
                </td>
                <td className="py-2 text-right text-red-600">{g.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Grade Compliance Trend */}
      {months.length > 1 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">
            Compliance Rate Trend by Grade
          </h3>
          <div className="h-64">
            <ReportBarChart
              labels={months}
              datasets={grades.map((grade, i) => ({
                label: grade,
                data: months.map((month) => {
                  const entry = gradeTrends.find(
                    (t) => t.month === month && t.grade === grade
                  );
                  return entry?.complianceRate ?? 0;
                }),
                backgroundColor: COLORS[i % COLORS.length],
              }))}
              yLabel="Compliance %"
            />
          </div>
        </div>
      )}
    </section>
  );
}
