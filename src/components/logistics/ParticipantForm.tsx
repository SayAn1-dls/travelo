'use client';

import { useEffect } from 'react';
import { Participant } from '@/lib/types';
import { IndianRupee, User } from 'lucide-react';

interface Props {
  count: number;
  participants: Partial<Participant>[];
  onChange: (participants: Partial<Participant>[]) => void;
}

export default function ParticipantForm({ count, participants, onChange }: Props) {
  useEffect(() => {
    const currentCount = participants.length;
    if (currentCount !== count) {
      if (currentCount < count) {
        onChange([...participants, ...Array.from({ length: count - currentCount }, () => ({}))]);
      } else {
        onChange(participants.slice(0, count));
      }
    }
  }, [count]);

  const update = (index: number, field: keyof Participant, value: string | number) => {
    const next = participants.map((p, i) => i === index ? { ...p, [field]: value } : p);
    onChange(next);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {participants.map((p, i) => (
        <div
          key={i}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 140px',
            gap: '8px',
            alignItems: 'center',
          }}
        >
          <div style={{ position: 'relative' }}>
            <User size={13} style={{
              position: 'absolute', left: '12px', top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--ink-ghost)', pointerEvents: 'none',
            }} />
            <input
              className="k-input"
              placeholder={`Member ${i + 1}`}
              value={p.name ?? ''}
              onChange={e => update(i, 'name', e.target.value)}
              style={{ paddingLeft: '32px' }}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <IndianRupee size={12} style={{
              position: 'absolute', left: '10px', top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--ink-ghost)', pointerEvents: 'none',
            }} />
            <input
              className="k-input"
              type="number"
              placeholder="Contrib."
              min={0}
              value={p.contribution ?? ''}
              onChange={e => update(i, 'contribution', parseFloat(e.target.value) || 0)}
              style={{ paddingLeft: '28px' }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
