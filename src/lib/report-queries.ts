import { prisma } from "@/lib/db";

// ─── Types ───────────────────────────────────────────────────────────

export interface MonthlyTrend {
  month: string; // "2024-01"
  total: number;
  compliant: number;
  alert: number;
  action: number;
  complianceRate: number;
  avgCfu: number;
}

export interface TypeBreakdown {
  type: string;
  count: number;
  pct: number;
}

export interface GradeMetrics {
  grade: string;
  total: number;
  compliant: number;
  alert: number;
  action: number;
  complianceRate: number;
  avgCfu: number;
}

export interface GradeTrend {
  month: string;
  grade: string;
  complianceRate: number;
  avgCfu: number;
}

export interface LocationMetrics {
  locationId: string;
  name: string;
  nameHe: string | null;
  grade: string | null;
  total: number;
  compliant: number;
  excursions: number;
  complianceRate: number;
  avgCfu: number;
}

export interface OrganismMetrics {
  name: string;
  count: number;
  pct: number;
  gramType: string | null;
  riskLevel: string | null;
}

export interface GramTypeBreakdown {
  gramType: string;
  count: number;
  pct: number;
}

export interface ContaminationSourceBreakdown {
  source: string;
  count: number;
  pct: number;
}

export interface RiskBreakdown {
  level: string;
  count: number;
  pct: number;
}

export interface ShiftMetrics {
  shift: string;
  total: number;
  compliant: number;
  complianceRate: number;
  avgCfu: number;
  alert: number;
  action: number;
}

export interface ShiftTypeCrossTab {
  shift: string;
  type: string;
  count: number;
  avgCfu: number;
}

export interface Recommendation {
  severity: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  detail: string;
}

export interface ReportData {
  // Meta
  facilityName: string;
  reportDate: string;
  dateRange: { from: string; to: string };

  // Executive overview
  totalSamples: number;
  complianceRate: number;
  totalLocations: number;
  totalAlerts: number;
  totalActions: number;
  monthlyTrends: MonthlyTrend[];
  typeBreakdown: TypeBreakdown[];

  // Grade performance
  gradeMetrics: GradeMetrics[];
  gradeTrends: GradeTrend[];

  // Location performance
  locationMetrics: LocationMetrics[];

  // Microbiology
  topOrganisms: OrganismMetrics[];
  gramTypeBreakdown: GramTypeBreakdown[];
  contaminationSources: ContaminationSourceBreakdown[];
  riskBreakdown: RiskBreakdown[];

  // Shift analysis
  shiftMetrics: ShiftMetrics[];
  shiftTypeCrossTab: ShiftTypeCrossTab[];

  // Recommendations
  recommendations: Recommendation[];

  // Conclusion
  overallRisk: "LOW" | "MEDIUM" | "HIGH";
  summaryText: string;
}

// ─── Main Query ──────────────────────────────────────────────────────

export async function getReportData(): Promise<ReportData> {
  const samples = await prisma.sample.findMany({
    include: {
      location: true,
      organism: true,
    },
    orderBy: { sampleDate: "asc" },
  });

  const facility = await prisma.facility.findFirst();
  const facilityName = facility?.name || "Facility";

  const totalSamples = samples.length;
  const compliantCount = samples.filter((s) => s.status === "compliant").length;
  const alertCount = samples.filter((s) => s.status === "alert").length;
  const actionCount = samples.filter((s) => s.status === "action").length;
  const complianceRate =
    totalSamples > 0
      ? Math.round((compliantCount / totalSamples) * 1000) / 10
      : 0;

  const locations = await prisma.location.findMany();
  const totalLocations = locations.length;

  // Date range
  const dates = samples.map((s) => s.sampleDate);
  const minDate = dates.length > 0 ? new Date(Math.min(...dates.map((d) => d.getTime()))) : new Date();
  const maxDate = dates.length > 0 ? new Date(Math.max(...dates.map((d) => d.getTime()))) : new Date();

  // ─── Monthly Trends ───
  const monthMap = new Map<
    string,
    { total: number; compliant: number; alert: number; action: number; cfuSum: number }
  >();
  for (const s of samples) {
    const d = new Date(s.sampleDate);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!monthMap.has(key))
      monthMap.set(key, { total: 0, compliant: 0, alert: 0, action: 0, cfuSum: 0 });
    const m = monthMap.get(key)!;
    m.total++;
    if (s.status === "compliant") m.compliant++;
    else if (s.status === "alert") m.alert++;
    else if (s.status === "action") m.action++;
    m.cfuSum += s.cfuCount;
  }
  const monthlyTrends: MonthlyTrend[] = Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, m]) => ({
      month,
      ...m,
      complianceRate:
        m.total > 0 ? Math.round((m.compliant / m.total) * 1000) / 10 : 0,
      avgCfu: m.total > 0 ? Math.round((m.cfuSum / m.total) * 10) / 10 : 0,
    }));

  // ─── Type Breakdown ───
  const typeMap = new Map<string, number>();
  for (const s of samples) {
    typeMap.set(s.sampleType, (typeMap.get(s.sampleType) || 0) + 1);
  }
  const typeBreakdown: TypeBreakdown[] = Array.from(typeMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => ({
      type,
      count,
      pct: totalSamples > 0 ? Math.round((count / totalSamples) * 1000) / 10 : 0,
    }));

  // ─── Grade Metrics ───
  const gradeMap = new Map<
    string,
    { total: number; compliant: number; alert: number; action: number; cfuSum: number }
  >();
  for (const s of samples) {
    const grade = s.gmpGrade || "Unknown";
    if (!gradeMap.has(grade))
      gradeMap.set(grade, { total: 0, compliant: 0, alert: 0, action: 0, cfuSum: 0 });
    const g = gradeMap.get(grade)!;
    g.total++;
    if (s.status === "compliant") g.compliant++;
    else if (s.status === "alert") g.alert++;
    else if (s.status === "action") g.action++;
    g.cfuSum += s.cfuCount;
  }
  const gradeMetrics: GradeMetrics[] = Array.from(gradeMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([grade, g]) => ({
      grade,
      ...g,
      complianceRate:
        g.total > 0 ? Math.round((g.compliant / g.total) * 1000) / 10 : 0,
      avgCfu: g.total > 0 ? Math.round((g.cfuSum / g.total) * 10) / 10 : 0,
    }));

  // ─── Grade Trends (by month) ───
  const gradeTrendMap = new Map<string, Map<string, { total: number; compliant: number; cfuSum: number }>>();
  for (const s of samples) {
    const d = new Date(s.sampleDate);
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const grade = s.gmpGrade || "Unknown";
    const key = `${month}|${grade}`;
    if (!gradeTrendMap.has(month)) gradeTrendMap.set(month, new Map());
    const monthGrades = gradeTrendMap.get(month)!;
    if (!monthGrades.has(grade)) monthGrades.set(grade, { total: 0, compliant: 0, cfuSum: 0 });
    const g = monthGrades.get(grade)!;
    g.total++;
    if (s.status === "compliant") g.compliant++;
    g.cfuSum += s.cfuCount;
  }
  const gradeTrends: GradeTrend[] = [];
  for (const [month, grades] of Array.from(gradeTrendMap.entries()).sort(([a], [b]) => a.localeCompare(b))) {
    for (const [grade, g] of grades) {
      gradeTrends.push({
        month,
        grade,
        complianceRate: g.total > 0 ? Math.round((g.compliant / g.total) * 1000) / 10 : 0,
        avgCfu: g.total > 0 ? Math.round((g.cfuSum / g.total) * 10) / 10 : 0,
      });
    }
  }

  // ─── Location Metrics ───
  const locMap = new Map<
    string,
    { name: string; nameHe: string | null; grade: string | null; total: number; compliant: number; excursions: number; cfuSum: number }
  >();
  for (const s of samples) {
    const lid = s.location.locationId;
    if (!locMap.has(lid))
      locMap.set(lid, {
        name: s.location.name,
        nameHe: s.location.nameHe,
        grade: s.location.grade,
        total: 0,
        compliant: 0,
        excursions: 0,
        cfuSum: 0,
      });
    const l = locMap.get(lid)!;
    l.total++;
    if (s.status === "compliant") l.compliant++;
    else l.excursions++;
    l.cfuSum += s.cfuCount;
  }
  const locationMetrics: LocationMetrics[] = Array.from(locMap.entries())
    .map(([locationId, l]) => ({
      locationId,
      ...l,
      complianceRate:
        l.total > 0 ? Math.round((l.compliant / l.total) * 1000) / 10 : 0,
      avgCfu: l.total > 0 ? Math.round((l.cfuSum / l.total) * 10) / 10 : 0,
    }))
    .sort((a, b) => a.complianceRate - b.complianceRate); // worst first

  // ─── Microbiology ───
  const orgMap = new Map<string, { count: number; gramType: string | null; riskLevel: string | null }>();
  const samplesWithOrganism = samples.filter((s) => s.organism && s.organism.name !== "No Growth");
  for (const s of samplesWithOrganism) {
    const name = s.organism!.name;
    if (!orgMap.has(name))
      orgMap.set(name, { count: 0, gramType: s.organism!.gramType, riskLevel: s.organism!.riskLevel });
    orgMap.get(name)!.count++;
  }
  const orgTotal = samplesWithOrganism.length;
  const topOrganisms: OrganismMetrics[] = Array.from(orgMap.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)
    .map(([name, o]) => ({
      name,
      count: o.count,
      pct: orgTotal > 0 ? Math.round((o.count / orgTotal) * 1000) / 10 : 0,
      gramType: o.gramType,
      riskLevel: o.riskLevel,
    }));

  // Gram type breakdown
  const gramMap = new Map<string, number>();
  for (const s of samplesWithOrganism) {
    const gt = s.organism!.gramType || "Unknown";
    gramMap.set(gt, (gramMap.get(gt) || 0) + 1);
  }
  const gramTypeBreakdown: GramTypeBreakdown[] = Array.from(gramMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([gramType, count]) => ({
      gramType,
      count,
      pct: orgTotal > 0 ? Math.round((count / orgTotal) * 1000) / 10 : 0,
    }));

  // Contamination sources
  const csMap = new Map<string, number>();
  for (const s of samples) {
    const src = s.contaminationSource || "Unknown";
    if (src !== "N/A" && src !== "Unknown") {
      csMap.set(src, (csMap.get(src) || 0) + 1);
    }
  }
  const csTotal = Array.from(csMap.values()).reduce((a, b) => a + b, 0);
  const contaminationSources: ContaminationSourceBreakdown[] = Array.from(csMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([source, count]) => ({
      source,
      count,
      pct: csTotal > 0 ? Math.round((count / csTotal) * 1000) / 10 : 0,
    }));

  // Risk breakdown
  const riskMap = new Map<string, number>();
  for (const s of samples) {
    const rl = s.organism?.riskLevel || "Unknown";
    riskMap.set(rl, (riskMap.get(rl) || 0) + 1);
  }
  const riskBreakdown: RiskBreakdown[] = Array.from(riskMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([level, count]) => ({
      level,
      count,
      pct: totalSamples > 0 ? Math.round((count / totalSamples) * 1000) / 10 : 0,
    }));

  // ─── Shift Analysis ───
  const shiftMap = new Map<
    string,
    { total: number; compliant: number; alert: number; action: number; cfuSum: number }
  >();
  for (const s of samples) {
    const shift = s.shift || "Unknown";
    if (!shiftMap.has(shift))
      shiftMap.set(shift, { total: 0, compliant: 0, alert: 0, action: 0, cfuSum: 0 });
    const sh = shiftMap.get(shift)!;
    sh.total++;
    if (s.status === "compliant") sh.compliant++;
    else if (s.status === "alert") sh.alert++;
    else if (s.status === "action") sh.action++;
    sh.cfuSum += s.cfuCount;
  }
  const shiftMetrics: ShiftMetrics[] = Array.from(shiftMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([shift, sh]) => ({
      shift,
      ...sh,
      complianceRate:
        sh.total > 0 ? Math.round((sh.compliant / sh.total) * 1000) / 10 : 0,
      avgCfu: sh.total > 0 ? Math.round((sh.cfuSum / sh.total) * 10) / 10 : 0,
    }));

  // Shift x Type cross-tab
  const stMap = new Map<string, { count: number; cfuSum: number }>();
  for (const s of samples) {
    const shift = s.shift || "Unknown";
    const key = `${shift}|${s.sampleType}`;
    if (!stMap.has(key)) stMap.set(key, { count: 0, cfuSum: 0 });
    const entry = stMap.get(key)!;
    entry.count++;
    entry.cfuSum += s.cfuCount;
  }
  const shiftTypeCrossTab: ShiftTypeCrossTab[] = Array.from(stMap.entries())
    .map(([key, v]) => {
      const [shift, type] = key.split("|");
      return {
        shift,
        type,
        count: v.count,
        avgCfu: v.count > 0 ? Math.round((v.cfuSum / v.count) * 10) / 10 : 0,
      };
    })
    .sort((a, b) => a.shift.localeCompare(b.shift) || a.type.localeCompare(b.type));

  // ─── Recommendations ───
  const recommendations: Recommendation[] = [];

  // High-excursion locations
  const highExcursionLocations = locationMetrics.filter(
    (l) => l.complianceRate < 60 && l.total >= 3
  );
  for (const loc of highExcursionLocations) {
    recommendations.push({
      severity: "HIGH",
      title: `High excursion rate at ${loc.name}`,
      detail: `Location ${loc.name} has a compliance rate of ${loc.complianceRate}% with ${loc.excursions} excursions out of ${loc.total} samples. Immediate investigation recommended.`,
    });
  }

  // Medium-excursion locations
  const medExcursionLocations = locationMetrics.filter(
    (l) => l.complianceRate >= 60 && l.complianceRate < 80 && l.total >= 3
  );
  for (const loc of medExcursionLocations) {
    recommendations.push({
      severity: "MEDIUM",
      title: `Elevated excursion rate at ${loc.name}`,
      detail: `Location ${loc.name} has a compliance rate of ${loc.complianceRate}% — consider increased monitoring frequency.`,
    });
  }

  // Recurring organisms
  const recurringOrg = topOrganisms.filter((o) => o.count >= 5);
  for (const org of recurringOrg) {
    recommendations.push({
      severity: "MEDIUM",
      title: `Recurring organism: ${org.name}`,
      detail: `${org.name} was identified in ${org.count} samples (${org.pct}%). Evaluate cleaning procedures and source investigation.`,
    });
  }

  // Shift gaps
  const worstShift = shiftMetrics.reduce(
    (worst, s) => (s.complianceRate < worst.complianceRate ? s : worst),
    shiftMetrics[0]
  );
  if (worstShift && worstShift.complianceRate < complianceRate - 5) {
    recommendations.push({
      severity: "MEDIUM",
      title: `${worstShift.shift} shift has lower compliance`,
      detail: `The ${worstShift.shift} shift shows ${worstShift.complianceRate}% compliance vs. ${complianceRate}% overall. Review staffing and procedures during this shift.`,
    });
  }

  // Grade A vigilance
  const gradeA = gradeMetrics.find((g) => g.grade === "Grade A");
  if (gradeA && gradeA.complianceRate < 99) {
    recommendations.push({
      severity: "HIGH",
      title: "Grade A compliance below target",
      detail: `Grade A compliance is ${gradeA.complianceRate}% (target: 99%). Any excursion in Grade A requires immediate investigation per GMP guidelines.`,
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      severity: "LOW",
      title: "All metrics within acceptable ranges",
      detail: "No critical issues identified. Continue routine monitoring and trending.",
    });
  }

  // Sort by severity
  const sevOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  recommendations.sort((a, b) => sevOrder[a.severity] - sevOrder[b.severity]);

  // ─── Conclusion ───
  const highCount = recommendations.filter((r) => r.severity === "HIGH").length;
  const medCount = recommendations.filter((r) => r.severity === "MEDIUM").length;
  const overallRisk: "LOW" | "MEDIUM" | "HIGH" =
    highCount >= 2 || complianceRate < 60
      ? "HIGH"
      : highCount >= 1 || medCount >= 3 || complianceRate < 80
        ? "MEDIUM"
        : "LOW";

  const summaryText = `During the reporting period (${minDate.toLocaleDateString()} – ${maxDate.toLocaleDateString()}), ${totalSamples} environmental monitoring samples were collected across ${totalLocations} locations. The overall compliance rate was ${complianceRate}%, with ${alertCount} alert-level and ${actionCount} action-level excursions recorded. ${
    highCount > 0
      ? `${highCount} high-priority finding(s) require immediate attention.`
      : "No high-priority findings require immediate attention."
  }`;

  return {
    facilityName,
    reportDate: new Date().toLocaleDateString(),
    dateRange: {
      from: minDate.toLocaleDateString(),
      to: maxDate.toLocaleDateString(),
    },
    totalSamples,
    complianceRate,
    totalLocations,
    totalAlerts: alertCount,
    totalActions: actionCount,
    monthlyTrends,
    typeBreakdown,
    gradeMetrics,
    gradeTrends,
    locationMetrics,
    topOrganisms,
    gramTypeBreakdown,
    contaminationSources,
    riskBreakdown,
    shiftMetrics,
    shiftTypeCrossTab,
    recommendations,
    overallRisk,
    summaryText,
  };
}
