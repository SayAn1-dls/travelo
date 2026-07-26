'use client';

import { useState, useCallback } from 'react';
import Header from '@/components/layout/Header';
import TripPlanningForm from '@/components/logistics/ParticipantForm';
import CapitalLedger from '@/components/logistics/CapitalLedger';
import TransactionPanel from '@/components/logistics/TransactionPanel';
import NotificationFeed from '@/components/logistics/NotificationFeed';
import PaymentModal from '@/components/logistics/PaymentModal';
import { TripData, Participant, Transaction, Notification } from '@/lib/types';
import { splitEqually, computeTotalPool } from '@/lib/utils/debtSolver';
import { Globe, Compass, Users, Map, CheckCircle } from 'lucide-react';

export default function Home() {
  // State management
  const [step, setStep] = useState<'welcome' | 'planning' | 'active'>('welcome');
  const [trip, setTrip] = useState<TripData>({
    id: 'trip-1',
    destination: '',
    participants: [],
    budget: 0,
    startDate: new Date(),
    endDate: new Date(),
    status: 'planning',
  });
  const [participantCount, setParticipantCount] = useState(2);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activePayment, setActivePayment] = useState<Participant | null>(null);

  // Handlers
  const handleStartPlanning = () => setStep('planning');

  const handleInitTrip = () => {
    if (!trip.destination || trip.budget <= 0) return;
    const validParticipants = trip.participants.filter(p => p.name.trim() !== '');
    if (validParticipants.length < 2) return;

    setTrip(prev => ({
      ...prev,
      participants: validParticipants,
      status: 'active'
    }));
    setStep('active');

    // Welcome notification
    addNotification('trip_update', `Adventure to ${trip.destination} is live! 🌍`);
  };

  const addNotification = (type: Notification['type'], message: string) => {
    const newNote: Notification = {
      id: `note-${Date.now()}`,
      type,
      message,
      timestamp: new Date(),
      read: false,
    };
    setNotifications(prev => [newNote, ...prev]);
  };

  const handleAddTransaction = (paidById: string, amount: number, description: string) => {
    const payer = trip.participants.find(p => p.id === paidById);
    if (!payer) return;

    const splitAmount = splitEqually(amount, trip.participants.length);
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      amount,
      description,
      paidById,
      paidByName: payer.name,
      timestamp: new Date(),
      splitAmong: trip.participants.map(p => p.id),
    };

    setTransactions(prev => [...prev, newTx]);

    // Update participant balances
    setTrip(prev => ({
      ...prev,
      participants: prev.participants.map(p => ({
        ...p,
        amountPaid: p.id === paidById ? p.amountPaid + amount : p.amountPaid,
        amountOwed: p.amountOwed + splitAmount,
      }))
    }));

    addNotification('payment_received', `${payer.name} logged ₹${amount} for ${description}`);
  };

  const handleSettle = (participantId: string) => {
    setTrip(prev => ({
      ...prev,
      participants: prev.participants.map(p =>
        p.id === participantId ? { ...p, status: 'settled', amountPaid: p.amountOwed } : p
      )
    }));
    addNotification('settlement_complete', `Settlement verified for ${trip.participants.find(p => p.id === participantId)?.name}`);
  };

  const totalSpent = transactions.reduce((acc, t) => acc + t.amount, 0);
  const totalPool = computeTotalPool(trip.participants.map(p => p.contribution));

  return (
    <div className="min-h-screen">
      <Header notificationCount={notifications.filter(n => !n.read).length} />

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* STEP: WELCOME */}
        {step === 'welcome' && (
          <div className="fade-in" style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{
              width: '80px', height: '80px',
              background: 'linear-gradient(135deg, #8B5CF6 0%, #FF4D4D 100%)',
              borderRadius: 'var(--r-bubble)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 32px',
              boxShadow: 'var(--shadow-xl)',
            }}>
              <Globe size={40} color="#FFFFFF" />
            </div>
            <h1 className="hero-title" style={{ fontSize: '64px', color: 'var(--ink)', marginBottom: '16px' }}>
              Adventure Awaits.
            </h1>
            <p style={{
              fontSize: '20px', color: 'var(--ink-soft)',
              maxWidth: '600px', margin: '0 auto 40px',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontWeight: 500,
            }}>
              Plan your group trip, pool your capital, and settle expenses without the drama.
            </p>
            <button className="btn-violet" onClick={handleStartPlanning} style={{ padding: '16px 42px', fontSize: '16px' }}>
              <Compass />
              Start Planning Now
            </button>
          </div>
        )}

        {/* STEP: PLANNING */}
        {step === 'planning' && (
          <div className="slide-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '40px', textAlign: 'center' }}>
              <h2 className="comfortaa" style={{ fontSize: '32px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>
                🗺️ Design Your Journey
              </h2>
              <p style={{ color: 'var(--ink-ghost)', fontSize: '15px' }}>Configure your crew and group budget</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
              {/* General Info */}
              <div className="bubble-card" style={{ padding: '32px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px' }}>
                  <div className="space-y-2">
                    <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--ink-ghost)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Destination</label>
                    <input
                      className="pill-input"
                      placeholder="Where are you heading?"
                      value={trip.destination}
                      onChange={e => setTrip(t => ({ ...t, destination: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--ink-ghost)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Budget (₹)</label>
                    <input
                      className="pill-input"
                      type="number"
                      placeholder="e.g. 50000"
                      value={trip.budget || ''}
                      onChange={e => setTrip(t => ({ ...t, budget: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '24px' }} className="space-y-2">
                  <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--ink-ghost)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Crew Size</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="range" min={2} max={10}
                      value={participantCount}
                      onChange={e => setParticipantCount(Number(e.target.value))}
                      style={{ flex: 1, accentColor: 'var(--violet)' }}
                    />
                    <span className="badge badge-violet" style={{ width: '100px', textAlign: 'center' }}>{participantCount} People</span>
                  </div>
                </div>
              </div>

              {/* Crew Setup */}
              <div className="bubble-card" style={{ padding: '32px' }}>
                <TripPlanningForm
                  count={participantCount}
                  participants={trip.participants}
                  onChange={ps => setTrip(t => ({ ...t, participants: ps as Participant[] }))}
                />
              </div>

              <button className="btn-violet" onClick={handleInitTrip} style={{ padding: '18px', width: '100%', justifyContent: 'center', fontSize: '16px' }}>
                <Map />
                Launch Trip Dashboard
              </button>
            </div>
          </div>
        )}

        {/* STEP: ACTIVE TRIP */}
        {step === 'active' && (
          <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' }}>
            {/* Left Column: Ledger & Settlement */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <h1 className="comfortaa" style={{ fontSize: '28px', fontWeight: 700, color: 'var(--ink)' }}>
                  {trip.destination}
                </h1>
                <span className="badge badge-teal">Active Expedition</span>
              </div>

              <CapitalLedger
                trip={trip}
                totalSpent={totalSpent}
                totalPool={totalPool}
                onSettle={handleSettle}
                onPayClick={setActivePayment}
              />
            </div>

            {/* Right Column: Feed & Logging */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <TransactionPanel
                transactions={transactions}
                participants={trip.participants}
                onAddTransaction={handleAddTransaction}
              />

              <NotificationFeed
                notifications={notifications}
                onMarkRead={id => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))}
              />
            </div>
          </div>
        )}

        {/* MODALS */}
        {activePayment && (
          <PaymentModal
            participant={activePayment}
            creditorName={trip.participants.find(p => p.amountPaid > p.amountOwed)?.name || 'the group'}
            amountDue={activePayment.amountOwed - activePayment.amountPaid}
            onClose={() => setActivePayment(null)}
            onConfirmPayment={handleSettle}
          />
        )}

      </main>
    </div>
  );
}