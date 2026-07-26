import { splitEqually, computeTotalPool, computeNetBalances, minimumCashFlow } from '../lib/utils/debtSolver';
import { Participant } from '../lib/types';

const mockParticipant = (name: string, contribution: number, amountPaid: number, amountOwed: number): Participant => ({ id: `p-${name}`, name, contribution, amountPaid, amountOwed, status: 'owing' });

describe('debtSolver — splitEqually', () => {
  it('splits equally across members', () => { expect(splitEqually(300, 3)).toBe(100); });
  it('handles non-divisible amounts with rounding', () => { const s = splitEqually(100, 3); expect(s).toBeCloseTo(33.33, 1); });
  it('returns 0 when count is 0', () => { expect(splitEqually(500, 0)).toBe(0); });
});

describe('debtSolver — computeTotalPool', () => {
  it('sums all contributions', () => { expect(computeTotalPool([mockParticipant('A', 1000, 0, 0), mockParticipant('B', 2000, 0, 0)])).toBe(3000); });
  it('returns 0 for empty array', () => { expect(computeTotalPool([])).toBe(0); });
});

describe('debtSolver — computeNetBalances', () => {
  it('correctly computes net balance per participant', () => {
    const p = [mockParticipant('A', 1000, 300, 100), mockParticipant('B', 1000, 0, 200)];
    const b = computeNetBalances(p);
    expect(b.get('A')).toBe(200);
    expect(b.get('B')).toBe(-200);
  });
});

describe('debtSolver — minimumCashFlow', () => {
  it('resolves a simple 2-person debt', () => {
    const ps = [mockParticipant('Alice', 500, 200, 100), mockParticipant('Bob', 500, 0, 100)];
    const e = minimumCashFlow(ps);
    expect(e.length).toBe(1);
    expect(e[0].from).toBe('Bob');
    expect(e[0].to).toBe('Alice');
    expect(e[0].amount).toBe(100);
  });
  it('resolves a 3-person unequal split into minimum transactions', () => {
    const ps = [mockParticipant('A', 0, 300, 100), mockParticipant('B', 0, 0, 100), mockParticipant('C', 0, 0, 100)];
    const e = minimumCashFlow(ps);
    expect(e.length).toBeGreaterThan(0);
    const totalSettled = e.reduce((s, x) => s + x.amount, 0);
    expect(totalSettled).toBeCloseTo(200, 0);
  });
  it('returns empty when all balances are settled', () => {
    const ps = [mockParticipant('A', 0, 100, 100), mockParticipant('B', 0, 100, 100)];
    expect(minimumCashFlow(ps)).toHaveLength(0);
  });
});
