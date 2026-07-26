'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MapPin, Bell, Menu, X, Plane, ChevronDown,
} from 'lucide-react';

interface HeaderProps {
  notificationCount?: number;
}

const NAV_LINKS = [
  { href: '/',         label: 'Search'  },
  { href: '/planning', label: 'Trips'   },
  { href: '/ledger',   label: 'Ledger'  },
];

export default function Header({ notificationCount = 0 }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <header style={{ backgroundColor: 'var(--navy)', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '58px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ width: '30px', height: '30px', background: 'var(--orange)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plane size={15} color="#FFFFFF" strokeWidth={2.2} />
            </div>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.03em', fontFamily: 'Inter, sans-serif' }}>
              travelo
            </span>
          </Link>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            {NAV_LINKS.map(link => (
              <Link key={link.href} href={link.href} style={{ padding: '6px 14px', borderRadius: 'var(--r-md)', fontSize: '13px', fontFamily: 'Inter, sans-serif', fontWeight: isActive(link.href) ? 600 : 400, color: isActive(link.href) ? '#FFFFFF' : 'rgba(255,255,255,0.60)', backgroundColor: isActive(link.href) ? 'rgba(255,255,255,0.10)' : 'transparent', textDecoration: 'none', transition: 'all 0.15s ease' }} onMouseEnter={e => { if (!isActive(link.href)) { (e.currentTarget as HTMLAnchorElement).style.color = '#FFFFFF'; (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'rgba(255,255,255,0.07)'; } }} onMouseLeave={e => { if (!isActive(link.href)) { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.60)'; (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'transparent'; } }}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link href="/ledger" style={{ position: 'relative', textDecoration: 'none' }}>
              <button style={{ width: '34px', height: '34px', borderRadius: 'var(--r-md)', border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.65)', transition: 'all 0.15s ease', position: 'relative' }} onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,105,15,0.50)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--orange)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,105,15,0.08)'; }} onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.12)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.65)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}>
                <Bell size={15} strokeWidth={1.8} />
                {notificationCount > 0 && (
                  <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'var(--orange)', border: '2px solid var(--navy)', fontSize: '9px', fontWeight: 700, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>
            </Link>

            <Link href="/planning" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ padding: '7px 16px', fontSize: '13px' }}>
                <MapPin size={12} />
                New Trip
              </button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
