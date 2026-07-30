import Link from "next/link";
import { ArrowRight, Globe, Brain, Wallet, Map } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto space-y-8 animate-fade-in">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-[rgba(240,180,41,0.3)]">
          <span className="w-2 h-2 rounded-full bg-[#f0b429] animate-pulse" />
          <span className="text-[#f0b429] text-xs font-semibold uppercase tracking-widest">
            Travelo Masterpiece v2.0
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-display text-6xl md:text-7xl font-bold leading-tight">
          <span className="text-gradient-gold">Elite</span> Group
          <br />
          Travel <span className="text-gradient-sapphire">Intelligence</span>
        </h1>

        {/* Subheadline */}
        <p className="text-[rgba(255,255,255,0.6)] text-xl max-w-2xl mx-auto leading-relaxed">
          The institutional-grade platform for serious expeditions. Track capital, plan routes, and deploy AI intelligence — all in one command center.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#4a9eff] hover:bg-[#3a8eef] text-white font-semibold rounded-xl transition-all duration-200 shadow-[0_0_30px_rgba(74,158,255,0.4)] hover:shadow-[0_0_40px_rgba(74,158,255,0.6)]"
          >
            Launch Command Center
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/ledger"
            className="inline-flex items-center gap-2 px-8 py-3.5 glass glass-hover text-white font-semibold rounded-xl transition-all duration-200"
          >
            Open Capital Ledger
          </Link>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl w-full px-4">
        {[
          {
            icon: Wallet,
            title: "Capital Ledger",
            desc: "Min-Cash-Flow algorithm resolves group debts with minimal transactions.",
            href: "/ledger",
            color: "#f0b429",
          },
          {
            icon: Map,
            title: "Expedition Planner",
            desc: "Day-by-day itinerary builder with collaborative editing.",
            href: "/planner",
            color: "#10d9a0",
          },
          {
            icon: Brain,
            title: "AI Concierge",
            desc: "GPT-4o intelligence for recommendations, budgets, and logistics.",
            href: "/intelligence",
            color: "#4a9eff",
          },
          {
            icon: Globe,
            title: "Mission Control",
            desc: "Unified dashboard for group stats, balances, and expedition status.",
            href: "/dashboard",
            color: "#ff4757",
          },
        ].map(({ icon: Icon, title, desc, href, color }) => (
          <Link
            key={title}
            href={href}
            className="glass glass-hover rounded-2xl p-6 group cursor-pointer block"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
              style={{ background: `${color}22`, border: `1px solid ${color}44` }}
            >
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <h3 className="font-display font-semibold text-white mb-2">{title}</h3>
            <p className="text-[rgba(255,255,255,0.5)] text-sm leading-relaxed">{desc}</p>
            <div className="mt-4 flex items-center gap-1 text-xs font-medium" style={{ color }}>
              Open module <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
