'use client';

import { TripData, Participant } from '@/lib/types';
import { formatINR, formatCompact, budgetHealthPercent, budgetStatus } from '@/lib/utils/currency';
import { minimumCashFlow } from '@/lib/utils/debtSolver';
import { TrendingUp, TrendingDown, Users, Wallet, ArrowRight, CheckCircle, Clock } from 'lucide-react';

interface CapitalLedgerProps {
  trip: TripData;
  totalSpent: number;
  totalPool: number;
  onSettle: (participantId: string) => void;
  onPayClick: (participant: Participant) => void;
}

export default function CapitalLedger({ trip, totalSpent, totalPool, onSettle, onPayClick }: CapitalLedgerProps) {
  const budgetPct = budgetHealthPercent(totalSpent, trip.budget);
  const status = budgetStatus(totalSpent, trip.budget);
  const remaining = trip.budget - totalSpent;
  const debtEdges = minimumCashFlow(trip.participants);
  const poolVsBudget = budgetHealthPercent(totalPool, trip.budget);
  const statusColor = status === 'safe' ? '#00966B' : status === 'warning' ? '#B45309' : '#DC2626';
  const statusBadge = status === 'safe' ? 'badge-green' : status === 'warning' ? 'badge-amber' : 'badge-red';
  const statusLabel = status === 'safe' ? '✅ On Track' : status === 'warning' ? '⚠️ Caution' : '🚨 Over Budget';
  const STAT_CARDS = [
    { icon: Wallet, label: 'Capital Pool', value: formatCompact(totalPool), sub: `${trip.participants.length} contributors`, gradient: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', iconColor: '#0066FF' },
    { icon: TrendingUp, label: 'Budget Ceiling', value: formatCompact(trip.budget), sub: 'Operational limit', gradient: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)', iconColor: '#00966B' },
    { icon: TrendingDown, label: 'Total Spent', value: formatCompact(totalSpent), sub: statusLabel, gradient: status === 'safe' ? 'linear-gradient(135deg, #F0FDF4, #DCFCE7)' : status === 'warning' ? 'linear-gradient(135deg, #FEFCE8, #FEF9C3)' : 'linear-gradient(135deg, #FFF1F2, #FFE4E6)', iconColor: statusColor },
    { icon: Users, label: 'Remaining', value: formatCompact(Math.abs(remaining)), sub: remaining >= 0 ? 'Available buffer' : 'Deficit', gradient: remaining >= 0 ? 'linear-gradient(135deg, #F0FDF4, #DCFCE7)' : 'linear-gradient(135deg, #FFF1F2, #FFE4E6)', iconColor: remaining >= 0 ? '#00966B' : '#DC2626' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: '14px' }}>
        {STAT_CARDS.map((card, i) => { const Icon = card.icon; return (
          <div key={i} className="vibrant-card" style={{ padding: '20px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: card.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}><Icon size={18} style={{ color: card.iconColor }} /></div>
            <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{card.label}</div>
            <div className="fredoka" style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{card.value}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{card.sub}</div>
          </div>
        ); })}
      </div>
      <div className="vibrant-card" style={{ padding: '22px 26px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <span className="jakarta" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>💰 Budget Health</span>
          <span className={`badge ${statusBadge}`}>{budgetPct.toFixed(1)}% utilised</span>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Expenditure vs Budget</span><span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{formatINR(totalSpent)} / {formatINR(trip.budget)}</span></div>
          <div className="progress-track"><div className={`progress-fill ${status === 'safe' ? 'progress-teal' : 'progress-orange'}`} style={{ width: `${Math.min(budgetPct, 100)}%` }} /></div>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Capital Pool vs Budget</span><span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{formatINR(totalPool)} / {formatINR(trip.budget)}</span></div>
          <div className="progress-track"><div className="progress-fill progress-blue" style={{ width: `${Math.min(poolVsBudget, 100)}%` }} /></div>
        </div>
      </div>
      <div className="vibrant-card" style={{ padding: '22px 26px' }}>
        <div style={{ marginBottom: '18px' }}><h3 className="jakarta" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>👥 Crew Ledger</h3><p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Individual contribution and settlement status</p></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {trip.participants.map((p) => {
            const netBalance = p.amountPaid - p.amountOwed;
            const isCreditor = netBalance > 0;
            const isDebtor = netBalance < 0;
            const isSettled = p.status === 'settled' || Math.abs(netBalance) < 1;
            const avatarGrad = isSettled ? 'linear-gradient(135deg, #F0FDF4, #DCFCE7)' : isCreditor ? 'linear-gradient(135deg, #EFF6FF, #DBEAFE)' : 'linear-gradient(135deg, #FFF1F2, #FFE4E6)';
            const avatarColor = isSettled ? '#00966B' : isCreditor ? '#0066FF' : '#DC2626';
            return (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--border-light)', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}><div style={{ width: '38px', height: '38px', borderRadius: '50%', background: avatarGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, fontFamily: 'Plus Jakarta Sans, sans-serif', color: avatarColor, flexShrink: 0 }}>{p.name.charAt(0).toUpperCase()}</div><div><div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{p.name}</div><div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Contributed: {formatINR(p.contribution)}</div></div></div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}><div style={{ fontSize: '14px', fontWeight: 700, color: avatarColor, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{isSettled ? '—' : isCreditor ? `+${formatINR(netBalance)}` : formatINR(netBalance)}</div><div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{isSettled ? 'Settled ✅' : isCreditor ? 'to receive' : 'owes'}</div></div>
                <div style={{ flexShrink: 0 }}>{isSettled ? <CheckCircle size={18} style={{ color: '#00966B' }} /> : isDebtor ? <button onClick={() => onPayClick(p)} className="btn-orange" style={{ padding: '6px 16px', fontSize: '12px' }}>Pay 💸</button> : <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0066FF', fontSize: '12px', fontWeight: 600 }}><Clock size={13} /> Awaiting</span>}</div>
              </div>
            );
          })}
        </div>
      </div>
      {debtEdges.length > 0 && (
        <div className="vibrant-card" style={{ padding: '22px 26px' }}>
          <div style={{ marginBottom: '18px' }}><h3 className="jakarta" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>⚡ Optimal Settlement Plan</h3><p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Minimum transactions to settle all group debts</p></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {debtEdges.map((edge, i) => (<div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'linear-gradient(135deg, #FFF1F2, #EFF6FF)', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--border-light)' }}><span style={{ fontSize: '13px', fontWeight: 700, color: '#DC2626', fontFamily: 'Plus Jakarta Sans, sans-serif', minWidth: '90px' }}>{edge.from}</span><ArrowRight size={14} style={{ color: '#0066FF', flexShrink: 0 }} /><span style={{ fontSize: '13px', fontWeight: 700, color: '#00966B', fontFamily: 'Plus Jakarta Sans, sans-serif', minWidth: '90px' }}>{edge.to}</span><span style={{ marginLeft: 'auto', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{formatINR(edge.amount)}</span></div>))}
          </div>
        </div>
      )}
    </div>
  );
}
