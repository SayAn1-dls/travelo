'use client';

import { useState } from 'react';
import { Transaction, Participant } from '@/lib/types';
import { formatINR } from '@/lib/utils/currency';
import { Plus, CreditCard } from 'lucide-react';

interface TransactionPanelProps {
  transactions: Transaction[];
  participants: Participant[];
  onAddTransaction: (paidById: string, amount: number, description: string) => void;
}

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

  const CATEGORY_MAP: Record<string, string> = {
    hotel: '🏨', food: '🍜', transport: '🚗', flight: '✈️',
    activity: '🎡', shopping: '🛍️', default: '💳',
  };

  const getEmoji = (desc: string) => {
    const lower = desc.toLowerCase();
    for (const key of Object.keys(CATEGORY_MAP)) {
      if (key !== 'default' && lower.includes(key)) return CATEGORY_MAP[key];
    }
    return CATEGORY_MAP.default;
  };

  return (
    <div className="bubble-card" style={{ padding: '26px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h3 className="comfortaa" style={{ fontSize: '17px', fontWeight: 700, color: 'var(--ink)', marginBottom: '3px' }}>
            🧾 Expense Log
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--ink-ghost)' }}>All group expenditures</p>
        </div>
        {participants.length > 0 && (
          <button
            className="btn-violet"
            onClick={() => setIsAdding(!isAdding)}
            style={{ padding: '9px 20px', fontSize: '13px' }}
          >
            <Plus size={13} />
            Log Expense
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="slide-in" style={{
          padding: '20px',
          backgroundColor: 'rgba(139,92,246,0.05)',
          borderRadius: 'var(--r-card)',
          border: '1.5px solid rgba(139,92,246,0.18)',
          marginBottom: '20px',
          display: 'flex', flexDirection: 'column', gap: '14px',
        }}>
          <select
            className="pill-select"
            value={form.paidById}
            onChange={e => setForm(f => ({ ...f, paidById: e.target.value }))}
            required
          >
            <option value="">👤 Who paid?</option>
            {participants.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <input
            className="pill-input"
            type="number"
            placeholder="💰 Amount (₹)"
            value={form.amount}
            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
            min={1}
            required
          />

          <input
            className="pill-input"
            type="text"
            placeholder="📝 What was it for? (e.g. Hotel Night 1)"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            required
          />

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" className="btn-outline" style={{ flex: 1 }} onClick={() => setIsAdding(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-violet" style={{ flex: 1, justifyContent: 'center' }}>
              Log & Split ⚡
            </button>
          </div>
        </form>
      )}

      {transactions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ink-ghost)' }}>
          <div style={{ fontSize: '48px', marginBottom: '14px' }}>🧳</div>
          <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink-soft)', fontFamily: 'Comfortaa, cursive' }}>
            No expenses yet
          </p>
          <p style={{ fontSize: '13px', color: 'var(--ink-ghost)', marginTop: '6px' }}>
            Log your first group expense above.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[...transactions].reverse().map((t) => (
            <div key={t.id} className="fade-in" style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '14px 16px',
              backgroundColor: 'var(--canvas-alt)',
              borderRadius: 'var(--r-input)',
              border: '1.5px solid var(--border-soft)',
              transition: 'border-color 0.18s ease',
            }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(139,92,246,0.25)'}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-soft)'}
            >
              <div style={{
                width: '42px', height: '42px',
                borderRadius: 'var(--r-pill)',
                background: 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(255,77,77,0.08) 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, fontSize: '20px',
              }}>
                {getEmoji(t.description)}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)', marginBottom: '2px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {t.description}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--ink-ghost)' }}>
                  Paid by {t.paidByName} · {formatTimestamp(t.timestamp)}
                </div>
              </div>

              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--ink)', fontFamily: 'Comfortaa, cursive' }}>
                  {formatINR(t.amount)}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--ink-ghost)' }}>
                  {formatINR(t.amount / (t.splitAmong.length || 1))}/head
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}