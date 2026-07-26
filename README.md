# Travelo Executive

> Institutional-grade group travel logistics, capital management, and debt settlement.

## Overview

Travelo Executive is a high-performance group travel coordination platform purpose-built for precision financial tracking. It replaces fragmented group chats and spreadsheets with a unified **Capital Ledger Engine** that tracks every rupee from the moment trip planning begins.

## Core Systems

### Capital Ledger Engine
- Real-time capital pool aggregation across all participants
- Budget ceiling vs. actual expenditure tracking with colour-coded health bars
- Automated over/under-budget alert thresholds

### Dynamic Participant Roster
- N-person roster generation from a single integer input
- Individual contribution recording per member
- Per-member debt/credit balance tracking

### Min-Cash-Flow Debt Settlement
- Greedy O(n^2) Minimum Cash Flow algorithm
- Computes the fewest transactions needed to settle all group debts
- Settlement plan rendered in real-time as expenses are logged

### UPI Payment Handoff
- Deep-link intent to GPay, PhonePe, Paytm, and BHIM UPI
- Post-confirmation ledger deduction and status update
- Automated settlement notifications dispatched to all group members

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + CSS custom properties |
| Icons | Lucide React |
| Typography | EB Garamond (display) · Inter (body) |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Architecture

```
src/
├── app/
│   ├── page.tsx              # Marketing landing
│   ├── planning/page.tsx     # 4-step trip configuration wizard
│   └── ledger/page.tsx       # Live Capital Ledger dashboard
├── components/
│   ├── layout/Header.tsx     # Sticky masthead with theme toggle
│   └── logistics/
│       ├── CapitalLedger.tsx      # Pool/budget health, participant balances
│       ├── ParticipantForm.tsx    # Dynamic N-person roster builder
│       ├── TransactionPanel.tsx   # Expense log with automatic equal split
│       ├── PaymentModal.tsx       # UPI deep-link payment flow
│       └── NotificationFeed.tsx   # Debt alerts and settlement events
└── lib/
    ├── types/index.ts         # Shared domain types
    ├── utils/currency.ts      # INR formatting + budget health scoring
    ├── utils/debtSolver.ts    # Min-Cash-Flow algorithm
    └── hooks/useTripStore.ts  # Client-side state management
```

## License

MIT
