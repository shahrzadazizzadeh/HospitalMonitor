import type { Recommendation } from "@/lib/report-queries";

interface Props {
  recommendations: Recommendation[];
}

function getSeverityStyle(severity: string) {
  switch (severity) {
    case "HIGH":
      return "border-l-red-500 bg-red-50";
    case "MEDIUM":
      return "border-l-amber-500 bg-amber-50";
    default:
      return "border-l-emerald-500 bg-emerald-50";
  }
}

function getSeverityBadge(severity: string) {
  switch (severity) {
    case "HIGH":
      return "bg-red-100 text-red-700";
    case "MEDIUM":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-emerald-100 text-emerald-700";
  }
}

export default function Recommendations({ recommendations }: Props) {
  return (
    <section id="recommendations" className="space-y-6">
      <h2 className="text-xl font-bold text-slate-800 border-b pb-2">
        6. Recommendations &amp; Action Items
      </h2>

      <div className="space-y-3">
        {recommendations.map((rec, i) => (
          <div
            key={i}
            className={`border border-slate-200 border-l-4 rounded-xl p-4 ${getSeverityStyle(rec.severity)}`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${getSeverityBadge(rec.severity)}`}
              >
                {rec.severity}
              </span>
              <div>
                <h4 className="text-sm font-semibold text-slate-800">
                  {rec.title}
                </h4>
                <p className="text-sm text-slate-600 mt-1">{rec.detail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
