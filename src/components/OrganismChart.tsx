"use client";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

interface OrganismData {
  name: string;
  count: number;
  pct: number;
}

const COLORS = [
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#22c55e",
  "#14b8a6",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
];

export default function OrganismChart({ data }: { data: OrganismData[] }) {
  if (data.length === 0) return null;

  return (
    <Doughnut
      data={{
        labels: data.map((d) => `${d.name} (${d.pct}%)`),
        datasets: [
          {
            data: data.map((d) => d.count),
            backgroundColor: COLORS.slice(0, data.length),
            borderWidth: 2,
            borderColor: "#fff",
          },
        ],
      }}
      options={{
        responsive: true,
        plugins: {
          legend: { position: "bottom", labels: { boxWidth: 12 } },
        },
      }}
    />
  );
}
