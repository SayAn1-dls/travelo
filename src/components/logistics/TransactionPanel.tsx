'use client';

import { useState } from 'react';
import { Transaction, Participant } from '@/lib/types';
import { formatINR } from '@/lib/utils/currency';
import { Plus } from 'lucide-react';

interface TransactionPanelProps {
  transactions: Transaction[];
  participants: Participant[];
  onAddTransaction: (paidById: string, amount: number, description: string) => void;
}

export default function TransactionPanel({ transactions, participants, onAddTransaction }: TransactionPanelProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ paidById: '', amount: '', description: '' });
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (!form.paidById || !form.amount || !form.description) return; onAddTransaction(form.paidById, parseFloat(form.amount), form.description); setForm({ paidById: '', amount: '', description: '' }); setIsAdding(false); };
  const formatTimestamp = (ts: Date): string => new Intl.DateTimeFormat('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(ts));
  const CATEGORY_EMOJIS: Record<string, string> = { hotel: '🏨', food: '🍜', transport: '🚗', flight: '✈️', activity: '🎡', shopping: '🛍️', default: '💳' };
  const getEmoji = (desc: string) => { const lower = desc.toLowerCase(); for (const key of Object.keys(CATEGORY_EMOJIS)) { if (key !== 'default' && lower.includes(key)) return CATEGORY_EMOJIS[key]; } return CATEGORY_EMOJIS.default; };
  return (
    <div className="vibrant-card" style={{ padding: '22px 26px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div><h3 className="jakarta" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>🧾 Expense Log</h3><p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>All group expenditures</p></div>
        {participants.length > 0 && (<button className="btn-primary" onClick={() => setIsAdding(!isAdding)} style={{ padding: '8px 18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}><Plus size={13} />Log Expense</button>)}
      </div>
      {isAdding && (
        <form onSubmit={handleSubmit} className="slide-in" style={{ padding: '18px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--border-light)', marginBottom: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <select className="vibrant-select" value={form.paidById} onChange={e => setForm(f => ({ ...f, paidById: e.target.value }))} required><option value="">👤 Who paid?</option>{participants.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}</select>
          <input className="vibrant-input" type="number" placeholder="💰 Amount (₹)" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} min={1} required />
          <input className="vibrant-input" type="text" placeholder="📝 What was it for? (e.g. Hotel Night 1)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
          <div style={{ display: 'flex', gap: '10px' }}><button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setIsAdding(false)}>Cancel</button><button type="submit" className="btn-primary" style={{ flex: 1 }}>Log & Split ⚡</button></div>
        </form>
      )}
      {transactions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '36px 0' }}><div style={{ fontSize: '44px', marginBottom: '12px' }}>🧳</div><p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>No expenses yet</p><p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Log your first group expense above.</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[...transactions].reverse().map((t) => (
            <div key={t.id} className="fade-in" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 14px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--border-light)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '18px' }}>{getEmoji(t.description)}</div>
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{t.description}</div><div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Paid by {t.paidByName} · {formatTimestamp(t.timestamp)}</div></div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}><div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{formatINR(t.amount)}</div><div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{formatINR(t.amount / (t.splitAmong.length || 1))}/head</div></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
