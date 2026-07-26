'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, Bell, Plane } from 'lucide-react';

interface HeaderProps { notificationCount?: number; }

export default function Header({ notificationCount = 0 }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/planning', label: 'Trip Planning' },
    { href: '/ledger', label: 'My Trips' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <header style={{ backgroundColor: 'rgba(255,255,255,0.92)', borderBottom: '1px solid var(--border-light)', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '68px' }}>

          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg, #0066FF 0%, #00B4D8 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,102,255,0.30)' }}>
              <Plane size={18} color="#FFFFFF" strokeWidth={2} />
            </div>
            <span className="fredoka" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>travelo</span>
          </Link>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} style={{ padding: '8px 18px', borderRadius: 'var(--radius-pill)', fontSize: '14px', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 600, color: isActive(link.href) ? '#0066FF' : 'var(--text-secondary)', backgroundColor: isActive(link.href) ? 'rgba(0,102,255,0.08)' : 'transparent', textDecoration: 'none', transition: 'all 0.15s ease', display: 'flex', alignItems: 'center', gap: '5px' }}>
                {link.label === 'Trip Planning' && <MapPin size={13} />}
                {link.label}
              </Link>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link href="/ledger" style={{ position: 'relative', textDecoration: 'none' }}>
              <button style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1.5px solid var(--border-light)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', transition: 'all 0.15s ease' }}>
                <Bell size={16} strokeWidth={1.8} />
                {notificationCount > 0 && <span style={{ position: 'absolute', top: '7px', right: '7px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FF4F17', border: '2px solid #FFFFFF' }} />}
              </button>
            </Link>
            <Link href="/planning" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ padding: '9px 20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={13} />
                New Trip
              </button>
            </Link>
          </div>
        </div>

        {menuOpen && (
          <div style={{ paddingBottom: '16px', borderTop: '1px solid var(--border-light)', paddingTop: '14px' }}>
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '14px', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 600, color: isActive(link.href) ? '#0066FF' : 'var(--text-secondary)', backgroundColor: isActive(link.href) ? 'rgba(0,102,255,0.08)' : 'transparent', textDecoration: 'none', marginBottom: '4px' }}>
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
