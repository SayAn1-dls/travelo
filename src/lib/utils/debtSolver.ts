import { Participant, DebtEdge } from '@/lib/types';

export const splitEqually = (amount: number, count: number): number => {
  if (count === 0) return 0;
  return Math.round((amount / count) * 100) / 100;
};

export const computeTotalPool = (participants: Participant[]): number =>
  participants.reduce((sum, p) => sum + p.contribution, 0);

export const computeNetBalances = (participants: Participant[]): Map<string, number> => {
  const balances = new Map<string, number>();
  for (const p of participants) {
    balances.set(p.name, (p.amountPaid ?? 0) - (p.amountOwed ?? 0));
  }
  return balances;
};

export const minimumCashFlow = (participants: Participant[]): DebtEdge[] => {
  const netBalances = computeNetBalances(participants);
  const creditors: { name: string; amount: number }[] = [];
  const debtors: { name: string; amount: number }[] = [];

  for (const [name, bal] of netBalances.entries()) {
    if (bal > 0.01) creditors.push({ name, amount: bal });
    else if (bal < -0.01) debtors.push({ name, amount: Math.abs(bal) });
  }

  const edges: DebtEdge[] = [];
  let ci = 0, di = 0;

  while (ci < creditors.length && di < debtors.length) {
    const transfer = Math.min(creditors[ci].amount, debtors[di].amount);
    edges.push({ from: debtors[di].name, to: creditors[ci].name, amount: Math.round(transfer * 100) / 100 });
    creditors[ci].amount -= transfer;
    debtors[di].amount -= transfer;
    if (creditors[ci].amount < 0.01) ci++;
    if (debtors[di].amount < 0.01) di++;
  }

  return edges;
};
