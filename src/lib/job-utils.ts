import { formatDistanceToNow } from "date-fns";

export type JobStatus = "healthy" | "failed" | "pending";

export function getJobStatus(
  latestHeartbeat: Date | null,
  expectedIntervalHours: number
): JobStatus {
  if (!latestHeartbeat) return "pending";
  const now = new Date();
  const diffMs = now.getTime() - latestHeartbeat.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours <= expectedIntervalHours ? "healthy" : "failed";
}

export function timeAgo(date: Date | null): string {
  if (!date) return "Never";
  return formatDistanceToNow(date, { addSuffix: true });
}

export function formatInterval(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours === 1) return "1 hour";
  if (hours < 24) return `${hours} hours`;
  if (hours === 24) return "1 day";
  return `${Math.round(hours / 24)} days`;
}

export function getStatusColor(status: JobStatus) {
  switch (status) {
    case "healthy":
      return {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        dot: "bg-emerald-500",
        border: "border-emerald-200",
      };
    case "failed":
      return {
        bg: "bg-red-50",
        text: "text-red-700",
        dot: "bg-red-500",
        border: "border-red-200",
      };
    case "pending":
      return {
        bg: "bg-amber-50",
        text: "text-amber-700",
        dot: "bg-amber-400",
        border: "border-amber-200",
      };
  }
}
