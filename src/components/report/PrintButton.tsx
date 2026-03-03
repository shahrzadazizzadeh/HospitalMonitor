"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      data-print-hide
      className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
    >
      Print / Save PDF
    </button>
  );
}
