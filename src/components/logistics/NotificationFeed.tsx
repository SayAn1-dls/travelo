'use client';

import { Notification } from '@/lib/types';
import { Bell, CheckCheck, AlertCircle, TrendingUp, Info } from 'lucide-react';

interface NotificationFeedProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
}

const ICONS = { debt_reminder: AlertCircle, settlement_complete: CheckCheck, payment_received: TrendingUp, trip_update: Info };
const COLORS = { debt_reminder: '#dc2626', settlement_complete: '#16a34a', payment_received: '#C9A96E', trip_update: 'var(--accent-platinum)' };

export default function NotificationFeed({ notifications, onMarkRead }: NotificationFeedProps) {
  return (
    <div className="luxury-card" style={{ padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <Bell size={14} style={{ color: 'var(--accent-gold)' }} />
        <h3 className="garamond" style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>Notifications</h3>
        {notifications.filter(n => !n.read).length > 0 && (
          <span className="badge badge-amber">{notifications.filter(n => !n.read).length} new</span>
        )}
      </div>
      {notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
          <Bell size={24} style={{ marginBottom: '8px', opacity: 0.3 }} />
          <p style={{ fontSize: '13px' }}>All clear.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {notifications.map(n => {
            const Icon = ICONS[n.type];
            const color = COLORS[n.type];
            return (
              <div key={n.id} onClick={() => onMarkRead(n.id)} style={{
                display: 'flex', gap: '10px', padding: '10px 12px', borderRadius: '8px',
                backgroundColor: n.read ? 'transparent' : 'var(--bg-secondary)',
                border: n.read ? '1px solid transparent' : '1px solid var(--border-light)',
                cursor: 'pointer', opacity: n.read ? 0.6 : 1, transition: 'all 0.15s ease',
              }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '6px',
                  backgroundColor: `${color}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon size={13} style={{ color }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }}>{n.message}</p>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{n.read ? 'Read' : 'Tap to dismiss'}</span>
                </div>
                {!n.read && <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#C9A96E', flexShrink: 0, marginTop: '4px' }} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
