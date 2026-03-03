"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const PRESETS = [
  { value: "all", label: "All Time" },
  { value: "this_week", label: "This Week" },
  { value: "this_month", label: "This Month" },
  { value: "this_quarter", label: "This Quarter" },
  { value: "custom", label: "Custom Range" },
] as const;

type Preset = (typeof PRESETS)[number]["value"];

export default function DateRangeFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const range = (searchParams.get("range") as Preset) || "all";
  const customFrom = searchParams.get("from") || "";
  const customTo = searchParams.get("to") || "";

  const update = useCallback(
    (params: Record<string, string>) => {
      const sp = new URLSearchParams(searchParams.toString());
      // Clear old date params before setting new ones
      sp.delete("range");
      sp.delete("from");
      sp.delete("to");
      for (const [k, v] of Object.entries(params)) {
        if (v) sp.set(k, v);
      }
      router.push(`/?${sp.toString()}`);
    },
    [router, searchParams],
  );

  const handlePreset = (preset: string) => {
    if (preset === "all") {
      update({});
    } else if (preset === "custom") {
      update({ range: "custom", from: customFrom, to: customTo });
    } else {
      update({ range: preset });
    }
  };

  const handleCustomDate = (field: "from" | "to", value: string) => {
    update({
      range: "custom",
      from: field === "from" ? value : customFrom,
      to: field === "to" ? value : customTo,
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={range}
        onChange={(e) => handlePreset(e.target.value)}
        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        {PRESETS.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>

      {range === "custom" && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={customFrom}
            onChange={(e) => handleCustomDate("from", e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <span className="text-sm text-slate-400">to</span>
          <input
            type="date"
            value={customTo}
            onChange={(e) => handleCustomDate("to", e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      )}
    </div>
  );
}
