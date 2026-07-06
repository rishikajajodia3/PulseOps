import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean up
  await prisma.heartbeat.deleteMany();
  await prisma.job.deleteMany();
  await prisma.user.deleteMany();

  // Create test user
  const hashedPassword = await bcrypt.hash("password123", 10);
  const user = await prisma.user.create({
    data: {
      email: "demo@pulseops.dev",
      password: hashedPassword,
      name: "Demo User",
    },
  });

  // Job 1 - healthy (recent heartbeat)
  const job1 = await prisma.job.create({
    data: {
      name: "Daily DB Backup",
      heartbeatToken: "token-demo-backup-001",
      expectedIntervalHours: 24,
      userId: user.id,
    },
  });

  // Job 2 - pending (no heartbeats)
  await prisma.job.create({
    data: {
      name: "Weekly Report Generator",
      heartbeatToken: "token-demo-report-002",
      expectedIntervalHours: 168,
      userId: user.id,
    },
  });

  // Job 3 - failed (heartbeat too old)
  const job3 = await prisma.job.create({
    data: {
      name: "Hourly Data Sync",
      heartbeatToken: "token-demo-sync-003",
      expectedIntervalHours: 1,
      userId: user.id,
    },
  });

  // Heartbeats for job1 (healthy - last one recent)
  const now = new Date();
  await prisma.heartbeat.createMany({
    data: [
      { jobId: job1.id, receivedAt: new Date(now.getTime() - 1000 * 60 * 30), status: "ok" },
      { jobId: job1.id, receivedAt: new Date(now.getTime() - 1000 * 60 * 60 * 25), status: "ok" },
      { jobId: job1.id, receivedAt: new Date(now.getTime() - 1000 * 60 * 60 * 49), status: "ok" },
    ],
  });

  // Heartbeats for job3 (failed - last one 3 hours ago, interval is 1h)
  await prisma.heartbeat.createMany({
    data: [
      { jobId: job3.id, receivedAt: new Date(now.getTime() - 1000 * 60 * 60 * 3), status: "ok" },
      { jobId: job3.id, receivedAt: new Date(now.getTime() - 1000 * 60 * 60 * 4), status: "ok" },
      { jobId: job3.id, receivedAt: new Date(now.getTime() - 1000 * 60 * 60 * 5), status: "ok" },
    ],
  });

  console.log("✅ Seed complete!");
  console.log("📧 Login: demo@pulseops.dev");
  console.log("🔑 Password: password123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
