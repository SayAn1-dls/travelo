'use client';

import { Notification } from '@/lib/types';
import { Bell, CheckCheck, AlertCircle, TrendingUp, Info } from 'lucide-react';

interface NotificationFeedProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
}

const ICONS = {
  debt_reminder:       AlertCircle,
  settlement_complete: CheckCheck,
  payment_received:    TrendingUp,
  trip_update:         Info,
};

const ACCENT_COLORS: Record<string, string> = {
  debt_reminder:       'var(--red)',
  settlement_complete: 'var(--green)',
  payment_received:    '#6366F1',
  trip_update:         'var(--amber)',
};

export default function NotificationFeed({ notifications, onMarkRead }: NotificationFeedProps) {
  const formatTs = (ts: Date) => {
    const diff = Math.round((Date.now() - new Date(ts).getTime()) / 60000);
    if (diff < 1)  return 'just now';
    if (diff < 60) return `${diff}m ago`;
    return `${Math.round(diff / 60)}h ago`;
  };

  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="k-card" style={{ overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '16px 20px',
        borderBottom: '1px solid var(--border)',
      }}>
        <Bell size={15} style={{ color: 'var(--ink-soft)' }} />
        <span style={{
          fontSize: '13px', fontWeight: 700,
          color: 'var(--ink)', fontFamily: 'Inter, sans-serif',
          flex: 1,
        }}>
          Activity
        </span>
        {unread > 0 && (
          <span className="badge badge-orange">{unread} new</span>
        )}
      </div>

      {notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 24px' }}>
          <Bell size={28} style={{ margin: '0 auto 10px', opacity: 0.2, display: 'block' }} />
          <p style={{
            fontSize: '13px', fontWeight: 600,
            color: 'var(--ink-soft)', fontFamily: 'Inter, sans-serif',
            marginBottom: '4px',
          }}>
            No activity yet
          </p>
          <p style={{ fontSize: '12px', color: 'var(--ink-ghost)' }}>
            Notifications appear here as transactions are logged.
          </p>
        </div>
      ) : (
        <div>
          {notifications.map((n, idx) => {
            const Icon = ICONS[n.type];
            const accent = ACCENT_COLORS[n.type];
            return (
              <div
                key={n.id}
                onClick={() => onMarkRead(n.id)}
                style={{
                  display: 'flex', gap: '10px',
                  padding: '12px 20px',
                  borderBottom: idx < notifications.length - 1 ? '1px solid var(--border)' : 'none',
                  cursor: 'pointer',
                  opacity: n.read ? 0.55 : 1,
                  backgroundColor: !n.read ? 'var(--canvas-alt)' : 'transparent',
                  transition: 'all 0.12s ease',
                }}
                onMouseEnter={e => {
                  if (!n.read)(e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--canvas-muted)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.backgroundColor = !n.read ? 'var(--canvas-alt)' : 'transparent';
                }}
              >
                <div style={{
                  width: '30px', height: '30px',
                  borderRadius: 'var(--r-sm)',
                  background: `${accent}12`,
                  border: `1px solid ${accent}22`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, marginTop: '1px',
                }}>
                  <Icon size={13} style={{ color: accent }} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: '12px', color: 'var(--ink)',
                    lineHeight: 1.55, margin: 0,
                    fontFamily: 'Inter, sans-serif', fontWeight: 400,
                  }}>
                    {n.message}
                  </p>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    marginTop: '4px',
                  }}>
                    <span style={{ fontSize: '10px', color: 'var(--ink-ghost)' }}>
                      {formatTs(n.timestamp)}
                    </span>
                    {!n.read && (
                      <>
                        <span style={{ fontSize: '10px', color: 'var(--ink-ghost)' }}>·</span>
                        <span style={{ fontSize: '10px', color: 'var(--orange)', fontWeight: 600 }}>
                          Mark as read
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {!n.read && (
                  <div style={{
                    width: '7px', height: '7px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--orange)',
                    flexShrink: 0, marginTop: '5px',
                  }} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
