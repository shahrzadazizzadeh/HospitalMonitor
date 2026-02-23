import FileUpload from "@/components/FileUpload";

export default function UploadPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Upload Data</h1>
        <p className="text-slate-500 mt-1">
          Import environmental monitoring data from Excel files
        </p>
      </div>
      <FileUpload />
    </div>
  );
}
