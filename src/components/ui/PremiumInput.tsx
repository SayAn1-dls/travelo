"use client";
import { InputHTMLAttributes, forwardRef, useState } from "react";
import { cn } from "@/utils/cn";

interface PremiumInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
}

const PremiumInput = forwardRef<HTMLInputElement, PremiumInputProps>(
  ({ label, error, hint, leftAddon, rightAddon, className, id, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-xs font-semibold text-[rgba(255,255,255,0.6)] uppercase tracking-wider">
          {label}
        </label>
        <div
          className={cn(
            "flex items-center gap-2 rounded-xl border bg-[rgba(255,255,255,0.04)] px-4 py-2.5 transition-all duration-200",
            focused
              ? "border-[rgba(74,158,255,0.5)] shadow-[0_0_0_3px_rgba(74,158,255,0.10)]"
              : error
              ? "border-[rgba(255,71,87,0.5)]"
              : "border-[rgba(255,255,255,0.10)] hover:border-[rgba(255,255,255,0.20)]"
          )}
        >
          {leftAddon && <span className="text-[rgba(255,255,255,0.4)] flex-shrink-0">{leftAddon}</span>}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "flex-1 bg-transparent outline-none text-white placeholder:text-[rgba(255,255,255,0.3)] text-sm",
              className
            )}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            {...props}
          />
          {rightAddon && <span className="text-[rgba(255,255,255,0.4)] flex-shrink-0">{rightAddon}</span>}
        </div>
        {error && <p className="text-[#ff4757] text-xs">{error}</p>}
        {hint && !error && <p className="text-[rgba(255,255,255,0.4)] text-xs">{hint}</p>}
      </div>
    );
  }
);

PremiumInput.displayName = "PremiumInput";

export { PremiumInput };
