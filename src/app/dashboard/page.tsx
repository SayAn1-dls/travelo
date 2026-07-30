import { InstitutionalHeader } from "@/components/ui/InstitutionalHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { GroupAvatar } from "@/components/ui/GroupAvatar";
import { TacticalButton } from "@/components/ui/TacticalButton";
import { Wallet, Map, Brain, TrendingUp, Users, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";

const MOCK_MEMBERS = [
  { name: "Sayan", color: "#4a9eff" },
  { name: "Harsh", color: "#10d9a0" },
  { name: "Raj", color: "#f0b429" },
  { name: "Priya", color: "#a78bfa" },
];

const MOCK_STATS = [
  { label: "Total Spent", value: "₹48,250", change: "+12%", icon: Wallet, color: "#f0b429" },
  { label: "Settled", value: "₹31,800", change: "66%", icon: TrendingUp, color: "#10d9a0" },
  { label: "Members", value: "4", change: "Active", icon: Users, color: "#4a9eff" },
  { label: "Days Left", value: "3", change: "Goa Trip", icon: Calendar, color: "#a78bfa" },
];

export default function DashboardPage() {
  return (
    <>
      <InstitutionalHeader />
      <main className="min-h-screen pt-24 pb-12 px-4 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-white">Mission Control</h1>
              <p className="text-[rgba(255,255,255,0.5)] mt-1">Goa Expedition · July 2025</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status="active" />
              <GroupAvatar members={MOCK_MEMBERS} size="md" />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {MOCK_STATS.map(({ label, value, change, icon: Icon, color }) => (
            <GlassCard key={label} padding="md" className="hover:scale-[1.02] transition-transform duration-200">
              <div className="flex items-start justify-between">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: color + "1a", border: `1px solid ${color}33` }}
                >
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <span className="text-xs font-semibold" style={{ color }}>
                  {change}
                </span>
              </div>
              <p className="text-2xl font-bold text-white mt-3 font-display">{value}</p>
              <p className="text-[rgba(255,255,255,0.5)] text-xs mt-1">{label}</p>
            </GlassCard>
          ))}
        </div>

        {/* Module Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: "Capital Ledger",
              desc: "Track expenses and resolve debts with Min-Cash-Flow.",
              href: "/ledger",
              icon: Wallet,
              color: "#f0b429",
              stats: "₹16,450 pending",
            },
            {
              title: "Expedition Planner",
              desc: "Day-by-day itinerary for your Goa trip.",
              href: "/planner",
              icon: Map,
              color: "#10d9a0",
              stats: "6 activities planned",
            },
            {
              title: "AI Intelligence",
              desc: "GPT-4o concierge for recommendations and logistics.",
              href: "/intelligence",
              icon: Brain,
              color: "#4a9eff",
              stats: "Ask anything",
            },
          ].map(({ title, desc, href, icon: Icon, color, stats }) => (
            <Link key={title} href={href} className="block group">
              <GlassCard padding="lg" className="h-full hover:scale-[1.02] transition-transform duration-200 cursor-pointer">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: color + "1a", border: `1px solid ${color}33` }}
                >
                  <Icon className="w-6 h-6" style={{ color }} />
                </div>
                <h3 className="font-display font-semibold text-white text-lg mb-2">{title}</h3>
                <p className="text-[rgba(255,255,255,0.5)] text-sm leading-relaxed mb-4">{desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium" style={{ color }}>
                    {stats}
                  </span>
                  <ArrowRight className="w-4 h-4 text-[rgba(255,255,255,0.3)] group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
