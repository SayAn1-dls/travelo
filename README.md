# Travelo Masterpiece 🌍

> **The institutional-grade travel intelligence platform for elite group expeditions.**

Built with Next.js 15 (Turbopack), Prisma ORM, Tailwind CSS, and GPT-4o intelligence.

---

## Architecture

```
travelo/
├── src/
│   ├── app/                    # Next.js 15 App Router
│   │   ├── dashboard/          # Mission Control
│   │   ├── ledger/             # Capital Ledger (Min-Cash-Flow)
│   │   ├── planner/            # Expedition Planner
│   │   ├── intelligence/       # AI Concierge (GPT-4o)
│   │   └── api/                # REST API Routes
│   ├── components/ui/          # 15+ Elite UI Components
│   ├── lib/                    # Core Utilities (Prisma, Algorithms)
│   ├── types/                  # TypeScript Domain Interfaces
│   ├── hooks/                  # Custom React Hooks
│   └── utils/                  # Helpers & Formatters
├── prisma/
│   └── schema.prisma           # Database Schema
└── ...config files
```

---

## Core Modules

### 💰 Capital Ledger
Multi-member group expense tracker powered by the **Min-Cash-Flow** algorithm — computes the minimum number of transactions to settle all debts within the group.

### 🗺️ Expedition Planner
Day-by-day itinerary builder with destination intelligence, time-blocking, and shared editing.

### 🤖 AI Concierge
GPT-4o powered travel intelligence that recommends restaurants, activities, and budgets based on your group's profile.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (Turbopack) |
| Language | TypeScript 5.x |
| Styling | Tailwind CSS v3 + Glassmorphism |
| ORM | Prisma 5.x |
| Database | PostgreSQL |
| AI | OpenAI GPT-4o |
| Deployment | Vercel |

---

## Environment Setup

```bash
cp .env.example .env.local
npm install
npx prisma generate
npx prisma db push
npm run dev
```

---

## Commit Cadence

This repository follows **atomic commits** — every logical change is isolated, traceable, and revertible. Built for engineering excellence.

---

*Travelo Masterpiece — v2.0.0 | Crafted for elite expeditions.*
