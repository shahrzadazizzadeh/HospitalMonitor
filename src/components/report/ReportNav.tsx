"use client";

const sections = [
  { id: "executive", label: "Executive" },
  { id: "grades", label: "Grades" },
  { id: "locations", label: "Locations" },
  { id: "microbiology", label: "Micro" },
  { id: "shifts", label: "Shifts" },
  { id: "recommendations", label: "Actions" },
  { id: "conclusion", label: "Summary" },
];

export default function ReportNav() {
  return (
    <nav className="sticky top-16 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 py-2 flex gap-1 overflow-x-auto">
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md whitespace-nowrap transition-colors"
          >
            {s.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
