"use client";
import { useMemo } from "react";
import { formatCurrency } from "@/utils/format";

interface DebtEntry {
  from: string;
  to: string;
  amount: number;
}

interface DebtChartProps {
  debts: DebtEntry[];
  members: string[];
  className?: string;
}

const memberColors = ["#4a9eff", "#10d9a0", "#f0b429", "#ff4757", "#a78bfa", "#f97316"];

export function DebtChart({ debts, members, className }: DebtChartProps) {
  const colorMap = useMemo(
    () => Object.fromEntries(members.map((m, i) => [m, memberColors[i % memberColors.length]])),
    [members]
  );

  const maxAmount = Math.max(...debts.map((d) => d.amount), 1);

  if (debts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[rgba(16,217,160,0.1)] border border-[rgba(16,217,160,0.2)] flex items-center justify-center mb-4">
          <span className="text-2xl">✅</span>
        </div>
        <p className="text-white font-semibold">All Settled</p>
        <p className="text-[rgba(255,255,255,0.45)] text-sm mt-1">No outstanding balances in the group.</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-3">
        {debts.map((debt, i) => {
          const barWidth = (debt.amount / maxAmount) * 100;
          return (
            <div key={i} className="flex items-center gap-3">
              {/* From */}
              <span
                className="text-xs font-semibold w-16 text-right truncate"
                style={{ color: colorMap[debt.from] ?? "rgba(255,255,255,0.6)" }}
              >
                {debt.from}
              </span>

              {/* Bar */}
              <div className="flex-1 relative h-8 bg-[rgba(255,255,255,0.04)] rounded-full overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full rounded-full transition-all duration-700 flex items-center justify-end pr-3"
                  style={{
                    width: `${Math.max(barWidth, 5)}%`,
                    background: `linear-gradient(90deg, ${colorMap[debt.from] ?? "#4a9eff"}44, ${colorMap[debt.from] ?? "#4a9eff"}bb)`,
                    border: `1px solid ${colorMap[debt.from] ?? "#4a9eff"}44`,
                  }}
                >
                  <span className="text-xs font-bold text-white">{formatCurrency(debt.amount)}</span>
                </div>
              </div>

              {/* To */}
              <span
                className="text-xs font-semibold w-16 truncate"
                style={{ color: colorMap[debt.to] ?? "rgba(255,255,255,0.6)" }}
              >
                → {debt.to}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
