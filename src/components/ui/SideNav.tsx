"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, Wallet, Map, Brain, LayoutDashboard, ChevronLeft, ChevronRight, Settings } from "lucide-react";
import { useState } from "react";
import { cn } from "@/utils/cn";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, color: "#4a9eff" },
  { label: "Capital Ledger", href: "/ledger", icon: Wallet, color: "#f0b429" },
  { label: "Expedition Planner", href: "/planner", icon: Map, color: "#10d9a0" },
  { label: "AI Intelligence", href: "/intelligence", icon: Brain, color: "#a78bfa" },
];

export function SideNav() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2 transition-all duration-300",
        collapsed ? "w-14" : "w-52"
      )}
    >
      <div className="bg-[rgba(5,5,28,0.9)] border border-[rgba(255,255,255,0.10)] rounded-2xl p-2 backdrop-blur-2xl shadow-[0_24px_64px_rgba(0,0,0,0.5)]">
        {/* Logo */}
        <div className={cn("flex items-center gap-2 px-3 py-2.5 mb-1", collapsed && "justify-center")}>
          <Globe className="w-5 h-5 text-[#4a9eff] flex-shrink-0" />
          {!collapsed && <span className="font-display font-bold text-white text-sm">Travelo</span>}
        </div>

        <div className="w-full h-px bg-[rgba(255,255,255,0.08)] mb-2" />

        {/* Nav Items */}
        <nav className="flex flex-col gap-1">
          {navItems.map(({ label, href, icon: Icon, color }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                  collapsed && "justify-center",
                  isActive
                    ? "bg-[rgba(74,158,255,0.12)] border border-[rgba(74,158,255,0.2)]"
                    : "hover:bg-[rgba(255,255,255,0.06)]"
                )}
                title={collapsed ? label : undefined}
              >
                <Icon className="w-4 h-4 flex-shrink-0" style={{ color: isActive ? color : "rgba(255,255,255,0.5)" }} />
                {!collapsed && (
                  <span className={cn("text-sm font-medium", isActive ? "text-white" : "text-[rgba(255,255,255,0.55)] group-hover:text-white")}>
                    {label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="w-full h-px bg-[rgba(255,255,255,0.08)] my-2" />

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[rgba(255,255,255,0.4)] hover:text-white hover:bg-[rgba(255,255,255,0.06)] transition-all text-xs font-medium",
            collapsed && "justify-center"
          )}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && "Collapse"}
        </button>
      </div>
    </aside>
  );
}
