'use client';

import Link from 'next/link';
import Header from '@/components/layout/Header';
import { MapPin, Wallet, Bell, Users, ArrowRight, TrendingUp, Shield, Zap, Plane, Globe, Camera } from 'lucide-react';

const FEATURES = [
  { icon: Users, title: 'Dynamic Crew Builder', desc: 'Add N travellers instantly. Auto-generates contribution fields and identity records for everyone.', gradient: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', iconColor: '#0066FF' },
  { icon: Wallet, title: 'Live Capital Ledger', desc: 'Real-time pool tracking vs budget. Know your spend rate at every stop on the journey.', gradient: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)', iconColor: '#00966B' },
  { icon: TrendingUp, title: 'Smart Debt Settlement', desc: 'Minimum-cash-flow algorithm resolves all group debts with the fewest possible transactions.', gradient: 'linear-gradient(135deg, #FFF7ED, #FED7AA)', iconColor: '#FF4F17' },
  { icon: Bell, title: 'Instant Notifications', desc: 'Every member gets pinged the moment someone pays. No spreadsheets, no confusion.', gradient: 'linear-gradient(135deg, #F5F3FF, #EDE9FE)', iconColor: '#7C3AED' },
  { icon: Shield, title: 'UPI Deep-Link Pay', desc: 'One tap to GPay, PhonePe, or Paytm. Payment confirms and the ledger updates itself.', gradient: 'linear-gradient(135deg, #FFF1F2, #FFE4E6)', iconColor: '#DC2626' },
  { icon: Zap, title: 'Zero Setup', desc: 'No accounts required. Create a trip, share the link, and start logging in 60 seconds.', gradient: 'linear-gradient(135deg, #FEFCE8, #FEF9C3)', iconColor: '#CA8A04' },
];

const DESTINATIONS = [
  { name: 'Goa', emoji: '🏖️' }, { name: 'Manali', emoji: '🏔️' }, { name: 'Jaipur', emoji: '🏰' },
  { name: 'Thailand', emoji: '🌴' }, { name: 'Bali', emoji: '🌺' }, { name: 'Kashmir', emoji: '❄️' },
];

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <Header />
      <section className="hero-bg" style={{ padding: '72px 24px 80px', position: 'relative' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 18px', background: 'rgba(0,102,255,0.08)', border: '1.5px solid rgba(0,102,255,0.18)', borderRadius: 'var(--radius-pill)', marginBottom: '28px' }}>
            <Plane size={13} color="#0066FF" />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0066FF', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.04em' }}>#1 Group Travel Expense Splitter</span>
          </div>
          <h1 className="fredoka" style={{ fontSize: 'clamp(40px, 7vw, 72px)', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1, marginBottom: '22px', letterSpacing: '-0.02em' }}>
            Travel Together,{' '}
            <span style={{ background: 'linear-gradient(90deg, #0066FF, #00B4D8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Split Smarter</span>{' '}🌍
          </h1>
          <p style={{ fontSize: '18px', lineHeight: 1.7, color: 'var(--text-secondary)', maxWidth: '560px', margin: '0 auto 40px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Travelo handles the money math so you can focus on the memories. Pool budgets, log expenses, and settle up instantly.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '52px' }}>
            <Link href="/planning"><button className="btn-primary" style={{ padding: '14px 32px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={15} />Plan a Trip<ArrowRight size={14} /></button></Link>
            <Link href="/ledger"><button className="btn-secondary" style={{ padding: '14px 32px', fontSize: '15px' }}>View Demo Ledger</button></Link>
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {DESTINATIONS.map((d, i) => (
              <Link key={i} href="/planning" style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#FFFFFF', border: '1.5px solid var(--border-light)', borderRadius: 'var(--radius-pill)', cursor: 'pointer', boxShadow: 'var(--shadow-sm)', fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  <span>{d.emoji}</span> {d.name}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section style={{ backgroundColor: '#0066FF', padding: '36px 24px' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', textAlign: 'center' }}>
          {[{ value: '∞', label: 'Travellers Supported', icon: '👥' }, { value: 'O(n²)', label: 'Optimal Settlement', icon: '⚡' }, { value: '4 Apps', label: 'UPI Integrations', icon: '💸' }].map((stat, i) => (
            <div key={i}>
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>{stat.icon}</div>
              <div className="fredoka" style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.1, marginBottom: '4px' }}>{stat.value}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 500 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>
      <section style={{ maxWidth: '920px', margin: '0 auto', padding: '72px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 className="fredoka" style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: '14px' }}>Everything your squad needs 🚀</h2>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>From planning to settlement — Travelo has you covered at every step.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '20px' }}>
          {FEATURES.map((f, i) => { const Icon = f.icon; return (
            <div key={i} className="vibrant-card" style={{ padding: '26px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: f.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}><Icon size={22} style={{ color: f.iconColor }} /></div>
              <h3 className="jakarta" style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>{f.title}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
            </div>
          ); })}
        </div>
      </section>
      <section style={{ padding: '72px 24px' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center', background: 'linear-gradient(135deg, #0066FF 0%, #0047CC 100%)', borderRadius: 'var(--radius-xl)', padding: '56px 40px', boxShadow: '0 20px 60px rgba(0,102,255,0.20)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌏</div>
          <h2 className="fredoka" style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2, marginBottom: '14px' }}>Ready for the next adventure?</h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.82)', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: '32px', lineHeight: 1.65 }}>Set up your group, configure the budget, and focus on the fun — not the finances.</p>
          <Link href="/planning"><button style={{ background: '#FFFFFF', color: '#0066FF', border: 'none', borderRadius: 'var(--radius-pill)', padding: '14px 36px', fontSize: '15px', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>Start Planning <ArrowRight size={15} /></button></Link>
        </div>
      </section>
    </div>
  );
}
