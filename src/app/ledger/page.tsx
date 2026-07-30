"use client";
import { useState } from "react";
import { InstitutionalHeader } from "@/components/ui/InstitutionalHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { TacticalButton } from "@/components/ui/TacticalButton";
import { LedgerRow } from "@/components/ui/LedgerRow";
import { DebtChart } from "@/components/ui/DebtChart";
import { GlassModal } from "@/components/ui/GlassModal";
import { PremiumInput } from "@/components/ui/PremiumInput";
import { Plus, TrendingDown, RefreshCw } from "lucide-react";
import { formatCurrency } from "@/utils/format";
import type { Expense } from "@/types";

const MOCK_EXPENSES: Expense[] = [
  { id: "1", description: "North Goa Hotel (2 nights)", category: "accommodation", amount: 12400, paidBy: "Sayan", splitAmong: ["Sayan", "Harsh", "Raj", "Priya"], date: "2025-07-10" },
  { id: "2", description: "Dinner at Fisherman's Wharf", category: "food", amount: 3200, paidBy: "Harsh", splitAmong: ["Sayan", "Harsh", "Raj", "Priya"], date: "2025-07-10" },
  { id: "3", description: "Cab from Airport", category: "transport", amount: 1800, paidBy: "Raj", splitAmong: ["Sayan", "Harsh", "Raj"], date: "2025-07-10" },
  { id: "4", description: "Water Sports Package", category: "entertainment", amount: 6400, paidBy: "Sayan", splitAmong: ["Sayan", "Harsh", "Raj", "Priya"], date: "2025-07-11" },
  { id: "5", description: "Lunch at Curlies Beach Shack", category: "food", amount: 2800, paidBy: "Priya", splitAmong: ["Sayan", "Harsh", "Raj", "Priya"], date: "2025-07-11" },
];

const MOCK_SETTLEMENTS = [
  { from: "Harsh", to: "Sayan", amount: 3825 },
  { from: "Raj", to: "Sayan", amount: 4425 },
  { from: "Priya", to: "Sayan", amount: 2150 },
];

export default function LedgerPage() {
  const [expenses] = useState<Expense[]>(MOCK_EXPENSES);
  const [modalOpen, setModalOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const totalPending = MOCK_SETTLEMENTS.reduce((s, d) => s + d.amount, 0);

  return (
    <>
      <InstitutionalHeader />
      <main className="min-h-screen pt-24 pb-12 px-4 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-white">Capital Ledger</h1>
            <p className="text-[rgba(255,255,255,0.5)] mt-1">Group expense tracking & debt resolution</p>
          </div>
          <TacticalButton variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>
            Add Expense
          </TacticalButton>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <GlassCard glow="gold" padding="md">
            <p className="text-[rgba(255,255,255,0.5)] text-xs uppercase tracking-wider mb-2">Total Spent</p>
            <p className="font-display text-2xl font-bold text-gradient-gold">{formatCurrency(totalSpent)}</p>
          </GlassCard>
          <GlassCard glow="crimson" padding="md">
            <p className="text-[rgba(255,255,255,0.5)] text-xs uppercase tracking-wider mb-2">Pending Settlements</p>
            <p className="font-display text-2xl font-bold text-[#ff4757]">{formatCurrency(totalPending)}</p>
          </GlassCard>
          <GlassCard glow="emerald" padding="md" className="col-span-2 md:col-span-1">
            <p className="text-[rgba(255,255,255,0.5)] text-xs uppercase tracking-wider mb-2">Transactions to Settle</p>
            <p className="font-display text-2xl font-bold text-[#10d9a0]">{MOCK_SETTLEMENTS.length}</p>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Expense List */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="font-display font-semibold text-white text-lg mb-4">Transactions</h2>
            {expenses.map((expense) => (
              <LedgerRow
                key={expense.id}
                paidBy={expense.paidBy}
                description={expense.description}
                category={expense.category}
                amount={expense.amount}
                date={expense.date}
                splitAmong={expense.splitAmong}
                currentUser="Sayan"
              />
            ))}
          </div>

          {/* Settlement Panel */}
          <div>
            <h2 className="font-display font-semibold text-white text-lg mb-4">Min-Cash-Flow Settlements</h2>
            <GlassCard padding="md" glow="sapphire">
              <div className="flex items-center gap-2 mb-4">
                <TrendingDown className="w-4 h-4 text-[#4a9eff]" />
                <span className="text-sm text-[rgba(255,255,255,0.7)]">Optimized to {MOCK_SETTLEMENTS.length} transactions</span>
              </div>
              <DebtChart debts={MOCK_SETTLEMENTS} members={["Sayan", "Harsh", "Raj", "Priya"]} />
              <TacticalButton variant="success" size="sm" className="w-full mt-4" leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
                Mark All Settled
              </TacticalButton>
            </GlassCard>
          </div>
        </div>
      </main>

      {/* Add Expense Modal */}
      <GlassModal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Expense" description="Record a new group expense to the ledger." size="md">
        <div className="space-y-4">
          <PremiumInput label="Description" placeholder="e.g., Dinner at Fisherman's Wharf" value={description} onChange={(e) => setDescription(e.target.value)} />
          <PremiumInput label="Amount" placeholder="0.00" type="number" leftAddon="₹" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <div className="flex gap-3 pt-2">
            <TacticalButton variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>Cancel</TacticalButton>
            <TacticalButton variant="primary" className="flex-1">Add to Ledger</TacticalButton>
          </div>
        </div>
      </GlassModal>
    </>
  );
}
