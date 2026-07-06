<<<<<<< HEAD
# PulseOps
=======
# PulseOps

**Cron job monitoring, simplified.** Know instantly when your scheduled jobs miss their window.

---

## Features

- Register / login (email + password, hashed with bcrypt)
- Create cron monitors with a name and expected interval
- Auto-generated heartbeat URL per monitor
- One-click copy of the heartbeat URL
- Status detection: **Healthy** / **Pending** / **Failed**
- Paginated heartbeat history
- Delete monitors
- Seed data for instant demo

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | Auth.js v5 (NextAuth) |
| Date utils | date-fns |

---

## Prerequisites

- Node.js 18+
- PostgreSQL running locally (or a free cloud DB like [Neon](https://neon.tech))

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/pulseops"
NEXTAUTH_SECRET="any-random-string-32-chars-or-more"
NEXTAUTH_URL="http://localhost:3000"
```

> For Neon/Supabase, paste the connection string from their dashboard.

### 3. Run database migrations

```bash
npx prisma migrate dev --name init
```

### 4. Generate Prisma client

```bash
npx prisma generate
```

### 5. Seed sample data

```bash
npm run db:seed
```

This creates:
- Demo user: `demo@pulseops.dev` / `password123`
- 3 sample monitors with heartbeat history

### 6. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Heartbeat API

Your cron job should POST to its heartbeat URL on successful completion:

```bash
curl -X POST http://localhost:3000/api/heartbeat/YOUR_TOKEN
```

### Response

```json
{
  "ok": true,
  "jobName": "Daily DB Backup",
  "receivedAt": "2026-01-15T10:30:00.000Z"
}
```

### Shell cron example

```bash
# In your crontab:
0 2 * * * /path/to/backup.sh && curl -sX POST https://yourdomain.com/api/heartbeat/abc123
```

---

## Status logic

| Status | Condition |
|---|---|
| **Pending** | No heartbeat received yet |
| **Healthy** | Last heartbeat ≤ expected interval ago |
| **Failed** | Last heartbeat > expected interval ago |

---

## Folder structure

```
pulseops/
├── prisma/
│   ├── schema.prisma        # DB models
│   └── seed.ts              # Seed script
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/        # Auth.js handlers
│   │   │   └── heartbeat/   # POST /api/heartbeat/[token]
│   │   ├── dashboard/       # Main dashboard
│   │   ├── heartbeats/      # History page
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── actions/
│   │   ├── auth.ts          # register, login, logout
│   │   └── jobs.ts          # create, delete, fetch
│   ├── components/
│   │   ├── CopyButton.tsx
│   │   ├── CreateJobModal.tsx
│   │   ├── DeleteJobButton.tsx
│   │   ├── Navbar.tsx
│   │   └── StatusBadge.tsx
│   ├── lib/
│   │   ├── auth.ts          # Auth.js config
│   │   ├── job-utils.ts     # Status logic + formatters
│   │   └── prisma.ts        # Prisma singleton
│   └── middleware.ts        # Route protection
├── .env.example
└── package.json
```

---

## Useful commands

```bash
npm run dev          # Start dev server
npm run db:migrate   # Run migrations
npm run db:seed      # Seed sample data
npm run db:studio    # Open Prisma Studio (DB browser)
npm run build        # Production build
```

---

## What's NOT in this MVP (v1 scope)

- Email/SMS alerts on failure
- Webhook integrations (Slack, Discord)
- Response time tracking
- Team/multi-user workspaces
- Analytics / uptime %
- Public status pages

These are planned for v2.
>>>>>>> 6b9a8c6 (Initial commit: PulseOps MVP)
