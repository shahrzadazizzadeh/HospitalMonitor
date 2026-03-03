"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler);

interface ReportSparklineProps {
  data: number[];
  labels: string[];
  color?: string;
}

export default function ReportSparkline({
  data,
  labels,
  color = "#3b82f6",
}: ReportSparklineProps) {
  return (
    <div className="h-12 w-28">
      <Line
        data={{
          labels,
          datasets: [
            {
              data,
              borderColor: color,
              backgroundColor: color + "20",
              borderWidth: 1.5,
              pointRadius: 0,
              fill: true,
              tension: 0.4,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
          scales: {
            x: { display: false },
            y: { display: false, beginAtZero: true },
          },
        }}
      />
    </div>
  );
}
