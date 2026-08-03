import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { AirplaneTilt, MapPin, Users, Lightning, Star, ArrowRight, Globe, Shield, Rocket } from "@phosphor-icons/react";

const STATS = [
  { label: "Missions Launched", value: "1M+", icon: Rocket },
  { label: "Destinations", value: "190+", icon: Globe },
  { label: "Active Squads", value: "50K+", icon: Users },
  { label: "Zero Network Errors", value: "100%", icon: Shield },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#030303] overflow-x-hidden">
      <nav className="fixed top-0 inset-x-0 z-[100] p-6 md:p-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
            <AirplaneTilt size={28} weight="fill" className="text-white" />
          </div>
          <span className="text-4xl font-[900] font-bebas uppercase text-white">TRAVELO.</span>
        </div>
        <Link to="/auth">
          <button className="bg-white/5 border border-white/10 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest text-white hover:bg-white/10 transition-all">ENTER HQ</button>
        </Link>
      </nav>

      <main className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
           <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-6 py-2 rounded-full mb-12">
            <span className="font-black text-[10px] tracking-[0.4em] uppercase text-orange-500">v4.0 — THE FINAL MASTERPIECE — MARKET READY</span>
          </div>
          <h1 className="header-massive text-white mb-12">
            PLAN. PACK.<br/><span className="text-orange-500 italic">EXPLORE.</span>
          </h1>
          <p className="text-2xl md:text-3xl text-white/30 max-w-2xl mx-auto mb-16 font-bold uppercase tracking-tight italic">
            The only travel workspace your squad needs.<br/>No drama, just logistics and vibes.
          </p>
          <Link to="/auth">
            <button className="btn-launch text-3xl px-16 py-10 rounded-[2.5rem]">START EXPEDITION <ArrowRight size={48} weight="bold" /></button>
          </Link>
        </div>
      </main>
    </div>
  );
}