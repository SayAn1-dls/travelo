import { ArrowUpRight, ArrowDownLeft, Minus } from "lucide-react";
import { cn } from "@/utils/cn";
import { formatCurrency } from "@/utils/format";

interface LedgerRowProps {
  paidBy: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  splitAmong: string[];
  currentUser?: string;
  className?: string;
}

const categoryColors: Record<string, string> = {
  food: "#f0b429",
  transport: "#4a9eff",
  accommodation: "#10d9a0",
  entertainment: "#a78bfa",
  shopping: "#f97316",
  other: "rgba(255,255,255,0.4)",
};

export function LedgerRow({
  paidBy,
  description,
  category,
  amount,
  date,
  splitAmong,
  currentUser = "You",
  className,
}: LedgerRowProps) {
  const isYou = paidBy === currentUser;
  const perPerson = amount / splitAmong.length;
  const yourShare = isYou ? amount - perPerson : -perPerson;

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.10)] transition-all duration-200 cursor-default",
        className
      )}
    >
      {/* Category dot */}
      <div
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: categoryColors[category] ?? categoryColors.other }}
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{description}</p>
        <p className="text-[rgba(255,255,255,0.45)] text-xs mt-0.5">
          {isYou ? "You" : paidBy} paid · {splitAmong.length} people · {date}
        </p>
      </div>

      {/* Total amount */}
      <div className="text-right flex-shrink-0">
        <p className="text-white text-sm font-semibold">{formatCurrency(amount)}</p>
        <div
          className={cn("flex items-center gap-0.5 justify-end text-xs font-medium mt-0.5")}
          style={{ color: yourShare >= 0 ? "#10d9a0" : "#ff4757" }}
        >
          {yourShare >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
          {formatCurrency(Math.abs(yourShare))}
        </div>
      </div>
    </div>
  );
}
