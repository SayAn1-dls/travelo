import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/utils/cn";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "bordered" | "subtle";
  glow?: "gold" | "emerald" | "sapphire" | "crimson" | "none";
  padding?: "sm" | "md" | "lg" | "xl";
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", glow = "none", padding = "md", children, ...props }, ref) => {
    const variants = {
      default: "bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.10)]",
      elevated: "bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.15)] shadow-[0_24px_64px_rgba(0,0,0,0.6)]",
      bordered: "bg-[rgba(255,255,255,0.03)] border-2 border-[rgba(255,255,255,0.12)]",
      subtle: "bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)]",
    };

    const glows = {
      gold: "shadow-[0_0_40px_rgba(240,180,41,0.15)]",
      emerald: "shadow-[0_0_40px_rgba(16,217,160,0.15)]",
      sapphire: "shadow-[0_0_40px_rgba(74,158,255,0.15)]",
      crimson: "shadow-[0_0_40px_rgba(255,71,87,0.15)]",
      none: "",
    };

    const paddings = {
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
      xl: "p-10",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl backdrop-blur-xl transition-all duration-300",
          variants[variant],
          glows[glow],
          paddings[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export { GlassCard };
