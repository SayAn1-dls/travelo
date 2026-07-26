import { Participant, DebtEdge } from '@/lib/types';

export function computeNetBalances(participants: Participant[]): Map<string, number> {
  const balances = new Map<string, number>();
  for (const p of participants) {
    balances.set(p.id, p.amountPaid - p.amountOwed);
  }
  return balances;
}

export function minimumCashFlow(participants: Participant[]): DebtEdge[] {
  const balances = computeNetBalances(participants);
  const result: DebtEdge[] = [];
  const getMax = (map: Map<string, number>): [string, number] => {
    let maxKey = '', maxVal = -Infinity;
    for (const [k, v] of map) if (v > maxVal) { maxVal = v; maxKey = k; }
    return [maxKey, maxVal];
  };
  const getMin = (map: Map<string, number>): [string, number] => {
    let minKey = '', minVal = Infinity;
    for (const [k, v] of map) if (v < minVal) { minVal = v; minKey = k; }
    return [minKey, minVal];
  };
  const remaining = new Map(balances);
  const EPSILON = 0.01;
  for (let iter = 0; iter < participants.length * participants.length; iter++) {
    const [creditor, credit] = getMax(remaining);
    const [debtor, debt] = getMin(remaining);
    if (Math.abs(credit) < EPSILON && Math.abs(debt) < EPSILON) break;
    if (credit < EPSILON) break;
    const settled = Math.min(credit, -debt);
    remaining.set(creditor, credit - settled);
    remaining.set(debtor, debt + settled);
    result.push({
      from: participants.find(p => p.id === debtor)?.name ?? debtor,
      to: participants.find(p => p.id === creditor)?.name ?? creditor,
      amount: Math.round(settled * 100) / 100,
    });
  }
  return result;
}

export function splitEqually(total: number, count: number): number {
  if (count <= 0) return 0;
  return Math.round((total / count) * 100) / 100;
}

export function computeTotalPool(contributions: number[]): number {
  return contributions.reduce((sum, c) => sum + c, 0);
}
