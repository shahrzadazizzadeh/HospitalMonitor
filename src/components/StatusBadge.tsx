const statusConfig = {
  compliant: { label: "Compliant", className: "bg-green-100 text-green-800" },
  alert: { label: "Alert", className: "bg-yellow-100 text-yellow-800" },
  action: { label: "Action", className: "bg-red-100 text-red-800" },
} as const;

export default function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: status,
    className: "bg-gray-100 text-gray-800",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
