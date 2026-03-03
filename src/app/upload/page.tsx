import { prisma } from "@/lib/db";
import FileUpload from "@/components/FileUpload";
import DeleteUploadButton from "@/components/DeleteUploadButton";

export default async function UploadPage() {
  const uploads = await prisma.upload.findMany({
    orderBy: { uploadedAt: "desc" },
    include: {
      _count: { select: { samples: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Upload Data</h1>
        <p className="text-slate-500 mt-1">
          Import environmental monitoring data from Excel files
        </p>
      </div>

      <FileUpload />

      {/* Upload History */}
      {uploads.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Upload History
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="pb-2 pr-4">File Name</th>
                  <th className="pb-2 pr-4">Rows</th>
                  <th className="pb-2 pr-4">Samples</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2 pr-4">Uploaded</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {uploads.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="py-2.5 pr-4 font-medium text-slate-900 max-w-[250px] truncate">
                      {u.fileName}
                    </td>
                    <td className="py-2.5 pr-4 text-slate-600">
                      {u.rowCount.toLocaleString()}
                    </td>
                    <td className="py-2.5 pr-4 text-slate-600">
                      {u._count.samples.toLocaleString()}
                    </td>
                    <td className="py-2.5 pr-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          u.status === "processed"
                            ? "bg-green-100 text-green-700"
                            : u.status === "processing"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-slate-500">
                      {new Date(u.uploadedAt).toLocaleDateString()}{" "}
                      {new Date(u.uploadedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-2.5">
                      <DeleteUploadButton
                        uploadId={u.id}
                        fileName={u.fileName}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
