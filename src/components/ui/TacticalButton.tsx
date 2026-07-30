import { ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

interface TacticalButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success" | "outline";
  size?: "xs" | "sm" | "md" | "lg";
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const TacticalButton = forwardRef<HTMLButtonElement, TacticalButtonProps>(
  (
    { className, variant = "primary", size = "md", loading = false, leftIcon, rightIcon, children, disabled, ...props },
    ref
  ) => {
    const variants = {
      primary:
        "bg-[#4a9eff] hover:bg-[#3a8eef] text-white shadow-[0_0_20px_rgba(74,158,255,0.3)] hover:shadow-[0_0_30px_rgba(74,158,255,0.5)]",
      secondary:
        "bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.12)] text-white border border-[rgba(255,255,255,0.12)]",
      ghost: "bg-transparent hover:bg-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.7)] hover:text-white",
      danger:
        "bg-[rgba(255,71,87,0.15)] hover:bg-[rgba(255,71,87,0.25)] text-[#ff4757] border border-[rgba(255,71,87,0.3)]",
      success:
        "bg-[rgba(16,217,160,0.15)] hover:bg-[rgba(16,217,160,0.25)] text-[#10d9a0] border border-[rgba(16,217,160,0.3)]",
      outline: "bg-transparent border border-[rgba(255,255,255,0.2)] hover:border-[rgba(255,255,255,0.4)] text-white",
    };

    const sizes = {
      xs: "px-3 py-1.5 text-xs rounded-lg",
      sm: "px-4 py-2 text-sm rounded-xl",
      md: "px-5 py-2.5 text-sm rounded-xl",
      lg: "px-6 py-3 text-base rounded-xl",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);

TacticalButton.displayName = "TacticalButton";

export { TacticalButton };
