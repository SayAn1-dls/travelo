'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Navigator from '@/components/ai/Navigator';
import {
  Plane, Building2, Car, Train,
  ArrowLeftRight, Users, Calendar,
  Search, TrendingDown, Shield, Zap,
  MapPin, ArrowRight, ChevronDown,
  Star, Clock,
} from 'lucide-react';

type BookingTab = 'flights' | 'hotels' | 'cabs' | 'trains';

const TABS: { id: BookingTab; label: string; icon: React.ElementType }[] = [
  { id: 'flights', label: 'Flights',   icon: Plane     },
  { id: 'hotels',  label: 'Hotels',    icon: Building2 },
  { id: 'cabs',    label: 'Cabs',      icon: Car       },
  { id: 'trains',  label: 'Trains',    icon: Train     },
];

const TRIP_TYPES = ['One Way', 'Round Trip', 'Multi-City'];

const TOP_ROUTES = [
  { from: 'DEL', to: 'GOI', price: '₹3,299', airline: 'IndiGo',    duration: '2h 30m' },
  { from: 'BOM', to: 'BLR', price: '₹2,199', airline: 'Air India',  duration: '1h 45m' },
  { from: 'DEL', to: 'BOM', price: '₹4,599', airline: 'Vistara',    duration: '2h 10m' },
  { from: 'BLR', to: 'HYD', price: '₹1,899', airline: 'SpiceJet',   duration: '1h 20m' },
];

const POPULAR_HOTELS = [
  { name: 'Taj Exotica',   city: 'Goa',     rating: 4.8, price: '₹8,200/night', type: 'Resort'  },
  { name: 'The Oberoi',    city: 'Mumbai',  rating: 4.9, price: '₹15,000/night', type: 'Luxury' },
  { name: 'Zostel',        city: 'Manali',  rating: 4.5, price: '₹1,200/night', type: 'Hostel'  },
  { name: 'Lemon Tree',    city: 'Jaipur',  rating: 4.3, price: '₹4,500/night', type: 'Hotel'   },
];

const FEATURES = [
  { icon: TrendingDown, title: 'Min-Cash-Flow Settlement', desc: 'Proprietary algorithm resolves all group debts with the fewest possible transactions. O(n²) optimal.', accent: 'var(--orange)' },
  { icon: Shield, title: 'UPI Deep-Link Pay', desc: 'One-tap GPay, PhonePe, Paytm integration. Payment confirms and ledger auto-updates.', accent: 'var(--green)' },
  { icon: Zap, title: 'Real-Time Ledger', desc: 'Live budget tracking vs pool. Know your burn rate at every checkpoint in the journey.', accent: '#6366F1' },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<BookingTab>('flights');
  const [tripType, setTripType] = useState('Round Trip');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [departDate, setDepartDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [cabCity, setCabCity] = useState('');
  const [hotelCity, setHotelCity] = useState('');
  const [trainFrom, setTrainFrom] = useState('');
  const [trainTo, setTrainTo] = useState('');

  const swapRoutes = () => { const tmp = from; setFrom(to); setTo(tmp); };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--canvas)' }}>
      <Header />
      <Navigator />

      <section style={{ background: 'linear-gradient(160deg, var(--navy) 0%, #2C3E50 100%)', padding: '52px 24px 72px' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <div style={{ marginBottom: '32px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--orange)', marginBottom: '10px', fontFamily: 'Inter, sans-serif' }}>Group Travel Intelligence Platform</p>
            <h1 style={{ fontSize: 'clamp(28px, 5vw, 46px)', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.1, letterSpacing: '-0.03em', fontFamily: 'Inter, sans-serif', marginBottom: '10px' }}>
              Search Every Flight.<br /><span style={{ color: 'var(--orange)' }}>Split Every Rupee.</span>
            </h1>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.60)', fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>Compare fares, book hotels, and settle group expenses — one unified platform.</p>
          </div>

          <div style={{ background: '#FFFFFF', borderRadius: '10px', boxShadow: '0 20px 60px rgba(0,0,0,0.30)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--canvas-alt)' }}>
              {TABS.map(tab => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex: 1, padding: '14px 8px', border: 'none', borderBottom: active ? '3px solid var(--orange)' : '3px solid transparent', background: active ? '#FFFFFF' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', fontWeight: active ? 600 : 400, color: active ? 'var(--orange)' : 'var(--ink-soft)', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s ease' }}>
                    <Icon size={15} strokeWidth={active ? 2.2 : 1.8} />{tab.label}
                  </button>
                );
              })}
            </div>

            <div style={{ padding: '24px' }}>
              {activeTab === 'flights' && (
                <div>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '18px' }}>
                    {TRIP_TYPES.map(t => (
                      <button key={t} onClick={() => setTripType(t)} style={{ padding: '5px 14px', borderRadius: '4px', border: `1px solid ${tripType === t ? 'var(--orange)' : 'var(--border-dark)'}`, background: tripType === t ? 'var(--orange-light)' : 'transparent', color: tripType === t ? 'var(--orange-dark)' : 'var(--ink-soft)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s ease' }}>{t}</button>
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 36px 1fr 1fr 1fr 44px', gap: '8px', alignItems: 'center' }}>
                    <div className="search-field"><Plane size={14} style={{ color: 'var(--ink-ghost)', flexShrink: 0 }} /><input placeholder="From — city or airport" value={from} onChange={e => setFrom(e.target.value)} /></div>
                    <button onClick={swapRoutes} style={{ width: '36px', height: '36px', border: '1px solid var(--border-dark)', borderRadius: 'var(--r-sm)', background: 'var(--canvas-alt)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-soft)', transition: 'all 0.15s ease', alignSelf: 'center', flexShrink: 0 }} onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--orange)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--orange)'; }} onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-dark)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--ink-soft)'; }}><ArrowLeftRight size={13} /></button>
                    <div className="search-field"><MapPin size={14} style={{ color: 'var(--ink-ghost)', flexShrink: 0 }} /><input placeholder="To — city or airport" value={to} onChange={e => setTo(e.target.value)} /></div>
                    <div className="search-field"><Calendar size={14} style={{ color: 'var(--ink-ghost)', flexShrink: 0 }} /><input type="date" placeholder="Depart" value={departDate} onChange={e => setDepartDate(e.target.value)} style={{ fontSize: '13px' }} /></div>
                    {tripType === 'Round Trip' && (<div className="search-field"><Calendar size={14} style={{ color: 'var(--ink-ghost)', flexShrink: 0 }} /><input type="date" placeholder="Return" value={returnDate} min={departDate} onChange={e => setReturnDate(e.target.value)} style={{ fontSize: '13px' }} /></div>)}
                    <Link href="/planning" style={{ textDecoration: 'none', gridColumn: tripType !== 'Round Trip' ? 'span 2' : 'auto' }}><button className="btn-primary" style={{ width: '100%', height: '48px', justifyContent: 'center', borderRadius: 'var(--r-md)', fontSize: '14px' }}><Search size={15} />Search</button></Link>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--ink-soft)', fontSize: '13px' }}><Users size={13} /><span>Passengers:</span></div>
                    {[1,2,3,4,5,6].map(n => (<button key={n} onClick={() => setPassengers(n)} style={{ width: '30px', height: '30px', borderRadius: 'var(--r-sm)', border: `1px solid ${passengers === n ? 'var(--orange)' : 'var(--border-dark)'}`, background: passengers === n ? 'var(--orange)' : 'transparent', color: passengers === n ? '#FFFFFF' : 'var(--ink-soft)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s ease' }}>{n}</button>))}
                    <span style={{ fontSize: '12px', color: 'var(--ink-ghost)' }}>{passengers > 1 ? 'travellers' : 'traveller'}</span>
                  </div>
                </div>
              )}
              {activeTab === 'hotels' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 44px', gap: '8px' }}>
                  <div className="search-field" style={{ gridColumn: 'span 1' }}><MapPin size={14} style={{ color: 'var(--ink-ghost)', flexShrink: 0 }} /><input placeholder="City or property name" value={hotelCity} onChange={e => setHotelCity(e.target.value)} /></div>
                  <div className="search-field"><Calendar size={14} style={{ color: 'var(--ink-ghost)', flexShrink: 0 }} /><input type="date" placeholder="Check-in" style={{ fontSize: '13px' }} /></div>
                  <div className="search-field"><Calendar size={14} style={{ color: 'var(--ink-ghost)', flexShrink: 0 }} /><input type="date" placeholder="Check-out" style={{ fontSize: '13px' }} /></div>
                  <Link href="/planning" style={{ textDecoration: 'none' }}><button className="btn-primary" style={{ width: '100%', height: '48px', justifyContent: 'center', borderRadius: 'var(--r-md)' }}><Search size={15} /></button></Link>
                </div>
              )}
              {activeTab === 'cabs' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 44px', gap: '8px' }}>
                  <div className="search-field"><MapPin size={14} style={{ color: 'var(--ink-ghost)', flexShrink: 0 }} /><input placeholder="Pickup location" value={cabCity} onChange={e => setCabCity(e.target.value)} /></div>
                  <div className="search-field"><MapPin size={14} style={{ color: 'var(--ink-ghost)', flexShrink: 0 }} /><input placeholder="Drop location" /></div>
                  <div className="search-field"><Calendar size={14} style={{ color: 'var(--ink-ghost)', flexShrink: 0 }} /><input type="datetime-local" style={{ fontSize: '12px' }} /></div>
                  <Link href="/planning" style={{ textDecoration: 'none' }}><button className="btn-primary" style={{ width: '100%', height: '48px', justifyContent: 'center', borderRadius: 'var(--r-md)' }}><Search size={15} /></button></Link>
                </div>
              )}
              {activeTab === 'trains' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 36px 1fr 1fr 44px', gap: '8px', alignItems: 'center' }}>
                  <div className="search-field"><Train size={14} style={{ color: 'var(--ink-ghost)', flexShrink: 0 }} /><input placeholder="From station" value={trainFrom} onChange={e => setTrainFrom(e.target.value)} /></div>
                  <button onClick={() => { const t = trainFrom; setTrainFrom(trainTo); setTrainTo(t); }} style={{ width: '36px', height: '36px', border: '1px solid var(--border-dark)', borderRadius: 'var(--r-sm)', background: 'var(--canvas-alt)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-soft)', flexShrink: 0 }}><ArrowLeftRight size={13} /></button>
                  <div className="search-field"><MapPin size={14} style={{ color: 'var(--ink-ghost)', flexShrink: 0 }} /><input placeholder="To station" value={trainTo} onChange={e => setTrainTo(e.target.value)} /></div>
                  <div className="search-field"><Calendar size={14} style={{ color: 'var(--ink-ghost)', flexShrink: 0 }} /><input type="date" style={{ fontSize: '13px' }} /></div>
                  <Link href="/planning" style={{ textDecoration: 'none' }}><button className="btn-primary" style={{ width: '100%', height: '48px', justifyContent: 'center', borderRadius: 'var(--r-md)' }}><Search size={15} /></button></Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section style={{ backgroundColor: 'var(--canvas-alt)', borderBottom: '1px solid var(--border)', padding: '0 24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '0', overflowX: 'auto' }}>
          {[{label:'Travellers managed',value:'10,000+'},{label:'Optimal debt transactions',value:'O(n²)'},{label:'UPI integrations',value:'4 apps'},{label:'Settlement accuracy',value:'100%'}].map((stat,i) => (
            <div key={i} style={{ padding: '18px 32px', borderRight: i < 3 ? '1px solid var(--border)' : 'none', flexShrink: 0 }}>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--orange)', fontFamily: 'Inter, sans-serif', lineHeight: 1, marginBottom: '3px' }}>{stat.value}</div>
              <div style={{ fontSize: '12px', color: 'var(--ink-soft)', fontWeight: 400 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '20px' }}>
          <div><h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)', fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}>Popular Routes</h2><p style={{ fontSize: '13px', color: 'var(--ink-soft)', marginTop: '3px' }}>Lowest fares on trending Indian routes</p></div>
          <Link href="/planning" style={{ textDecoration: 'none' }}><button className="btn-ghost" style={{ padding: '6px 14px', fontSize: '12px' }}>View all routes <ArrowRight size={12} /></button></Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
          {TOP_ROUTES.map((route, i) => (
            <Link key={i} href="/planning" style={{ textDecoration: 'none' }}>
              <div className="k-card" style={{ padding: '18px 20px', cursor: 'pointer', transition: 'box-shadow 0.15s ease, border-color 0.15s ease' }} onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-lg)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--orange)'; }} onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-sm)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--ink)', fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}>{route.from}</span>
                  <Plane size={14} style={{ color: 'var(--orange)', flexShrink: 0 }} />
                  <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--ink)', fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}>{route.to}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div><div style={{ fontSize: '12px', color: 'var(--ink-ghost)', marginBottom: '2px' }}>{route.airline}</div><div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--ink-soft)', fontSize: '12px' }}><Clock size={11} />{route.duration}</div></div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--orange)', fontFamily: 'Inter, sans-serif' }}>{route.price}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section style={{ backgroundColor: 'var(--canvas-alt)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '20px' }}>
            <div><h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)', fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}>Hotel Picks</h2><p style={{ fontSize: '13px', color: 'var(--ink-soft)', marginTop: '3px' }}>Curated stays for every budget</p></div>
            <Link href="/planning" style={{ textDecoration: 'none' }}><button className="btn-ghost" style={{ padding: '6px 14px', fontSize: '12px' }}>Browse hotels <ArrowRight size={12} /></button></Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            {POPULAR_HOTELS.map((hotel, i) => (
              <Link key={i} href="/planning" style={{ textDecoration: 'none' }}>
                <div className="k-card" style={{ padding: '18px 20px', cursor: 'pointer', transition: 'box-shadow 0.15s ease, border-color 0.15s ease' }} onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-lg)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--orange)'; }} onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-sm)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div><div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)', fontFamily: 'Inter, sans-serif', marginBottom: '2px' }}>{hotel.name}</div><div style={{ fontSize: '12px', color: 'var(--ink-soft)', display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={11} />{hotel.city}</div></div>
                    <span className="badge badge-muted">{hotel.type}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--amber)', fontWeight: 600 }}><Star size={12} style={{ fill: 'var(--amber)', strokeWidth: 0 }} />{hotel.rating}</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--orange)', fontFamily: 'Inter, sans-serif' }}>{hotel.price}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: '28px' }}><span className="badge badge-orange" style={{ marginBottom: '12px', display: 'inline-flex' }}>Group Logistics Engine</span><h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--ink)', fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}>Beyond booking — manage the money too</h2></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          {FEATURES.map((f, i) => { const Icon = f.icon; return (<div key={i} className="k-card" style={{ padding: '24px' }}><div style={{ width: '36px', height: '36px', borderRadius: 'var(--r-sm)', background: `${f.accent}14`, border: `1px solid ${f.accent}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}><Icon size={17} style={{ color: f.accent }} /></div><h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px', fontFamily: 'Inter, sans-serif' }}>{f.title}</h3><p style={{ fontSize: '13px', color: 'var(--ink-soft)', lineHeight: 1.6, margin: 0 }}>{f.desc}</p></div>); })}
        </div>
      </section>

      <section style={{ backgroundColor: 'var(--navy)', padding: '48px 24px' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#FFFFFF', fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em', marginBottom: '10px' }}>Ready to plan your next group trip?</h2>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', marginBottom: '28px', lineHeight: 1.6 }}>Add your crew, set a budget, log expenses, and settle debts in minutes.</p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/planning" style={{ textDecoration: 'none' }}><button className="btn-primary" style={{ padding: '12px 28px', fontSize: '14px' }}>Start Planning <ArrowRight size={14} /></button></Link>
            <Link href="/ledger" style={{ textDecoration: 'none' }}><button style={{ padding: '11px 28px', fontSize: '14px', border: '1px solid rgba(255,255,255,0.20)', borderRadius: 'var(--r-md)', background: 'transparent', color: 'rgba(255,255,255,0.75)', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 500, transition: 'all 0.15s ease', display: 'inline-flex', alignItems: 'center', gap: '7px' }} onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF'; }} onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.75)'; }}>View Ledger</button></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
