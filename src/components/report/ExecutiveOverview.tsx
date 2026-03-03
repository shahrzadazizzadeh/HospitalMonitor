"use client";

import type { MonthlyTrend, TypeBreakdown } from "@/lib/report-queries";
import ReportBarChart from "./ReportBarChart";
import ReportSparkline from "./ReportSparkline";

interface Props {
  totalSamples: number;
  complianceRate: number;
  totalLocations: number;
  totalAlerts: number;
  totalActions: number;
  monthlyTrends: MonthlyTrend[];
  typeBreakdown: TypeBreakdown[];
}

function KpiCard({
  label,
  value,
  trend,
  trendLabels,
  color,
}: {
  label: string;
  value: string;
  trend?: number[];
  trendLabels?: string[];
  color?: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
      <div className="flex items-end justify-between mt-1">
        <span className={`text-2xl font-bold ${color || "text-slate-900"}`}>
          {value}
        </span>
        {trend && trendLabels && (
          <ReportSparkline
            data={trend}
            labels={trendLabels}
            color={color === "text-emerald-600" ? "#059669" : "#3b82f6"}
          />
        )}
      </div>
    </div>
  );
}

export default function ExecutiveOverview({
  totalSamples,
  complianceRate,
  totalLocations,
  totalAlerts,
  totalActions,
  monthlyTrends,
  typeBreakdown,
}: Props) {
  const trendLabels = monthlyTrends.map((t) => t.month);
  const compTrend = monthlyTrends.map((t) => t.complianceRate);
  const sampleTrend = monthlyTrends.map((t) => t.total);

  return (
    <section id="executive" className="space-y-6">
      <h2 className="text-xl font-bold text-slate-800 border-b pb-2">
        1. Executive Overview
      </h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          label="Total Samples"
          value={totalSamples.toLocaleString()}
          trend={sampleTrend}
          trendLabels={trendLabels}
        />
        <KpiCard
          label="Compliance Rate"
          value={`${complianceRate}%`}
          trend={compTrend}
          trendLabels={trendLabels}
          color="text-emerald-600"
        />
        <KpiCard label="Locations" value={totalLocations.toLocaleString()} />
        <KpiCard
          label="Alert Events"
          value={totalAlerts.toLocaleString()}
          color={totalAlerts > 0 ? "text-amber-600" : undefined}
        />
        <KpiCard
          label="Action Events"
          value={totalActions.toLocaleString()}
          color={totalActions > 0 ? "text-red-600" : undefined}
        />
      </div>

      {/* Monthly Trend Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">
          Monthly Sample Count &amp; Status
        </h3>
        <div className="h-64">
          <ReportBarChart
            labels={trendLabels}
            datasets={[
              {
                label: "Compliant",
                data: monthlyTrends.map((t) => t.compliant),
                backgroundColor: "#22c55e",
              },
              {
                label: "Alert",
                data: monthlyTrends.map((t) => t.alert),
                backgroundColor: "#f59e0b",
              },
              {
                label: "Action",
                data: monthlyTrends.map((t) => t.action),
                backgroundColor: "#ef4444",
              },
            ]}
            yLabel="Samples"
            stacked
          />
        </div>
      </div>

      {/* Sample Type Breakdown */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">
          Sample Type Breakdown
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {typeBreakdown.map((t) => (
            <div
              key={t.type}
              className="text-center bg-slate-50 rounded-lg p-3"
            >
              <div className="text-lg font-bold text-slate-900">{t.count}</div>
              <div className="text-xs text-slate-500">{t.type}</div>
              <div className="text-xs text-slate-400">{t.pct}%</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
