'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plane, LogOut, Shield } from 'lucide-react';

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { label: 'Flights', href: '/flights' },
    { label: 'Hotels',  href: '/hotels' },
    { label: 'Trains',  href: '/trains' },
    { label: 'Cabs',    href: '/cabs' },
    { label: 'Planner', href: '/planning' },
    { label: 'Ledger',  href: '/ledger' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 h-20 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-[#FF690F] rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200 group-hover:scale-110 transition-all">
            <Plane size={24} color="white" />
          </div>
          <span className="text-2xl font-black text-[#192024] tracking-tighter">travelo.</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-3">
          {navLinks.map((l) => (
            <Link key={l.label} href={l.href} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${pathname === l.href ? 'text-[#FF690F] bg-orange-50' : 'text-slate-400 hover:text-[#192024]'}`}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {!isLoggedIn ? (
            <button onClick={() => setIsLoggedIn(true)} className="bg-[#192024] text-white px-6 py-3 rounded-2xl text-sm font-black hover:bg-black shadow-lg shadow-slate-200 transition-all active:scale-95">
              Login
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200">
                <Shield size={16} className="text-emerald-500" />
                <span className="text-xs font-black text-[#192024]">Sayan (ADMIN)</span>
              </div>
              <button onClick={() => setIsLoggedIn(false)} className="text-slate-300 hover:text-red-500 transition-colors">
                <LogOut size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}