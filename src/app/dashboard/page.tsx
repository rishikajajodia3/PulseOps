import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import StatusBadge from "@/components/StatusBadge";
import CopyButton from "@/components/CopyButton";
import CreateJobModal from "@/components/CreateJobModal";
import DeleteJobButton from "@/components/DeleteJobButton";
import { getJobStatus, timeAgo, formatInterval } from "@/lib/job-utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const jobs = await prisma.job.findMany({
    where: { userId: session.user.id },
    include: {
      heartbeats: {
        orderBy: { receivedAt: "desc" },
        take: 1,
      },
      _count: { select: { heartbeats: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const jobsWithStatus = jobs.map((job) => ({
    ...job,
    status: getJobStatus(
      job.heartbeats[0]?.receivedAt ?? null,
      job.expectedIntervalHours
    ),
    lastHeartbeat: job.heartbeats[0]?.receivedAt ?? null,
  }));

  const total = jobsWithStatus.length;
  const healthy = jobsWithStatus.filter((j) => j.status === "healthy").length;
  const failed = jobsWithStatus.filter((j) => j.status === "failed").length;
  const pending = jobsWithStatus.filter((j) => j.status === "pending").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Monitor your scheduled jobs
            </p>
          </div>
          <CreateJobModal />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{total}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide">Healthy</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{healthy}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs font-medium text-red-500 uppercase tracking-wide">Failed</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{failed}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs font-medium text-amber-500 uppercase tracking-wide">Pending</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{pending}</p>
          </div>
        </div>

        {/* Jobs table */}
        {jobs.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-medium text-gray-900 mb-1">No monitors yet</h3>
            <p className="text-sm text-gray-500 mb-4">
              Create your first monitor to start tracking cron jobs
            </p>
            <CreateJobModal />
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">
                      Job name
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3">
                      Interval
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3">
                      Last heartbeat
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3">
                      Status
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3">
                      Heartbeat URL
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {jobsWithStatus.map((job) => {
                    const url = `${baseUrl}/api/heartbeat/${job.heartbeatToken}`;
                    return (
                      <tr key={job.id} className="hover:bg-gray-50 transition">
                        <td className="px-5 py-4">
                          <div className="font-medium text-gray-900">{job.name}</div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {job._count.heartbeats} pings total
                          </div>
                        </td>
                        <td className="px-4 py-4 text-gray-600">
                          {formatInterval(job.expectedIntervalHours)}
                        </td>
                        <td className="px-4 py-4 text-gray-600">
                          {timeAgo(job.lastHeartbeat)}
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={job.status} />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-mono max-w-[200px] truncate">
                              {url}
                            </code>
                            <CopyButton text={url} />
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <DeleteJobButton jobId={job.id} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Usage hint */}
        {jobs.length > 0 && (
          <div className="mt-6 bg-slate-800 rounded-xl p-4">
            <p className="text-xs font-medium text-slate-400 mb-2">Quick start — add this to your cron job</p>
            <code className="text-xs text-emerald-400 font-mono">
              curl -X POST {baseUrl}/api/heartbeat/YOUR_TOKEN
            </code>
          </div>
        )}
      </main>
    </div>
  );
}
