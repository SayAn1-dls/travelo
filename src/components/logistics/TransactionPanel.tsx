'use client';

import { useState } from 'react';
import { Transaction, Participant } from '@/lib/types';
import { formatINR } from '@/lib/utils/currency';
import { Plus, CreditCard, Plane, Hotel, Car, ShoppingBag, Utensils, Activity } from 'lucide-react';

interface TransactionPanelProps {
  transactions: Transaction[];
  participants: Participant[];
  onAddTransaction: (paidById: string, amount: number, description: string) => void;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  hotel:     Hotel,
  food:      Utensils,
  transport: Car,
  flight:    Plane,
  activity:  Activity,
  shopping:  ShoppingBag,
  default:   CreditCard,
};

const CATEGORY_COLOR: Record<string, string> = {
  hotel:     '#6366F1',
  food:      'var(--orange)',
  transport: 'var(--green)',
  flight:    '#6366F1',
  activity:  'var(--amber)',
  shopping:  '#EC4899',
  default:   'var(--ink-soft)',
};

export default function TransactionPanel({ transactions, participants, onAddTransaction }: TransactionPanelProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ paidById: '', amount: '', description: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.paidById || !form.amount || !form.description) return;
    onAddTransaction(form.paidById, parseFloat(form.amount), form.description);
    setForm({ paidById: '', amount: '', description: '' });
    setIsAdding(false);
  };

  const formatTimestamp = (ts: Date): string =>
    new Intl.DateTimeFormat('en-IN', {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    }).format(new Date(ts));

  const getCategory = (desc: string): string => {
    const lower = desc.toLowerCase();
    for (const key of Object.keys(CATEGORY_ICONS)) {
      if (key !== 'default' && lower.includes(key)) return key;
    }
    return 'default';
  };

  return (
    <div className="k-card" style={{ overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div>
          <h3 style={{
            fontSize: '14px', fontWeight: 700,
            color: 'var(--ink)', fontFamily: 'Inter, sans-serif',
          }}>
            Expense Log
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--ink-ghost)', marginTop: '2px' }}>
            {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
          </p>
        </div>
        {participants.length > 0 && (
          <button
            className="btn-primary"
            onClick={() => setIsAdding(!isAdding)}
            style={{ padding: '7px 14px', fontSize: '12px' }}
          >
            <Plus size={12} />
            Log Expense
          </button>
        )}
      </div>

      {/* Add Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="slide-in" style={{
          padding: '16px 20px',
          backgroundColor: 'var(--canvas-alt)',
          borderBottom: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', gap: '10px',
        }}>
          <select
            className="k-select"
            value={form.paidById}
            onChange={e => setForm(f => ({ ...f, paidById: e.target.value }))}
            required
          >
            <option value="">Who paid?</option>
            {participants.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <input
            className="k-input"
            type="number"
            placeholder="Amount (₹)"
            value={form.amount}
            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
            min={1}
            required
          />

          <input
            className="k-input"
            type="text"
            placeholder="Description (e.g. Hotel — Night 1)"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            required
          />

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn-ghost"
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => setIsAdding(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ flex: 1, justifyContent: 'center' }}
            >
              Log & Split
            </button>
          </div>
        </form>
      )}

      {/* Transaction List */}
      {transactions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '44px 24px', color: 'var(--ink-ghost)' }}>
          <CreditCard size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <p style={{
            fontSize: '14px', fontWeight: 600,
            color: 'var(--ink-soft)', fontFamily: 'Inter, sans-serif',
            marginBottom: '4px',
          }}>
            No expenses logged
          </p>
          <p style={{ fontSize: '12px', color: 'var(--ink-ghost)' }}>
            Add the first group expense above.
          </p>
        </div>
      ) : (
        <div>
          {[...transactions].reverse().map((t, idx) => {
            const cat = getCategory(t.description);
            const Icon = CATEGORY_ICONS[cat];
            const accentColor = CATEGORY_COLOR[cat];
            return (
              <div
                key={t.id}
                className="fade-in"
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '13px 20px',
                  borderBottom: idx < transactions.length - 1 ? '1px solid var(--border)' : 'none',
                  transition: 'background 0.12s ease',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--canvas-alt)'}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'}
              >
                <div style={{
                  width: '34px', height: '34px',
                  borderRadius: 'var(--r-sm)',
                  background: `${accentColor}14`,
                  border: `1px solid ${accentColor}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={15} style={{ color: accentColor }} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '13px', fontWeight: 600,
                    color: 'var(--ink)', fontFamily: 'Inter, sans-serif',
                    marginBottom: '2px',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {t.description}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--ink-ghost)' }}>
                    Paid by {t.paidByName} · {formatTimestamp(t.timestamp)}
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{
                    fontSize: '14px', fontWeight: 700,
                    color: 'var(--ink)', fontFamily: 'Inter, sans-serif',
                  }}>
                    {formatINR(t.amount)}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--ink-ghost)' }}>
                    {formatINR(t.amount / (t.splitAmong.length || 1))}/person
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
