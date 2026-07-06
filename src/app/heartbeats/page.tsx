import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import StatusBadge from "@/components/StatusBadge";
import { getJobStatus, timeAgo } from "@/lib/job-utils";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function HeartbeatsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const skip = (page - 1) * PAGE_SIZE;

  const [heartbeats, total] = await Promise.all([
    prisma.heartbeat.findMany({
      where: { job: { userId: session.user.id } },
      include: {
        job: { select: { name: true, expectedIntervalHours: true } },
      },
      orderBy: { receivedAt: "desc" },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.heartbeat.count({
      where: { job: { userId: session.user.id } },
    }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Heartbeat history</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            All recorded heartbeats across your monitors
          </p>
        </div>

        {heartbeats.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
            <p className="text-gray-500 text-sm">No heartbeats recorded yet.</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">
                        Job
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3">
                        Received at
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3">
                        Relative
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {heartbeats.map((hb) => {
                      const status = getJobStatus(
                        hb.receivedAt,
                        hb.job.expectedIntervalHours
                      );
                      return (
                        <tr key={hb.id} className="hover:bg-gray-50 transition">
                          <td className="px-5 py-3.5 font-medium text-gray-900">
                            {hb.job.name}
                          </td>
                          <td className="px-4 py-3.5 text-gray-600 font-mono text-xs">
                            {format(hb.receivedAt, "yyyy-MM-dd HH:mm:ss")}
                          </td>
                          <td className="px-4 py-3.5 text-gray-500 text-xs">
                            {timeAgo(hb.receivedAt)}
                          </td>
                          <td className="px-4 py-3.5">
                            <StatusBadge status={status} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-500">
                  Page {page} of {totalPages} — {total} total
                </p>
                <div className="flex gap-2">
                  {page > 1 && (
                    <a
                      href={`/heartbeats?page=${page - 1}`}
                      className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                    >
                      Previous
                    </a>
                  )}
                  {page < totalPages && (
                    <a
                      href={`/heartbeats?page=${page + 1}`}
                      className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                    >
                      Next
                    </a>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
