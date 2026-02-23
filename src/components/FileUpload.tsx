"use client";

import { useState, useCallback } from "react";

interface UploadSummary {
  fileName: string;
  totalRows: number;
  imported: number;
  statuses: { compliant: number; alert: number; action: number };
  parseErrors: number;
  errors: string[];
}

export default function FileUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [summary, setSummary] = useState<UploadSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = useCallback(async (file: File) => {
    setIsUploading(true);
    setError(null);
    setSummary(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload failed");
        return;
      }

      setSummary(data.summary);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleUpload(file);
    },
    [handleUpload]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleUpload(file);
    },
    [handleUpload]
  );

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-slate-300 hover:border-slate-400"
        }`}
      >
        {isUploading ? (
          <div className="space-y-3">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-600">Processing file...</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-4xl text-slate-400">+</div>
            <p className="text-slate-600 font-medium">
              Drag & drop an Excel file here
            </p>
            <p className="text-sm text-slate-400">or</p>
            <label className="inline-block cursor-pointer px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Browse Files
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
            <p className="text-xs text-slate-400 mt-2">
              Supports .xlsx, .xls, .csv
            </p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Summary */}
      {summary && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
              &#10003;
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              Upload Complete
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-sm text-slate-500">File</p>
              <p className="font-medium text-slate-900 truncate">
                {summary.fileName}
              </p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-sm text-slate-500">Rows Imported</p>
              <p className="font-medium text-slate-900">{summary.imported}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-sm text-slate-500">Compliant</p>
              <p className="font-medium text-green-600">
                {summary.statuses.compliant}
              </p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-sm text-slate-500">Alerts / Actions</p>
              <p className="font-medium text-amber-600">
                {summary.statuses.alert} / {summary.statuses.action}
              </p>
            </div>
          </div>

          {summary.parseErrors > 0 && (
            <div className="text-sm text-amber-600">
              {summary.parseErrors} row(s) had parsing issues
            </div>
          )}

          <a
            href="/samples"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
          >
            View Imported Data &rarr;
          </a>
        </div>
      )}
    </div>
  );
}
