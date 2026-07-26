'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Calendar, IndianRupee, ChevronRight, Plane, Check } from 'lucide-react';
import Header from '@/components/layout/Header';
import ParticipantForm from '@/components/logistics/ParticipantForm';
import { Participant, TripData } from '@/lib/types';

const STEP_LABELS = ['Destination', 'Crew', 'Budget & Dates', 'Review'];

const POPULAR_DESTINATIONS = ['Goa', 'Manali', 'Jaipur', 'Kerala', 'Thailand', 'Bali'];

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
      id: `p-${i}`,
      name: p.name ?? `Member ${i + 1}`,
      contribution: p.contribution ?? 0,
      amountOwed: 0,
      amountPaid: 0,
      status: 'owing',
    }));

    const tripData: TripData = {
      id: `trip-${Date.now()}`,
      destination,
      departDate,
      arriveDate,
      budget: parseFloat(budget),
      participants: fullParticipants,
      transactions: [],
      notifications: [],
      status: 'active',
    };

    sessionStorage.setItem('travelo-trip', JSON.stringify(tripData));
    router.push('/ledger');
  };

  const totalContributions = participants.reduce((s, p) => s + (p.contribution ?? 0), 0);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--canvas)' }}>
      <Header />

      <main style={{ maxWidth: '640px', margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Page header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '24px', fontWeight: 700,
            color: 'var(--ink)', fontFamily: 'Inter, sans-serif',
            letterSpacing: '-0.02em', marginBottom: '6px',
          }}>
            Plan a Trip
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>
            Set up your group, define the budget, and launch your travel ledger.
          </p>
        </div>

        {/* Step Progress */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '28px', alignItems: 'center' }}>
          {STEP_LABELS.map((label, i) => (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                flex: i < STEP_LABELS.length - 1 ? 1 : 'none',
              }}
            >
              <div
                onClick={() => i < step && setStep(i)}
                style={{
                  width: '26px', height: '26px',
                  borderRadius: '50%',
                  background: i < step ? 'var(--orange)' : i === step ? 'var(--navy)' : 'var(--canvas-muted)',
                  border: `2px solid ${i <= step ? (i < step ? 'var(--orange)' : 'var(--navy)') : 'var(--border-dark)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 700,
                  color: i <= step ? '#FFFFFF' : 'var(--ink-ghost)',
                  flexShrink: 0,
                  cursor: i < step ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                }}
              >
                {i < step ? <Check size={12} strokeWidth={2.5} /> : i + 1}
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div style={{
                  flex: 1, height: '2px',
                  background: i < step ? 'var(--orange)' : 'var(--border)',
                  transition: 'background 0.2s ease',
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Step label */}
        <div style={{ marginBottom: '20px' }}>
          <span className="badge badge-navy">
            Step {step + 1} of {STEP_LABELS.length}
          </span>
          <span style={{
            fontSize: '11px', color: 'var(--ink-ghost)',
            marginLeft: '8px', fontFamily: 'Inter, sans-serif',
          }}>
            {STEP_LABELS[step]}
          </span>
        </div>

        {/* Step Card */}
        <div className="k-card slide-in" style={{ padding: '28px', marginBottom: '16px' }}>

          {/* Step 0: Destination */}
          {step === 0 && (
            <div>
              <h2 style={{
                fontSize: '18px', fontWeight: 700,
                color: 'var(--ink)', fontFamily: 'Inter, sans-serif',
                letterSpacing: '-0.02em', marginBottom: '6px',
              }}>
                Where to?
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--ink-ghost)', marginBottom: '20px' }}>
                Pick a destination and crew size.
              </p>

              <div style={{ position: 'relative', marginBottom: '12px' }}>
                <MapPin size={14} style={{
                  position: 'absolute', left: '12px', top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--orange)', pointerEvents: 'none', zIndex: 1,
                }} />
                <input
                  className="k-input"
                  placeholder="City, state, or country..."
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  style={{ paddingLeft: '34px' }}
                  autoFocus
                />
              </div>

              {/* Popular destinations */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '24px' }}>
                {POPULAR_DESTINATIONS.map((d, i) => {
                  const active = destination === d;
                  return (
                    <button
                      key={i}
                      onClick={() => setDestination(d)}
                      style={{
                        padding: '5px 14px',
                        borderRadius: 'var(--r-md)',
                        border: `1px solid ${active ? 'var(--orange)' : 'var(--border-dark) '}`,
                        background: active ? 'var(--orange-light)' : 'transparent',
                        cursor: 'pointer',
                        fontSize: '12px', fontWeight: active ? 600 : 400,
                        color: active ? 'var(--orange-dark)' : 'var(--ink-soft)',
                        fontFamily: 'Inter, sans-serif',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>

              <div style={{
                borderTop: '1px solid var(--border)',
                paddingTop: '20px',
              }}>
                <label style={{
                  fontSize: '12px', fontWeight: 600,
                  color: 'var(--ink-soft)',
                  display: 'block', marginBottom: '12px',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                  Group Size
                </label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {[2, 3, 4, 5, 6, 7, 8].map(n => (
                    <button
                      key={n}
                      onClick={() => setParticipantCount(n)}
                      style={{
                        width: '38px', height: '38px',
                        borderRadius: 'var(--r-md)',
                        border: `1px solid ${participantCount === n ? 'var(--navy)' : 'var(--border-dark)'}`,
                        background: participantCount === n ? 'var(--navy)' : 'transparent',
                        color: participantCount === n ? '#FFFFFF' : 'var(--ink-soft)',
                        fontSize: '13px', fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'Inter, sans-serif',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {n}
                    </button>
                  ))}
                  <input
                    type="number"
                    min={2} max={20}
                    value={participantCount}
                    onChange={e => setParticipantCount(Math.max(2, parseInt(e.target.value) || 2))}
                    className="k-input"
                    style={{ width: '60px', textAlign: 'center' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Crew */}
          {step === 1 && (
            <div>
              <h2 style={{
                fontSize: '18px', fontWeight: 700,
                color: 'var(--ink)', fontFamily: 'Inter, sans-serif',
                letterSpacing: '-0.02em', marginBottom: '6px',
              }}>
                Add crew members
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--ink-ghost)', marginBottom: '20px' }}>
                Name each member and enter their initial contribution.
              </p>
              <ParticipantForm
                count={participantCount}
                participants={participants}
                onChange={setParticipants}
              />
              {totalContributions > 0 && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px 16px',
                  background: 'var(--canvas-alt)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r-card)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ fontSize: '12px', color: 'var(--ink-mid)', fontWeight: 500 }}>
                    Total Group Pool
                  </span>
                  <span style={{
                    fontSize: '18px', fontWeight: 700,
                    color: 'var(--orange)', fontFamily: 'Inter, sans-serif',
                  }}>
                    ₹{totalContributions.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Budget & Dates */}
          {step === 2 && (
            <div>
              <h2 style={{
                fontSize: '18px', fontWeight: 700,
                color: 'var(--ink)', fontFamily: 'Inter, sans-serif',
                letterSpacing: '-0.02em', marginBottom: '6px',
              }}>
                Budget & Dates
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--ink-ghost)', marginBottom: '20px' }}>
                Define your travel window and spending ceiling.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{
                    fontSize: '11px', fontWeight: 600,
                    color: 'var(--ink-soft)',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                    display: 'block', marginBottom: '8px',
                  }}>
                    Departure
                  </label>
                  <input
                    className="k-input"
                    type="date"
                    value={departDate}
                    onChange={e => setDepartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{
                    fontSize: '11px', fontWeight: 600,
                    color: 'var(--ink-soft)',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                    display: 'block', marginBottom: '8px',
                  }}>
                    Return
                  </label>
                  <input
                    className="k-input"
                    type="date"
                    value={arriveDate}
                    min={departDate}
                    onChange={e => setArriveDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={{
                  fontSize: '11px', fontWeight: 600,
                  color: 'var(--ink-soft)',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                  display: 'block', marginBottom: '8px',
                }}>
                  Budget Ceiling (₹)
                </label>
                <div style={{ position: 'relative' }}>
                  <IndianRupee size={13} style={{
                    position: 'absolute', left: '12px', top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--ink-ghost)', pointerEvents: 'none', zIndex: 1,
                  }} />
                  <input
                    className="k-input"
                    type="number"
                    placeholder="e.g. 50000"
                    value={budget}
                    onChange={e => setBudget(e.target.value)}
                    min={1}
                    style={{ paddingLeft: '32px' }}
                  />
                </div>
              </div>

              {budget && totalContributions > 0 && (
                <div style={{
                  marginTop: '12px', padding: '12px 14px',
                  background: parseFloat(budget) <= totalContributions
                    ? 'var(--green-light)' : 'var(--red-light)',
                  border: `1px solid ${parseFloat(budget) <= totalContributions
                    ? 'rgba(5,150,105,0.22)' : 'rgba(220,38,38,0.22)'}`,
                  borderRadius: 'var(--r-card)',
                }}>
                  <p style={{
                    fontSize: '12px', fontWeight: 600, margin: 0,
                    color: parseFloat(budget) <= totalContributions ? 'var(--green)' : 'var(--red)',
                  }}>
                    {parseFloat(budget) <= totalContributions
                      ? `Pool (₹${totalContributions.toLocaleString('en-IN')}) covers the budget.`
                      : `Pool (₹${totalContributions.toLocaleString('en-IN')}) is ₹${(parseFloat(budget) - totalContributions).toLocaleString('en-IN')} short.`}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div>
              <h2 style={{
                fontSize: '18px', fontWeight: 700,
                color: 'var(--ink)', fontFamily: 'Inter, sans-serif',
                letterSpacing: '-0.02em', marginBottom: '6px',
              }}>
                Review & Launch
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--ink-ghost)', marginBottom: '20px' }}>
                Confirm details before activating the ledger.
              </p>

              <div style={{
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-card)',
                overflow: 'hidden',
                marginBottom: '16px',
              }}>
                {[
                  { label: 'Destination', value: destination },
                  { label: 'Travel Window', value: `${new Date(departDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} — ${new Date(arriveDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` },
                  { label: 'Budget Ceiling', value: `₹${parseFloat(budget).toLocaleString('en-IN')}` },
                  { label: 'Capital Pool', value: `₹${totalContributions.toLocaleString('en-IN')}` },
                ].map((row, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 16px',
                    borderBottom: i < 3 ? '1px solid var(--border)' : 'none',
                    backgroundColor: i % 2 === 0 ? 'var(--canvas-alt)' : 'var(--canvas)',
                  }}>
                    <span style={{ fontSize: '12px', color: 'var(--ink-ghost)', fontWeight: 500 }}>
                      {row.label}
                    </span>
                    <span style={{
                      fontSize: '13px', fontWeight: 700,
                      color: 'var(--ink)', fontFamily: 'Inter, sans-serif',
                    }}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              <div>
                <p style={{
                  fontSize: '11px', color: 'var(--ink-ghost)',
                  fontWeight: 600, textTransform: 'uppercase',
                  letterSpacing: '0.05em', marginBottom: '10px',
                }}>
                  Crew ({participantCount})
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {participants.map((p, i) => (
                    <span key={i} className="badge badge-navy">
                      {p.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          {step > 0 && (
            <button className="btn-ghost" onClick={() => setStep(s => s - 1)}>
              Back
            </button>
          )}
          {step < 3 ? (
            <button
              className="btn-primary"
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              style={{ justifyContent: 'center' }}
            >
              Continue <ChevronRight size={14} />
            </button>
          ) : (
            <button
              className="btn-primary"
              onClick={handleLaunch}
              style={{ padding: '11px 28px', justifyContent: 'center' }}
            >
              <Plane size={14} />
              Launch Ledger
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
