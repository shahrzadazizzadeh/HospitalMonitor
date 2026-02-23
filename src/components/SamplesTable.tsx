"use client";

import { useState, useMemo } from "react";
import StatusBadge from "./StatusBadge";

interface Sample {
  id: string;
  sampleDate: string;
  sampleType: string;
  cfuCount: number;
  actionLimit: number;
  alertLimit: number;
  status: string;
  location: { locationId: string; nameHe: string | null };
  organism: { name: string } | null;
}

type SortField =
  | "sampleDate"
  | "locationId"
  | "sampleType"
  | "cfuCount"
  | "status"
  | "organism";
type SortDir = "asc" | "desc";

export default function SamplesTable({ samples }: { samples: Sample[] }) {
  const [sortField, setSortField] = useState<SortField>("sampleDate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [filterType, setFilterType] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const sampleTypes = useMemo(
    () => [...new Set(samples.map((s) => s.sampleType))].sort(),
    [samples]
  );
  const locations = useMemo(
    () =>
      [...new Set(samples.map((s) => s.location.locationId))].sort(),
    [samples]
  );

  const filtered = useMemo(() => {
    let result = samples;
    if (filterType) result = result.filter((s) => s.sampleType === filterType);
    if (filterLocation)
      result = result.filter(
        (s) => s.location.locationId === filterLocation
      );
    if (filterStatus) result = result.filter((s) => s.status === filterStatus);
    return result;
  }, [samples, filterType, filterLocation, filterStatus]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;
      switch (sortField) {
        case "sampleDate":
          aVal = a.sampleDate;
          bVal = b.sampleDate;
          break;
        case "locationId":
          aVal = a.location.locationId;
          bVal = b.location.locationId;
          break;
        case "sampleType":
          aVal = a.sampleType;
          bVal = b.sampleType;
          break;
        case "cfuCount":
          aVal = a.cfuCount;
          bVal = b.cfuCount;
          break;
        case "status":
          aVal = a.status;
          bVal = b.status;
          break;
        case "organism":
          aVal = a.organism?.name || "";
          bVal = b.organism?.name || "";
          break;
        default:
          return 0;
      }
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortField, sortDir]);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  function SortHeader({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) {
    return (
      <th
        className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 select-none"
        onClick={() => toggleSort(field)}
      >
        <span className="flex items-center gap-1">
          {children}
          {sortField === field && (
            <span className="text-blue-500">
              {sortDir === "asc" ? "\u2191" : "\u2193"}
            </span>
          )}
        </span>
      </th>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
        >
          <option value="">All Sample Types</option>
          {sampleTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          value={filterLocation}
          onChange={(e) => setFilterLocation(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
        >
          <option value="">All Locations</option>
          {locations.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
        >
          <option value="">All Statuses</option>
          <option value="compliant">Compliant</option>
          <option value="alert">Alert</option>
          <option value="action">Action</option>
        </select>
        <span className="flex items-center text-sm text-slate-500">
          {sorted.length} of {samples.length} samples
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <SortHeader field="sampleDate">Date</SortHeader>
              <SortHeader field="locationId">Location</SortHeader>
              <SortHeader field="sampleType">Sample Type</SortHeader>
              <SortHeader field="cfuCount">CFU</SortHeader>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Alert Limit
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Action Limit
              </th>
              <SortHeader field="organism">Organism</SortHeader>
              <SortHeader field="status">Status</SortHeader>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map((sample) => (
              <tr key={sample.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm text-slate-900 whitespace-nowrap">
                  {new Date(sample.sampleDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="text-slate-900">
                    {sample.location.locationId}
                  </div>
                  {sample.location.nameHe && (
                    <div className="text-xs text-slate-500" dir="rtl">
                      {sample.location.nameHe}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  {sample.sampleType}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-slate-900">
                  {sample.cfuCount}
                </td>
                <td className="px-4 py-3 text-sm text-slate-500">
                  {sample.alertLimit}
                </td>
                <td className="px-4 py-3 text-sm text-slate-500">
                  {sample.actionLimit}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  {sample.organism?.name || "—"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={sample.status} />
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-12 text-center text-slate-400"
                >
                  No samples found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
