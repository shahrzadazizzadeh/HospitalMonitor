"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ReportBarChartProps {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
  }[];
  yLabel?: string;
  stacked?: boolean;
  horizontal?: boolean;
}

export default function ReportBarChart({
  labels,
  datasets,
  yLabel,
  stacked = false,
  horizontal = false,
}: ReportBarChartProps) {
  return (
    <Bar
      data={{ labels, datasets }}
      options={{
        indexAxis: horizontal ? "y" : "x",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { boxWidth: 12, font: { size: 11 } },
          },
        },
        scales: {
          x: { stacked, ticks: { font: { size: 10 } } },
          y: {
            stacked,
            beginAtZero: true,
            title: yLabel ? { display: true, text: yLabel, font: { size: 11 } } : undefined,
            ticks: { font: { size: 10 } },
          },
        },
      }}
    />
  );
}
