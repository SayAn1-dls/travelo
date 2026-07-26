'use client';

import { useState, useCallback } from 'react';
import { TripData, Participant, Transaction, Notification } from '@/lib/types';
import { splitEqually } from '@/lib/utils/debtSolver';

function generateId(): string { return Math.random().toString(36).substring(2, 11); }

export function useTripStore(initialTrip: TripData | null = null) {
  const [trip, setTrip] = useState<TripData | null>(initialTrip);

  const updateTrip = useCallback((updater: (prev: TripData) => TripData) => {
    setTrip(prev => {
      if (!prev) return prev;
      const next = updater(prev);
      try { sessionStorage.setItem('travelo-trip', JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const addTransaction = useCallback((paidById: string, amount: number, description: string) => {
    updateTrip(prev => {
      const payer = prev.participants.find(p => p.id === paidById);
      if (!payer) return prev;
      const perHead = splitEqually(amount, prev.participants.length);
      const updatedParticipants = prev.participants.map(p =>
        p.id === paidById
          ? { ...p, amountPaid: p.amountPaid + amount, amountOwed: p.amountOwed + perHead }
          : { ...p, amountOwed: p.amountOwed + perHead }
      );
      const newTxn: Transaction = { id: generateId(), paidBy: paidById, paidByName: payer.name, amount, description, timestamp: new Date(), splitAmong: prev.participants.map(p => p.id), settled: false };
      const newNotifs: Notification[] = prev.participants
        .filter(p => p.id !== paidById)
        .map(d => ({ id: generateId(), type: 'debt_reminder' as const, message: `${payer.name} paid ${amount.toLocaleString('en-IN')} for "${description}". Your share: ${perHead.toLocaleString('en-IN')}`, targetParticipantId: d.id, read: false, timestamp: new Date() }));
      return { ...prev, participants: updatedParticipants, transactions: [...prev.transactions, newTxn], notifications: [...prev.notifications, ...newNotifs] };
    });
  }, [updateTrip]);

  const settleParticipant = useCallback((participantId: string) => {
    updateTrip(prev => {
      const p = prev.participants.find(x => x.id === participantId);
      if (!p) return prev;
      const updatedParticipants = prev.participants.map(x => x.id === participantId ? { ...x, status: 'settled' as const } : x);
      const allSettled = updatedParticipants.every(x => x.status === 'settled' || (x.amountPaid - x.amountOwed) >= 0);
      const note: Notification = { id: generateId(), type: 'payment_received', message: `${p.name} has settled their dues.${allSettled ? ' All members balanced!' : ''}`, read: false, timestamp: new Date() };
      return { ...prev, participants: updatedParticipants, notifications: [note, ...prev.notifications], status: allSettled ? 'completed' : prev.status };
    });
  }, [updateTrip]);

  const markNotificationRead = useCallback((notifId: string) => {
    updateTrip(prev => ({ ...prev, notifications: prev.notifications.map(n => n.id === notifId ? { ...n, read: true } : n) }));
  }, [updateTrip]);

  return { trip, setTrip, addTransaction, settleParticipant, markNotificationRead };
}
