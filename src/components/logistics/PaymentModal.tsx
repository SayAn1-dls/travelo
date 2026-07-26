'use client';

import { useState } from 'react';
import { Participant } from '@/lib/types';
import { X, CheckCircle, IndianRupee, Smartphone, ArrowRight } from 'lucide-react';
import { formatINR } from '@/lib/utils/currency';

interface PaymentModalProps {
  participant: Participant | null;
  creditorName: string;
  amountDue: number;
  onClose: () => void;
  onConfirmPayment: (participantId: string) => void;
}

const PAYMENT_APPS = [
  { name: 'GPay',    scheme: 'gpay://upi/pay',  label: 'Google Pay', color: '#4285F4', initial: 'G' },
  { name: 'PhonePe', scheme: 'phonepe://pay',   label: 'PhonePe',   color: '#5F259F', initial: 'P' },
  { name: 'Paytm',   scheme: 'paytmmp://pay',   label: 'Paytm',     color: '#00BAF2', initial: 'P' },
  { name: 'BHIM',    scheme: 'upi://pay',        label: 'BHIM UPI',  color: '#FF6B35', initial: 'B' },
];

type Step = 'select' | 'redirect' | 'confirm';

export default function PaymentModal({ participant, creditorName, amountDue, onClose, onConfirmPayment }: PaymentModalProps) {
  const [step, setStep] = useState<Step>('select');
  const [selectedApp, setSelectedApp] = useState<string>('');

  if (!participant) return null;

  const handleAppSelect = (appName: string) => {
    setSelectedApp(appName);
    setStep('redirect');
    setTimeout(() => setStep('confirm'), 1500);
  };

  const handleConfirm = () => {
    if (participant) onConfirmPayment(participant.id);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        backgroundColor: 'rgba(15,23,42,0.70)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        zIndex: 300,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="k-card fade-in"
        style={{
          width: '100%', maxWidth: '400px',
          padding: '28px 28px 24px',
          position: 'relative',
          borderRadius: '10px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '16px', right: '16px',
            width: '28px', height: '28px',
            borderRadius: 'var(--r-sm)',
            border: '1px solid var(--border-dark)',
            background: 'var(--canvas-alt)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--ink-ghost)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--red)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--red)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-dark)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--ink-ghost)';
          }}
        >
          <X size={13} />
        </button>

        {/* Select App */}
        {step === 'select' && (
          <>
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{
                fontSize: '18px', fontWeight: 700,
                color: 'var(--ink)', fontFamily: 'Inter, sans-serif',
                letterSpacing: '-0.02em', marginBottom: '4px',
              }}>
                Settle Payment
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--ink-ghost)' }}>
                {participant.name} → {creditorName}
              </p>
            </div>

            {/* Amount */}
            <div style={{
              background: 'var(--canvas-alt)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-card)',
              padding: '14px 18px',
              marginBottom: '20px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '12px', color: 'var(--ink-soft)', fontWeight: 500,
              }}>
                <IndianRupee size={13} />
                Amount Due
              </div>
              <span style={{
                fontSize: '22px', fontWeight: 700,
                color: 'var(--orange)', fontFamily: 'Inter, sans-serif',
                letterSpacing: '-0.02em',
              }}>
                {formatINR(Math.abs(amountDue))}
              </span>
            </div>

            <p style={{
              fontSize: '11px', color: 'var(--ink-ghost)',
              fontWeight: 600, textTransform: 'uppercase',
              letterSpacing: '0.06em', marginBottom: '12px',
            }}>
              Select Payment App
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '18px' }}>
              {PAYMENT_APPS.map(app => (
                <button
                  key={app.name}
                  onClick={() => handleAppSelect(app.name)}
                  style={{
                    padding: '14px 10px',
                    borderRadius: 'var(--r-card)',
                    border: '1px solid var(--border)',
                    background: 'var(--canvas-alt)',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '10px',
                    transition: 'all 0.15s ease',
                    fontFamily: 'Inter, sans-serif',
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.borderColor = app.color;
                    el.style.background = '#FFFFFF';
                    el.style.boxShadow = `0 4px 12px ${app.color}22`;
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.borderColor = 'var(--border)';
                    el.style.background = 'var(--canvas-alt)';
                    el.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    width: '32px', height: '32px',
                    borderRadius: 'var(--r-sm)',
                    background: `${app.color}18`,
                    border: `1px solid ${app.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', fontWeight: 700,
                    color: app.color, flexShrink: 0,
                  }}>
                    {app.initial}
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-mid)' }}>
                    {app.label}
                  </span>
                </button>
              ))}
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              color: 'var(--ink-ghost)', fontSize: '11px',
            }}>
              <Smartphone size={11} />
              You will be redirected to complete payment.
            </div>
          </>
        )}

        {/* Redirecting */}
        {step === 'redirect' && (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div className="spinner" style={{ margin: '0 auto 20px' }} />
            <h2 style={{
              fontSize: '16px', fontWeight: 700,
              color: 'var(--ink)', fontFamily: 'Inter, sans-serif',
              marginBottom: '6px',
            }}>
              Opening {selectedApp}...
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--ink-ghost)' }}>
              Complete the payment in the app and return here.
            </p>
          </div>
        )}

        {/* Confirm */}
        {step === 'confirm' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '52px', height: '52px',
                borderRadius: 'var(--r-card)',
                background: 'var(--green-light)',
                border: '1px solid rgba(5,150,105,0.22)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 14px',
              }}>
                <CheckCircle size={26} style={{ color: 'var(--green)' }} />
              </div>
              <h2 style={{
                fontSize: '17px', fontWeight: 700,
                color: 'var(--ink)', fontFamily: 'Inter, sans-serif',
                letterSpacing: '-0.02em', marginBottom: '4px',
              }}>
                Confirm Payment
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--ink-ghost)' }}>
                Did {selectedApp} complete successfully?
              </p>
            </div>

            <div style={{
              background: 'var(--canvas-alt)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-card)',
              padding: '14px 18px',
              marginBottom: '18px',
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                fontSize: '12px', marginBottom: '8px',
              }}>
                <span style={{ color: 'var(--ink-ghost)' }}>From</span>
                <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{participant.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: 'var(--ink-ghost)' }}>Amount</span>
                <span style={{
                  fontWeight: 700, color: 'var(--green)',
                  fontSize: '15px', fontFamily: 'Inter, sans-serif',
                }}>
                  {formatINR(Math.abs(amountDue))}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn-ghost"
                style={{ flex: 1, justifyContent: 'center', fontSize: '13px' }}
                onClick={() => setStep('select')}
              >
                Retry
              </button>
              <button
                className="btn-success"
                style={{ flex: 1, justifyContent: 'center', fontSize: '13px' }}
                onClick={handleConfirm}
              >
                <CheckCircle size={14} />
                Confirm & Settle
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
