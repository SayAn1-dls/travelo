'use client';

import { TripData, Participant } from '@/lib/types';
import { formatINR, formatCompact, budgetHealthPercent, budgetStatus } from '@/lib/utils/currency';
import { minimumCashFlow } from '@/lib/utils/debtSolver';
import { TrendingUp, TrendingDown, Users, Wallet, ArrowRight, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

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

  const statusColor = status === 'safe' ? 'var(--green)' : status === 'warning' ? 'var(--amber)' : 'var(--red)';
  const statusBadgeClass = status === 'safe' ? 'badge-green' : status === 'warning' ? 'badge-amber' : 'badge-red';
  const statusLabel = status === 'safe' ? 'On Track' : status === 'warning' ? 'Caution' : 'Over Budget';

  const STAT_CARDS = [
    {
      icon: Wallet, label: 'Capital Pool',
      value: formatCompact(totalPool), sub: `${trip.participants.length} contributors`,
      accent: '#6366F1',
    },
    {
      icon: TrendingUp, label: 'Budget Ceiling',
      value: formatCompact(trip.budget), sub: 'Operational limit',
      accent: 'var(--navy)',
    },
    {
      icon: TrendingDown, label: 'Total Spent',
      value: formatCompact(totalSpent), sub: statusLabel,
      accent: statusColor,
    },
    {
      icon: remaining >= 0 ? TrendingUp : AlertTriangle,
      label: remaining >= 0 ? 'Remaining' : 'Deficit',
      value: formatCompact(Math.abs(remaining)),
      sub: remaining >= 0 ? 'Available buffer' : 'Exceeded budget',
      accent: remaining >= 0 ? 'var(--green)' : 'var(--red)',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
        {STAT_CARDS.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="stat-chip">
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                marginBottom: '12px',
              }}>
                <div style={{
                  width: '28px', height: '28px',
                  borderRadius: 'var(--r-sm)',
                  background: `${card.accent}14`,
                  border: `1px solid ${card.accent}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={13} style={{ color: card.accent }} />
                </div>
                <span style={{
                  fontSize: '11px', fontWeight: 600,
                  color: 'var(--ink-ghost)',
                  fontFamily: 'Inter, sans-serif',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                  {card.label}
                </span>
              </div>
              <div style={{
                fontSize: '22px', fontWeight: 700,
                color: 'var(--ink)', fontFamily: 'Inter, sans-serif',
                letterSpacing: '-0.02em', lineHeight: 1,
                marginBottom: '4px',
              }}>
                {card.value}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--ink-ghost)' }}>
                {card.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* Budget Health */}
      <div className="k-card" style={{ padding: '18px 20px' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: '18px',
        }}>
          <span style={{
            fontSize: '13px', fontWeight: 700,
            color: 'var(--ink)', fontFamily: 'Inter, sans-serif',
          }}>
            Budget Health
          </span>
          <span className={`badge ${statusBadgeClass}`}>
            {budgetPct.toFixed(1)}% used
          </span>
        </div>

        {/* Expenditure bar */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--ink-ghost)', fontWeight: 500 }}>
              Expenditure vs Budget
            </span>
            <span style={{ fontSize: '11px', color: 'var(--ink-mid)', fontWeight: 600 }}>
              {formatINR(totalSpent)} / {formatINR(trip.budget)}
            </span>
          </div>
          <div className="k-track">
            <div
              className={`k-fill ${status === 'safe' ? 'fill-green' : 'fill-orange'}`}
              style={{ width: `${Math.min(budgetPct, 100)}%` }}
            />
          </div>
        </div>

        {/* Pool bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--ink-ghost)', fontWeight: 500 }}>
              Capital Pool vs Budget
            </span>
            <span style={{ fontSize: '11px', color: 'var(--ink-mid)', fontWeight: 600 }}>
              {formatINR(totalPool)} / {formatINR(trip.budget)}
            </span>
          </div>
          <div className="k-track">
            <div className="k-fill fill-navy" style={{ width: `${Math.min(poolVsBudget, 100)}%` }} />
          </div>
        </div>
      </div>

      {/* Crew Ledger */}
      <div className="k-card" style={{ overflow: 'hidden' }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
        }}>
          <h3 style={{
            fontSize: '13px', fontWeight: 700,
            color: 'var(--ink)', fontFamily: 'Inter, sans-serif',
          }}>
            Crew Ledger
          </h3>
          <p style={{ fontSize: '11px', color: 'var(--ink-ghost)', marginTop: '2px' }}>
            Individual contributions and settlement status
          </p>
        </div>

        <div>
          {trip.participants.map((p, idx) => {
            const netBalance = p.amountPaid - p.amountOwed;
            const isCreditor = netBalance > 0;
            const isDebtor = netBalance < 0;
            const isSettled = p.status === 'settled' || Math.abs(netBalance) < 1;

            const avatarColor = isSettled ? 'var(--green)' : isCreditor ? '#6366F1' : 'var(--red)';

            return (
              <div
                key={p.id}
                style={{
                  display: 'flex', alignItems: 'center',
                  padding: '13px 20px',
                  borderBottom: idx < trip.participants.length - 1 ? '1px solid var(--border)' : 'none',
                  gap: '12px',
                  transition: 'background 0.12s ease',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--canvas-alt)'}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'}
              >
                {/* Avatar */}
                <div style={{
                  width: '34px', height: '34px',
                  borderRadius: 'var(--r-sm)',
                  background: `${avatarColor}14`,
                  border: `1px solid ${avatarColor}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', fontWeight: 700,
                  color: avatarColor,
                  fontFamily: 'Inter, sans-serif',
                  flexShrink: 0,
                }}>
                  {p.name.charAt(0).toUpperCase()}
                </div>

                {/* Name */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '13px', fontWeight: 600,
                    color: 'var(--ink)', fontFamily: 'Inter, sans-serif',
                  }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--ink-ghost)', marginTop: '1px' }}>
                    Contributed {formatINR(p.contribution)}
                  </div>
                </div>

                {/* Balance */}
                <div style={{ textAlign: 'right', flexShrink: 0, marginRight: '12px' }}>
                  <div style={{
                    fontSize: '13px', fontWeight: 700,
                    color: avatarColor, fontFamily: 'Inter, sans-serif',
                  }}>
                    {isSettled ? '—' : isCreditor ? `+${formatINR(netBalance)}` : formatINR(netBalance)}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--ink-ghost)', marginTop: '1px' }}>
                    {isSettled ? 'Settled' : isCreditor ? 'to receive' : 'owes'}
                  </div>
                </div>

                {/* Action */}
                <div style={{ flexShrink: 0 }}>
                  {isSettled ? (
                    <CheckCircle size={18} style={{ color: 'var(--green)' }} />
                  ) : isDebtor ? (
                    <button
                      onClick={() => onPayClick(p)}
                      className="btn-danger"
                      style={{ padding: '5px 12px', fontSize: '11px' }}
                    >
                      Pay
                    </button>
                  ) : (
                    <span style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      color: 'var(--ink-ghost)', fontSize: '11px',
                    }}>
                      <Clock size={12} /> Waiting
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Settlement Plan */}
      {debtEdges.length > 0 && (
        <div className="k-card" style={{ overflow: 'hidden' }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <h3 style={{
                fontSize: '13px', fontWeight: 700,
                color: 'var(--ink)', fontFamily: 'Inter, sans-serif',
              }}>
                Optimal Settlement Plan
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--ink-ghost)', marginTop: '2px' }}>
                Min-cash-flow: {debtEdges.length} transfer{debtEdges.length !== 1 ? 's' : ''} clears all debts
              </p>
            </div>
            <span className="badge badge-orange">Min-Flow</span>
          </div>

          <div>
            {debtEdges.map((edge, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '12px 20px',
                  borderBottom: i < debtEdges.length - 1 ? '1px solid var(--border)' : 'none',
                  transition: 'background 0.12s ease',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--canvas-alt)'}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'}
              >
                <span style={{
                  width: '28px', height: '28px',
                  background: 'var(--red-light)',
                  border: '1px solid rgba(220,38,38,0.18)',
                  borderRadius: 'var(--r-sm)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: 700,
                  color: 'var(--red)', fontFamily: 'Inter, sans-serif',
                  flexShrink: 0,
                }}>
                  {edge.from.charAt(0)}
                </span>

                <span style={{
                  fontSize: '13px', fontWeight: 600,
                  color: 'var(--red)', fontFamily: 'Inter, sans-serif',
                  flex: 1,
                }}>
                  {edge.from}
                </span>

                <ArrowRight size={13} style={{ color: 'var(--ink-ghost)', flexShrink: 0 }} />

                <span style={{
                  fontSize: '13px', fontWeight: 600,
                  color: 'var(--green)', fontFamily: 'Inter, sans-serif',
                  flex: 1, textAlign: 'right',
                }}>
                  {edge.to}
                </span>

                <span style={{
                  width: '28px', height: '28px',
                  background: 'var(--green-light)',
                  border: '1px solid rgba(5,150,105,0.18)',
                  borderRadius: 'var(--r-sm)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: 700,
                  color: 'var(--green)', fontFamily: 'Inter, sans-serif',
                  flexShrink: 0,
                }}>
                  {edge.to.charAt(0)}
                </span>

                <span style={{
                  fontSize: '13px', fontWeight: 700,
                  color: 'var(--ink)', fontFamily: 'Inter, sans-serif',
                  marginLeft: '8px',
                  flexShrink: 0,
                }}>
                  {formatINR(edge.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
