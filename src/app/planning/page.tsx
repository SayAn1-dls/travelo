'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Calendar, IndianRupee, ChevronRight, Plane } from 'lucide-react';
import Header from '@/components/layout/Header';
import ParticipantForm from '@/components/logistics/ParticipantForm';
import { Participant, TripData } from '@/lib/types';

const STEP_LABELS = ['Destination', 'Your Crew', 'Budget & Dates', 'Review'];
const STEP_EMOJIS = ['🌍', '👥', '💰', '🚀'];
const POPULAR_DESTINATIONS = ['Goa 🏖️', 'Manali 🏔️', 'Jaipur 🏰', 'Kerala 🌿', 'Thailand 🌴', 'Bali 🌺'];

export default function PlanningPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [destination, setDestination] = useState('');
  const [participantCount, setParticipantCount] = useState(2);
  const [participants, setParticipants] = useState<Partial<Participant>[]>([]);
  const [departDate, setDepartDate] = useState('');
  const [arriveDate, setArriveDate] = useState('');
  const [budget, setBudget] = useState('');

  const canProceed = () => {
    if (step === 0) return destination.trim().length > 0;
    if (step === 1) return participants.every(p => p.name && p.name.trim().length > 0);
    if (step === 2) return departDate && arriveDate && parseFloat(budget) > 0;
    return true;
  };

  const handleLaunch = () => {
    const fullParticipants: Participant[] = participants.map((p, i) => ({
      id: `p-${i}`, name: p.name ?? `Member ${i + 1}`, contribution: p.contribution ?? 0,
      amountOwed: 0, amountPaid: 0, status: 'owing',
    }));
    const tripData: TripData = {
      id: `trip-${Date.now()}`, destination, departDate, arriveDate,
      budget: parseFloat(budget), participants: fullParticipants,
      transactions: [], notifications: [], status: 'active',
    };
    sessionStorage.setItem('travelo-trip', JSON.stringify(tripData));
    router.push('/ledger');
  };

  const totalContributions = participants.reduce((s, p) => s + (p.contribution ?? 0), 0);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <Header />
      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '44px 24px 100px' }}>
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '14px' }}>✈️</div>
          <h1 className="fredoka" style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.15, marginBottom: '10px' }}>
            Plan Your Next{' '}
            <span style={{ background: 'linear-gradient(90deg, #0066FF, #FF4F17)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Adventure</span>
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', fontFamily: 'Plus Jakarta Sans, sans-serif', lineHeight: 1.65 }}>Tell us where you&apos;re going and who&apos;s coming — Travelo handles the rest.</p>
        </div>
        <div style={{ display: 'flex', gap: '6px', marginBottom: '36px', alignItems: 'center' }}>
          {STEP_LABELS.map((label, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: i < STEP_LABELS.length - 1 ? 1 : 'none' }}>
              <div onClick={() => i < step && setStep(i)} style={{ width: '36px', height: '36px', borderRadius: '50%', background: i < step ? 'linear-gradient(135deg, #0066FF, #00B4D8)' : i === step ? '#0066FF' : 'var(--bg-secondary)', border: `2px solid ${i <= step ? '#0066FF' : 'var(--border-light)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: i < step ? '14px' : '13px', fontWeight: 700, color: i <= step ? '#FFFFFF' : 'var(--text-muted)', flexShrink: 0, cursor: i < step ? 'pointer' : 'default', transition: 'all 0.3s ease', boxShadow: i === step ? '0 4px 14px rgba(0,102,255,0.35)' : 'none' }}>{i < step ? '✓' : STEP_EMOJIS[i]}</div>
              {i < STEP_LABELS.length - 1 && <div style={{ flex: 1, height: '2px', background: i < step ? 'linear-gradient(90deg, #0066FF, #00B4D8)' : 'var(--border-light)', borderRadius: '1px', transition: 'background 0.3s ease' }} />}
            </div>
          ))}
        </div>
        <div className="vibrant-card slide-in" style={{ padding: '32px 36px', marginBottom: '20px' }}>
          {step === 0 && (
            <div>
              <h2 className="fredoka" style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>Where to? 🌍</h2>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '26px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Pick a destination and tell us how many are coming.</p>
              <div style={{ position: 'relative', marginBottom: '10px' }}>
                <MapPin size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#0066FF', pointerEvents: 'none', zIndex: 1 }} />
                <input className="vibrant-input" placeholder="City, state, or country..." value={destination} onChange={e => setDestination(e.target.value)} style={{ paddingLeft: '42px', fontSize: '16px' }} autoFocus />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '26px' }}>
                {POPULAR_DESTINATIONS.map((d, i) => (<button key={i} onClick={() => setDestination(d.split(' ')[0])} style={{ padding: '6px 14px', borderRadius: 'var(--radius-pill)', border: `1.5px solid ${destination === d.split(' ')[0] ? '#0066FF' : 'var(--border-light)'}`, background: destination === d.split(' ')[0] ? 'rgba(0,102,255,0.08)' : 'var(--bg-secondary)', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: destination === d.split(' ')[0] ? '#0066FF' : 'var(--text-secondary)', fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'all 0.15s ease' }}>{d}</button>))}
              </div>
              <label className="jakarta" style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '12px' }}>👥 How many travellers?</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                {[2, 3, 4, 5, 6, 7, 8].map(n => (<button key={n} onClick={() => setParticipantCount(n)} style={{ width: '44px', height: '44px', borderRadius: '50%', border: `2px solid ${participantCount === n ? '#0066FF' : 'var(--border-light)'}`, background: participantCount === n ? 'linear-gradient(135deg, #0066FF, #00B4D8)' : 'var(--bg-secondary)', color: participantCount === n ? '#FFFFFF' : 'var(--text-secondary)', fontSize: '15px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s ease', fontFamily: 'Plus Jakarta Sans, sans-serif', boxShadow: participantCount === n ? '0 4px 12px rgba(0,102,255,0.30)' : 'none' }}>{n}</button>))}
                <input type="number" min={2} max={20} value={participantCount} onChange={e => setParticipantCount(Math.max(2, parseInt(e.target.value) || 2))} className="vibrant-input" style={{ width: '64px', textAlign: 'center' }} placeholder="N" />
              </div>
            </div>
          )}
          {step === 1 && (
            <div>
              <h2 className="fredoka" style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>Add your crew 👥</h2>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '26px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Name each person and their initial contribution to the group pool.</p>
              <ParticipantForm count={participantCount} participants={participants} onChange={setParticipants} />
              {totalContributions > 0 && (<div style={{ marginTop: '18px', padding: '14px 18px', background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', borderRadius: 'var(--radius-lg)', border: '1.5px solid rgba(0,102,255,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 600 }}>💰 Total Group Pool</span><span className="fredoka" style={{ fontSize: '22px', fontWeight: 700, color: '#0066FF' }}>₹{totalContributions.toLocaleString('en-IN')}</span></div>)}
            </div>
          )}
          {step === 2 && (
            <div>
              <h2 className="fredoka" style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>Set the budget 💰</h2>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '26px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Define your travel window and overall budget ceiling.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div><label className="jakarta" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>📅 Departure Date</label><input className="vibrant-input" type="date" value={departDate} onChange={e => setDepartDate(e.target.value)} /></div>
                <div><label className="jakarta" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>🏠 Return Date</label><input className="vibrant-input" type="date" value={arriveDate} min={departDate} onChange={e => setArriveDate(e.target.value)} /></div>
              </div>
              <div><label className="jakarta" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>💸 Budget Ceiling (₹)</label><div style={{ position: 'relative' }}><IndianRupee size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#0066FF', pointerEvents: 'none', zIndex: 1 }} /><input className="vibrant-input" type="number" placeholder="e.g. 50000" value={budget} onChange={e => setBudget(e.target.value)} min={1} style={{ paddingLeft: '40px' }} /></div></div>
            </div>
          )}
          {step === 3 && (
            <div>
              <h2 className="fredoka" style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>Ready to go! 🚀</h2>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '26px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Review your trip details before launching the ledger.</p>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1.5px solid var(--border-light)' }}>
                {[{ label: '📍 Destination', value: destination }, { label: '💸 Budget Ceiling', value: `₹${parseFloat(budget).toLocaleString('en-IN')}` }, { label: '💰 Capital Pool', value: `₹${totalContributions.toLocaleString('en-IN')}` }].map((row, i) => (<div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: i < 2 ? '1px solid var(--border-light)' : 'none' }}><span className="jakarta" style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>{row.label}</span><span className="jakarta" style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{row.value}</span></div>))}
              </div>
              <div style={{ marginTop: '16px' }}><p className="jakarta" style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '10px' }}>👥 Travellers ({participantCount})</p><div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>{participants.map((p, i) => (<span key={i} className="badge badge-blue">{p.name}</span>))}</div></div>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          {step > 0 && <button className="btn-secondary" onClick={() => setStep(s => s - 1)}>← Back</button>}
          {step < 3 ? (<button className="btn-primary" onClick={() => setStep(s => s + 1)} disabled={!canProceed()} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>Continue <ChevronRight size={14} /></button>) : (<button className="btn-orange" onClick={handleLaunch} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '13px 30px' }}><Plane size={16} />Launch Trip! 🚀</button>)}
        </div>
      </main>
    </div>
  );
}
