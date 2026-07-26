'use client';

import { Notification } from '@/lib/types';
import { Bell, CheckCheck, AlertCircle, TrendingUp, Info } from 'lucide-react';

interface NotificationFeedProps { notifications: Notification[]; onMarkRead: (id: string) => void; }

const ICONS = { debt_reminder: AlertCircle, settlement_complete: CheckCheck, payment_received: TrendingUp, trip_update: Info };
const GRADIENTS: Record<string, string> = { debt_reminder: 'linear-gradient(135deg, #FFF1F2, #FFE4E6)', settlement_complete: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)', payment_received: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', trip_update: 'linear-gradient(135deg, #F5F3FF, #EDE9FE)' };
const ICON_COLORS: Record<string, string> = { debt_reminder: '#DC2626', settlement_complete: '#00966B', payment_received: '#0066FF', trip_update: '#7C3AED' };

export default function NotificationFeed({ notifications, onMarkRead }: NotificationFeedProps) {
  const formatTs = (ts: Date) => new Intl.RelativeTimeFormat('en-IN', { numeric: 'auto' }).format(Math.round((new Date(ts).getTime() - Date.now()) / 60000), 'minutes');
  const unread = notifications.filter(n => !n.read).length;
  return (
    <div className="vibrant-card" style={{ padding: '22px 26px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
        <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #FFF7ED, #FED7AA)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Bell size={16} style={{ color: '#FF4F17' }} /></div>
        <h3 className="jakarta" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Notifications</h3>
        {unread > 0 && <span className="badge badge-orange">{unread} new</span>}
      </div>
      {notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 0' }}><div style={{ fontSize: '40px', marginBottom: '10px' }}>🎉</div><p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>All clear!</p><p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>No notifications yet.</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {notifications.map(n => { const Icon = ICONS[n.type]; return (
            <div key={n.id} onClick={() => onMarkRead(n.id)} style={{ display: 'flex', gap: '12px', padding: '12px 14px', borderRadius: 'var(--radius-lg)', backgroundColor: n.read ? 'transparent' : 'var(--bg-secondary)', border: `1.5px solid ${n.read ? 'transparent' : 'var(--border-light)'}`, cursor: 'pointer', opacity: n.read ? 0.55 : 1, transition: 'all 0.15s ease' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: GRADIENTS[n.type], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}><Icon size={14} style={{ color: ICON_COLORS[n.type] }} /></div>
              <div style={{ flex: 1, minWidth: 0 }}><p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.55, margin: 0, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{n.message}</p><span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{formatTs(n.timestamp)} · {n.read ? 'Read' : 'Tap to dismiss'}</span></div>
              {!n.read && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FF4F17', flexShrink: 0, marginTop: '6px' }} />}
            </div>
          ); })}
        </div>
      )}
    </div>
  );
}
