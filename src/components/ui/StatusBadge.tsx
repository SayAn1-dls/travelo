import { cn } from "@/utils/cn";

interface StatusBadgeProps {
  status: "active" | "pending" | "settled" | "overdue" | "planned" | "completed";
  className?: string;
}

const statusConfig = {
  active: { label: "Active", color: "#4a9eff", bg: "rgba(74,158,255,0.12)", border: "rgba(74,158,255,0.25)" },
  pending: { label: "Pending", color: "#f0b429", bg: "rgba(240,180,41,0.12)", border: "rgba(240,180,41,0.25)" },
  settled: { label: "Settled", color: "#10d9a0", bg: "rgba(16,217,160,0.12)", border: "rgba(16,217,160,0.25)" },
  overdue: { label: "Overdue", color: "#ff4757", bg: "rgba(255,71,87,0.12)", border: "rgba(255,71,87,0.25)" },
  planned: { label: "Planned", color: "#a78bfa", bg: "rgba(167,139,250,0.12)", border: "rgba(167,139,250,0.25)" },
  completed: { label: "Completed", color: "#10d9a0", bg: "rgba(16,217,160,0.12)", border: "rgba(16,217,160,0.25)" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold", className)}
      style={{
        color: config.color,
        background: config.bg,
        border: `1px solid ${config.border}`,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: config.color }} />
      {config.label}
    </span>
  );
}
