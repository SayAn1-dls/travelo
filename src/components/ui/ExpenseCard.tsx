import { Utensils, Car, Building2, Music, ShoppingBag, MoreHorizontal } from "lucide-react";
import { cn } from "@/utils/cn";
import { formatCurrency, formatDate } from "@/utils/format";
import { GroupAvatar } from "./GroupAvatar";

interface ExpenseCardProps {
  id: string;
  description: string;
  category: "food" | "transport" | "accommodation" | "entertainment" | "shopping" | "other";
  amount: number;
  paidBy: string;
  paidByAvatar?: string;
  members: { name: string; color?: string }[];
  date: string;
  settled?: boolean;
  className?: string;
}

const categoryMeta = {
  food: { icon: Utensils, color: "#f0b429", label: "Food & Dining" },
  transport: { icon: Car, color: "#4a9eff", label: "Transport" },
  accommodation: { icon: Building2, color: "#10d9a0", label: "Accommodation" },
  entertainment: { icon: Music, color: "#a78bfa", label: "Entertainment" },
  shopping: { icon: ShoppingBag, color: "#f97316", label: "Shopping" },
  other: { icon: MoreHorizontal, color: "rgba(255,255,255,0.5)", label: "Other" },
};

export function ExpenseCard({
  description,
  category,
  amount,
  paidBy,
  members,
  date,
  settled = false,
  className,
}: ExpenseCardProps) {
  const meta = categoryMeta[category];
  const Icon = meta.icon;
  const perPerson = amount / members.length;

  return (
    <div
      className={cn(
        "p-5 rounded-2xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.14)] hover:bg-[rgba(255,255,255,0.06)] transition-all duration-200 cursor-default",
        settled && "opacity-60",
        className
      )}
    >
      <div className="flex items-start gap-4">
        {/* Category Icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: meta.color + "1a", border: `1px solid ${meta.color}33` }}
        >
          <Icon className="w-5 h-5" style={{ color: meta.color }} />
        </div>

        {/* Main Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-white font-semibold text-sm">{description}</p>
              <p className="text-[rgba(255,255,255,0.45)] text-xs mt-0.5">
                {meta.label} · {formatDate(date)}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-white font-bold">{formatCurrency(amount)}</p>
              <p className="text-[rgba(255,255,255,0.4)] text-xs mt-0.5">{formatCurrency(perPerson)}/person</p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <GroupAvatar members={members} max={4} size="sm" />
              <span className="text-[rgba(255,255,255,0.4)] text-xs">{members.length} members</span>
            </div>
            <span className="text-[rgba(255,255,255,0.4)] text-xs">
              Paid by <span className="text-white font-medium">{paidBy}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
