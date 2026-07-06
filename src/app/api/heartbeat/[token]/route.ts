import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const job = await prisma.job.findUnique({
    where: { heartbeatToken: token },
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const heartbeat = await prisma.heartbeat.create({
    data: {
      jobId: job.id,
      status: "ok",
    },
  });

  return NextResponse.json({
    ok: true,
    jobId: job.id,
    jobName: job.name,
    receivedAt: heartbeat.receivedAt,
  });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const job = await prisma.job.findUnique({
    where: { heartbeatToken: token },
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    message: "Use POST to record a heartbeat",
    jobName: job.name,
  });
}
