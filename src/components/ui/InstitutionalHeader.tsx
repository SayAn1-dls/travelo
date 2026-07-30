"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, Wallet, Map, Brain, LayoutDashboard } from "lucide-react";
import { cn } from "@/utils/cn";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Ledger", href: "/ledger", icon: Wallet },
  { label: "Planner", href: "/planner", icon: Map },
  { label: "Intelligence", href: "/intelligence", icon: Brain },
];

export function InstitutionalHeader() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
      <div className="max-w-6xl mx-auto bg-[rgba(5,5,28,0.8)] border border-[rgba(255,255,255,0.10)] rounded-2xl px-6 py-3 backdrop-blur-2xl flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-[rgba(74,158,255,0.15)] border border-[rgba(74,158,255,0.3)] flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(74,158,255,0.4)] transition-all duration-300">
            <Globe className="w-4 h-4 text-[#4a9eff]" />
          </div>
          <span className="font-display font-bold text-white tracking-tight">Travelo</span>
          <span className="hidden sm:inline text-xs px-1.5 py-0.5 rounded-md bg-[rgba(240,180,41,0.15)] text-[#f0b429] font-semibold border border-[rgba(240,180,41,0.2)]">
            PRIME
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-[rgba(74,158,255,0.15)] text-[#4a9eff] border border-[rgba(74,158,255,0.25)]"
                    : "text-[rgba(255,255,255,0.6)] hover:text-white hover:bg-[rgba(255,255,255,0.08)]"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Status Badge */}
        <div className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-[#10d9a0] animate-pulse" />
          <span className="text-[rgba(255,255,255,0.5)] hidden sm:inline">Goa Expedition</span>
        </div>
      </div>
    </header>
  );
}
