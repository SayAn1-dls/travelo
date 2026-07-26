'use client';

import { useState } from 'react';
import { Participant } from '@/lib/types';
import { X, CheckCircle, IndianRupee, Smartphone } from 'lucide-react';
import { formatINR } from '@/lib/utils/currency';

interface PaymentModalProps {
  participant: Participant | null;
  creditorName: string;
  amountDue: number;
  onClose: () => void;
  onConfirmPayment: (participantId: string) => void;
}

const PAYMENT_APPS = [
  { name: 'GPay', emoji: '🔵', label: 'Google Pay', color: '#4285F4' },
  { name: 'PhonePe', emoji: '🟣', label: 'PhonePe', color: '#5F259F' },
  { name: 'Paytm', emoji: '🔷', label: 'Paytm', color: '#00BAF2' },
  { name: 'BHIM', emoji: '🟠', label: 'BHIM UPI', color: '#FF6B35' },
];

type Step = 'select' | 'redirect' | 'confirm';

export default function PaymentModal({ participant, creditorName, amountDue, onClose, onConfirmPayment }: PaymentModalProps) {
  const [step, setStep] = useState<Step>('select');
  const [selectedApp, setSelectedApp] = useState<string>('');
  if (!participant) return null;
  const handleAppSelect = (appName: string) => { setSelectedApp(appName); setStep('redirect'); setTimeout(() => setStep('confirm'), 1400); };
  const handleConfirm = () => { if (participant) onConfirmPayment(participant.id); onClose(); };
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(13,17,23,0.55)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="vibrant-card fade-in" style={{ width: '100%', maxWidth: '420px', padding: '32px', position: 'relative', borderRadius: 'var(--radius-xl)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '18px', right: '18px', width: '32px', height: '32px', borderRadius: '50%', border: '1.5px solid var(--border-light)', background: 'var(--bg-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}><X size={14} /></button>
        {step === 'select' && (
          <>
            <div style={{ marginBottom: '22px' }}><div style={{ fontSize: '28px', marginBottom: '10px' }}>💸</div><h2 className="fredoka" style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px', color: 'var(--text-primary)' }}>Pay Now</h2><p style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{participant.name} → {creditorName}</p></div>
            <div style={{ background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', borderRadius: 'var(--radius-lg)', padding: '16px 20px', marginBottom: '22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1.5px solid rgba(0,102,255,0.12)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><IndianRupee size={14} style={{ color: '#0066FF' }} /><span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 600 }}>Amount Due</span></div>
              <span className="fredoka" style={{ fontSize: '26px', fontWeight: 700, color: '#0066FF' }}>{formatINR(Math.abs(amountDue))}</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px', fontWeight: 600, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Choose payment app:</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              {PAYMENT_APPS.map(app => (<button key={app.name} onClick={() => handleAppSelect(app.name)} style={{ padding: '16px 12px', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--border-light)', background: 'var(--bg-secondary)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', transition: 'all 0.15s ease', fontFamily: 'Plus Jakarta Sans, sans-serif' }}><span style={{ fontSize: '28px' }}>{app.emoji}</span><span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>{app.label}</span></button>))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}><Smartphone size={12} />You will be redirected to complete payment</div>
          </>
        )}
        {step === 'redirect' && (<div style={{ textAlign: 'center', padding: '28px 0' }}><div className="spinner" style={{ margin: '0 auto 20px' }} /><h2 className="fredoka" style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>Opening {selectedApp}...</h2><p style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Complete the payment in the app</p></div>)}
        {step === 'confirm' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}><div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '2px solid #DCFCE7' }}><CheckCircle size={32} style={{ color: '#00966B' }} /></div><h2 className="fredoka" style={{ fontSize: '24px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>Confirm Payment</h2><p style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Did {selectedApp} payment go through?</p></div>
            <div style={{ background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)', border: '1.5px solid rgba(0,196,140,0.25)', borderRadius: 'var(--radius-lg)', padding: '14px 18px', marginBottom: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}><span style={{ color: 'var(--text-muted)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>From</span><span style={{ fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{participant.name}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}><span style={{ color: 'var(--text-muted)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Amount</span><span style={{ fontWeight: 700, color: '#00966B', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{formatINR(Math.abs(amountDue))}</span></div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}><button className="btn-secondary" style={{ flex: 1 }} onClick={() => setStep('select')}>Retry</button><button className="btn-primary" style={{ flex: 1 }} onClick={handleConfirm}>Confirm & Settle ✅</button></div>
          </>
        )}
      </div>
    </div>
  );
}
