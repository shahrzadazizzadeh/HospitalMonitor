import { getReportData } from "@/lib/report-queries";
import ReportNav from "@/components/report/ReportNav";
import PrintButton from "@/components/report/PrintButton";
import ExecutiveOverview from "@/components/report/ExecutiveOverview";
import GradePerformance from "@/components/report/GradePerformance";
import LocationPerformance from "@/components/report/LocationPerformance";
import MicrobiologyAnalysis from "@/components/report/MicrobiologyAnalysis";
import ShiftAnalysis from "@/components/report/ShiftAnalysis";
import Recommendations from "@/components/report/Recommendations";
import ExecutiveConclusion from "@/components/report/ExecutiveConclusion";

export const dynamic = "force-dynamic";

export default async function ReportPage() {
  const data = await getReportData();

  return (
    <>
      <ReportNav />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Manager Report
            </h1>
            <p className="text-slate-500 mt-1">
              {data.facilityName} — Environmental Monitoring Summary
            </p>
            <p className="text-sm text-slate-400 mt-0.5">
              {data.dateRange.from} – {data.dateRange.to}
            </p>
          </div>
          <PrintButton />
        </div>

        <ExecutiveOverview
          totalSamples={data.totalSamples}
          complianceRate={data.complianceRate}
          totalLocations={data.totalLocations}
          totalAlerts={data.totalAlerts}
          totalActions={data.totalActions}
          monthlyTrends={data.monthlyTrends}
          typeBreakdown={data.typeBreakdown}
        />

        <GradePerformance
          gradeMetrics={data.gradeMetrics}
          gradeTrends={data.gradeTrends}
        />

        <LocationPerformance locationMetrics={data.locationMetrics} />

        <MicrobiologyAnalysis
          topOrganisms={data.topOrganisms}
          gramTypeBreakdown={data.gramTypeBreakdown}
          contaminationSources={data.contaminationSources}
          riskBreakdown={data.riskBreakdown}
        />

        <ShiftAnalysis
          shiftMetrics={data.shiftMetrics}
          shiftTypeCrossTab={data.shiftTypeCrossTab}
        />

        <Recommendations recommendations={data.recommendations} />

        <ExecutiveConclusion
          facilityName={data.facilityName}
          reportDate={data.reportDate}
          dateRange={data.dateRange}
          overallRisk={data.overallRisk}
          summaryText={data.summaryText}
          complianceRate={data.complianceRate}
          totalSamples={data.totalSamples}
        />
      </div>
    </>
  );
}
