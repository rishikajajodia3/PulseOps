"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createJob(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const name = formData.get("name") as string;
  const expectedIntervalHours = parseFloat(
    formData.get("expectedIntervalHours") as string
  );

  if (!name || !expectedIntervalHours || expectedIntervalHours <= 0) {
    throw new Error("Invalid form data");
  }

  await prisma.job.create({
    data: {
      name,
      expectedIntervalHours,
      userId: session.user.id,
    },
  });

  revalidatePath("/dashboard");
}

export async function deleteJob(jobId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await prisma.job.deleteMany({
    where: { id: jobId, userId: session.user.id },
  });

  revalidatePath("/dashboard");
}

export async function getDashboardData() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const jobs = await prisma.job.findMany({
    where: { userId: session.user.id },
    include: {
      heartbeats: {
        orderBy: { receivedAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return jobs;
}
