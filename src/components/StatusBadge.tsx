import { JobStatus, getStatusColor } from "@/lib/job-utils";

export default function StatusBadge({ status }: { status: JobStatus }) {
  const colors = getStatusColor(status);
  const labels = { healthy: "Healthy", failed: "Failed", pending: "Pending" };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      {labels[status]}
    </span>
  );
}
