'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, Bell, Menu, X, Plane } from 'lucide-react';

interface HeaderProps {
  notificationCount?: number;
}

export default function Header({ notificationCount = 0 }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/planning', label: '🗺️ Plan Trip' },
    { href: '/ledger', label: '💰 Ledger' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <header style={{
      backgroundColor: 'rgba(253,252,251,0.88)',
      borderBottom: '1.5px solid rgba(139,92,246,0.10)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>

          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <div style={{
              width: '42px', height: '42px',
              background: 'linear-gradient(135deg, #8B5CF6 0%, #FF4D4D 100%)',
              borderRadius: 'var(--r-pill)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(139,92,246,0.35)',
              flexShrink: 0,
            }}>
              <Plane size={19} color="#FFFFFF" strokeWidth={2.2} />
            </div>
            <span className="comfortaa" style={{
              fontSize: '26px',
              fontWeight: 700,
              color: 'var(--ink)',
              letterSpacing: '-0.01em',
            }}>
              travelo
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: '9px 20px',
                  borderRadius: 'var(--r-pill)',
                  fontSize: '14px',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  fontWeight: 700,
                  color: isActive(link.href) ? '#7C3AED' : 'var(--ink-soft)',
                  backgroundColor: isActive(link.href) ? 'rgba(139,92,246,0.10)' : 'transparent',
                  border: isActive(link.href) ? '1.5px solid rgba(139,92,246,0.20)' : '1.5px solid transparent',
                  textDecoration: 'none',
                  transition: 'all 0.18s ease',
                  display: 'flex', alignItems: 'center', gap: '5px',
                }}
                onMouseEnter={e => {
                  if (!isActive(link.href)) {
                    (e.currentTarget as HTMLAnchorElement).style.color = '#7C3AED';
                    (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'rgba(139,92,246,0.07)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive(link.href)) {
                    (e.currentTarget as HTMLAnchorElement).style.color = 'var(--ink-soft)';
                    (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'transparent';
                  }
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Bell */}
            <Link href="/ledger" style={{ position: 'relative', textDecoration: 'none' }}>
              <button
                style={{
                  width: '42px', height: '42px',
                  borderRadius: 'var(--r-pill)',
                  border: '1.5px solid var(--border-soft)',
                  background: 'transparent',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--ink-soft)',
                  transition: 'all 0.18s ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(139,92,246,0.35)';
                  (e.currentTarget as HTMLButtonElement).style.color = '#7C3AED';
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(139,92,246,0.07)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-soft)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--ink-soft)';
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                }}
              >
                <Bell size={16} strokeWidth={1.8} />
                {notificationCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '8px', right: '8px',
                    width: '8px', height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--coral)',
                    border: '2px solid var(--canvas)',
                  }} />
                )}
              </button>
            </Link>

            {/* New Trip CTA */}
            <Link href="/planning" style={{ textDecoration: 'none' }}>
              <button className="btn-violet" style={{ padding: '10px 22px', fontSize: '13px' }}>
                <MapPin size={13} />
                New Trip
              </button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}