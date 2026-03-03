"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface UploadSummary {
  fileName: string;
  totalRows: number;
  imported: number;
  statuses: { compliant: number; alert: number; action: number };
  parseErrors: number;
  errors: string[];
}

export default function FileUpload() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<UploadSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = useCallback(
    async (file: File) => {
      setIsUploading(true);
      setCurrentFile(file.name);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || `Upload failed for ${file.name}`);
          return;
        }

        setSummaries((prev) => [data.summary, ...prev]);
        router.refresh(); // refresh upload history table
      } catch {
        setError(`Network error uploading ${file.name}. Please try again.`);
      } finally {
        setIsUploading(false);
        setCurrentFile(null);
      }
    },
    [router]
  );

  const handleFiles = useCallback(
    async (files: FileList) => {
      for (const file of Array.from(files)) {
        await handleUpload(file);
      }
    },
    [handleUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
        e.target.value = ""; // reset so same file can be re-selected
      }
    },
    [handleFiles]
  );

  return (
    <div className="space-y-4">
      {/* Drop zone — always visible */}
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
            <p className="text-slate-600">
              Processing <span className="font-medium">{currentFile}</span>...
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-4xl text-slate-400">+</div>
            <p className="text-slate-600 font-medium">
              Drag & drop Excel files here
            </p>
            <p className="text-sm text-slate-400">or</p>
            <label className="inline-block cursor-pointer px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Browse Files
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
            <p className="text-xs text-slate-400 mt-2">
              Supports .xlsx, .xls, .csv — select multiple files at once
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

      {/* Summaries for files uploaded this session */}
      {summaries.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-700">
            Just Uploaded ({summaries.length} file
            {summaries.length > 1 ? "s" : ""})
          </h3>
          {summaries.map((s, i) => (
            <div
              key={`${s.fileName}-${i}`}
              className="bg-white border border-slate-200 rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                  &#10003;
                </div>
                <span className="font-medium text-slate-900 truncate">
                  {s.fileName}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 rounded-lg p-2.5">
                  <p className="text-xs text-slate-500">Rows Imported</p>
                  <p className="font-medium text-slate-900">{s.imported}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2.5">
                  <p className="text-xs text-slate-500">Compliant</p>
                  <p className="font-medium text-green-600">
                    {s.statuses.compliant}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2.5">
                  <p className="text-xs text-slate-500">Alerts</p>
                  <p className="font-medium text-amber-600">
                    {s.statuses.alert}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2.5">
                  <p className="text-xs text-slate-500">Actions</p>
                  <p className="font-medium text-red-600">
                    {s.statuses.action}
                  </p>
                </div>
              </div>
              {s.parseErrors > 0 && (
                <p className="text-xs text-amber-600 mt-2">
                  {s.parseErrors} row(s) had parsing issues
                </p>
              )}
            </div>
          ))}
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
