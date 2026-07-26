'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Moon, Sun, MapPin, Bell, Menu, X, Compass } from 'lucide-react';

interface HeaderProps {
  notificationCount?: number;
}

export default function Header({ notificationCount = 0 }: HeaderProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const saved = localStorage.getItem('travelo-theme') as 'light' | 'dark' | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('travelo-theme', next);
  };

  const navLinks = [
    { href: '/', label: 'Overview' },
    { href: '/planning', label: 'Trip Planning' },
    { href: '/ledger', label: 'Capital Ledger' },
  ];

  return (
    <header style={{
      backgroundColor: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-light)',
      position: 'sticky', top: 0, zIndex: 50,
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{
              width: '32px', height: '32px',
              background: 'linear-gradient(135deg, #1A1814 0%, #C9A96E 100%)',
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Compass size={16} color="#FDFCFB" strokeWidth={1.5} />
            </div>
            <span className="garamond" style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Travelo
            </span>
            <span style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.12em', color: 'var(--accent-platinum)', textTransform: 'uppercase', marginTop: '2px' }}>
              Executive
            </span>
          </Link>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} style={{
                padding: '6px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 500,
                color: pathname === link.href ? 'var(--text-primary)' : 'var(--text-secondary)',
                backgroundColor: pathname === link.href ? 'var(--bg-secondary)' : 'transparent',
                textDecoration: 'none', transition: 'all 0.15s ease',
              }}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={toggleTheme} style={{
              width: '36px', height: '36px', borderRadius: '8px',
              border: '1px solid var(--border-light)', background: 'transparent',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-secondary)',
            }}>
              {theme === 'light' ? <Moon size={15} strokeWidth={1.5} /> : <Sun size={15} strokeWidth={1.5} />}
            </button>
            <Link href="/planning" style={{ textDecoration: 'none' }}>
              <button className="luxury-btn-primary" style={{ padding: '7px 16px', fontSize: '12px' }}>New Trip</button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
