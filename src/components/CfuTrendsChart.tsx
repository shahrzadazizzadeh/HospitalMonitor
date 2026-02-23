"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface WeeklyData {
  week: string;
  series: Record<string, number>;
}

const COLORS = [
  "#3b82f6",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

export default function CfuTrendsChart({ data }: { data: WeeklyData[] }) {
  if (data.length === 0) return null;

  const labels = data.map((d) => d.week);
  const seriesNames = Object.keys(data[0].series);

  const datasets = seriesNames.map((name, i) => ({
    label: name,
    data: data.map((d) => d.series[name] ?? 0),
    borderColor: COLORS[i % COLORS.length],
    backgroundColor: COLORS[i % COLORS.length] + "20",
    tension: 0.3,
    pointRadius: 3,
  }));

  return (
    <Line
      data={{ labels, datasets }}
      options={{
        responsive: true,
        plugins: {
          legend: { position: "bottom" },
          title: { display: false },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: "Avg CFU" },
          },
        },
      }}
    />
  );
}
