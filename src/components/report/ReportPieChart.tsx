"use client";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = [
  "#3b82f6", "#6366f1", "#8b5cf6", "#22c55e",
  "#14b8a6", "#f59e0b", "#ef4444", "#ec4899",
  "#06b6d4", "#84cc16",
];

interface ReportPieChartProps {
  labels: string[];
  data: number[];
  showLegend?: boolean;
}

export default function ReportPieChart({
  labels,
  data,
  showLegend = true,
}: ReportPieChartProps) {
  return (
    <Doughnut
      data={{
        labels,
        datasets: [
          {
            data,
            backgroundColor: COLORS.slice(0, data.length),
            borderWidth: 2,
            borderColor: "#fff",
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: showLegend
            ? { position: "bottom", labels: { boxWidth: 12, font: { size: 11 } } }
            : { display: false },
        },
      }}
    />
  );
}
