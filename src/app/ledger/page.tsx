'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import CapitalLedger from '@/components/logistics/CapitalLedger';
import TransactionPanel from '@/components/logistics/TransactionPanel';
import NotificationFeed from '@/components/logistics/NotificationFeed';
import PaymentModal from '@/components/logistics/PaymentModal';
import { TripData, Participant } from '@/lib/types';
import { splitEqually } from '@/lib/utils/debtSolver';
import { Calendar, ArrowLeft, Plane } from 'lucide-react';
import Link from 'next/link';

function generateId(): string { return Math.random().toString(36).substring(2, 11); }

export default function LedgerPage() {
  const router = useRouter();
  const [trip, setTrip] = useState<TripData | null>(null);
  const [paymentTarget, setPaymentTarget] = useState<Participant | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('travelo-trip');
    if (stored) { try { setTrip(JSON.parse(stored)); } catch { router.push('/planning'); } }
    else { router.push('/planning'); }
  }, []);

  const persistTrip = (updated: TripData) => { setTrip(updated); sessionStorage.setItem('travelo-trip', JSON.stringify(updated)); };

  const addTransaction = (paidById: string, amount: number, description: string) => {
    if (!trip) return;
    const payer = trip.participants.find(p => p.id === paidById);
    if (!payer) return;
    const perHead = splitEqually(amount, trip.participants.length);
    const updatedParticipants = trip.participants.map(p => p.id === paidById ? { ...p, amountPaid: p.amountPaid + amount, amountOwed: p.amountOwed + perHead } : { ...p, amountOwed: p.amountOwed + perHead });
    const newTxn = { id: generateId(), paidBy: paidById, paidByName: payer.name, amount, description, timestamp: new Date(), splitAmong: trip.participants.map(p => p.id), settled: false };
    const newNotifs = trip.participants.filter(p => p.id !== paidById).map(d => ({ id: generateId(), type: 'debt_reminder' as const, message: `${payer.name} paid ₹${amount.toLocaleString('en-IN')} for "${description}". Your share: ₹${perHead.toLocaleString('en-IN')}. Please settle up! 💸`, targetParticipantId: d.id, read: false, timestamp: new Date() }));
    persistTrip({ ...trip, participants: updatedParticipants, transactions: [...trip.transactions, newTxn], notifications: [...trip.notifications, ...newNotifs] });
  };

  const settleParticipant = (participantId: string) => {
    if (!trip) return;
    const p = trip.participants.find(x => x.id === participantId);
    if (!p) return;
    const updatedParticipants = trip.participants.map(x => x.id === participantId ? { ...x, status: 'settled' as const } : x);
    const allSettled = updatedParticipants.every(x => x.status === 'settled' || (x.amountPaid - x.amountOwed) >= 0);
    const settlementNote = { id: generateId(), type: 'payment_received' as const, message: `🎉 ${p.name} has settled their dues.${allSettled ? ' All members are now balanced!' : ''}`, read: false, timestamp: new Date() };
    persistTrip({ ...trip, participants: updatedParticipants, notifications: [settlementNote, ...trip.notifications], status: allSettled ? 'completed' : trip.status });
  };

  const markRead = (id: string) => { if (!trip) return; persistTrip({ ...trip, notifications: trip.notifications.map(n => n.id === id ? { ...n, read: true } : n) }); };
  const handlePayClick = (participant: Participant) => setPaymentTarget(participant);
  const handleConfirmPayment = (participantId: string) => { settleParticipant(participantId); setPaymentTarget(null); };
  const getCreditorForDebtor = (): string => { if (!trip) return ''; const creditors = trip.participants.filter(p => (p.amountPaid - p.amountOwed) > 0); return creditors[0]?.name ?? 'Group'; };
  const getAmountDue = (debtor: Participant): number => Math.abs(debtor.amountPaid - debtor.amountOwed);

  if (!trip) return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}><div style={{ fontSize: '48px', marginBottom: '16px' }}>✈️</div><div className="spinner" style={{ margin: '0 auto 16px' }} /><p className="fredoka" style={{ color: 'var(--text-secondary)', fontSize: '20px', fontWeight: 600 }}>Loading your trip...</p></div>
    </div>
  );

  const totalSpent = trip.transactions.reduce((s, t) => s + t.amount, 0);
  const totalPool = trip.participants.reduce((s, p) => s + p.contribution, 0);
  const unreadCount = trip.notifications.filter(n => !n.read).length;
  const days = trip.departDate && trip.arriveDate ? Math.ceil((new Date(trip.arriveDate).getTime() - new Date(trip.departDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const statusGradient = trip.status === 'completed' ? 'linear-gradient(135deg, #F0FDF4, #DCFCE7)' : 'linear-gradient(135deg, #EFF6FF, #DBEAFE)';
  const statusColor = trip.status === 'completed' ? '#00966B' : '#0066FF';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <Header notificationCount={unreadCount} />
      <main style={{ maxWidth: '1120px', margin: '0 auto', padding: '32px 24px 80px' }}>
        <div style={{ marginBottom: '32px' }}>
          <Link href="/planning" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '16px', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 600 }}><ArrowLeft size={13} /> Back to Planning</Link>
          <div style={{ background: statusGradient, borderRadius: 'var(--radius-xl)', padding: '24px 28px', border: `1.5px solid ${statusColor}22`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '52px', height: '52px', background: `${statusColor}18`, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px' }}>{trip.status === 'completed' ? '🎉' : '✈️'}</div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}><span className="jakarta" style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: statusColor }}>{trip.status} trip</span><span style={{ padding: '3px 10px', borderRadius: 'var(--radius-pill)', background: `${statusColor}18`, fontSize: '11px', fontWeight: 700, color: statusColor, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{trip.participants.length} travellers</span></div>
                <h1 className="fredoka" style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.15 }}>📍 {trip.destination}</h1>
                {trip.departDate && (<div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}><Calendar size={13} style={{ color: 'var(--text-muted)' }} /><span className="jakarta" style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>{new Date(trip.departDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })} — {new Date(trip.arriveDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}{days > 0 && ` · ${days} nights`}</span></div>)}
              </div>
            </div>
            <Link href="/planning" style={{ textDecoration: 'none' }}><button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 20px', fontSize: '13px' }}><Plane size={13} /> New Trip</button></Link>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '22px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <CapitalLedger trip={trip} totalSpent={totalSpent} totalPool={totalPool} onSettle={settleParticipant} onPayClick={handlePayClick} />
            <TransactionPanel transactions={trip.transactions} participants={trip.participants} onAddTransaction={addTransaction} />
          </div>
          <div><NotificationFeed notifications={trip.notifications} onMarkRead={markRead} /></div>
        </div>
      </main>
      {paymentTarget && (<PaymentModal participant={paymentTarget} creditorName={getCreditorForDebtor()} amountDue={getAmountDue(paymentTarget)} onClose={() => setPaymentTarget(null)} onConfirmPayment={handleConfirmPayment} />)}
    </div>
  );
}
