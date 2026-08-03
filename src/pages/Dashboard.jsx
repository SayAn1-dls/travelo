import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { Sparkle, AirplaneTilt, CurrencyInr, Image, Envelope } from "@phosphor-icons/react";

const GREETINGS = [
  "READY TO BREAK THE INTERNET?",
  "YOUR PASSPORT IS BORED.",
  "THE GROUP CHAT IS WAITING.",
];

export default function Dashboard() {
  const { user } = useAuth();
  const name = (user?.name || "OPERATIVE").toUpperCase();
  const greeting = GREETINGS[new Date().getHours() % GREETINGS.length];

  return (
    <div className="min-h-screen bg-[#030303] pt-36 pb-20 px-6 md:px-10">
      <header className="mb-24">
        <div className="flex items-center gap-4 mb-8">
          <Sparkle weight="fill" size={32} className="text-orange-500 animate-pulse" />
          <span className="text-2xl font-[900] tracking-[0.4em] text-white/20 font-bebas">COMMAND HQ</span>
        </div>
        <h1 className="header-massive text-white">YO, <span className="text-orange-500 italic">{name}!</span></h1>
        <p className="text-white/40 font-marker text-3xl md:text-4xl mt-10 uppercase">"{greeting}"</p>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="silicon-glass border-orange-500/10 min-h-[400px] flex flex-col justify-between">
           <h2 className="text-6xl font-bebas text-white uppercase">LAUNCH NEW <span className="text-orange-500 italic">MISSION.</span></h2>
           <Link to="/trips"><button className="btn-launch text-2xl py-8 px-12 rounded-2xl">INITIATE</button></Link>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="silicon-glass">Logistics</div>
          <div className="silicon-glass">Ledger</div>
          <div className="silicon-glass">Vault</div>
          <div className="silicon-glass">Mail</div>
        </div>
      </div>
    </div>
  );
}