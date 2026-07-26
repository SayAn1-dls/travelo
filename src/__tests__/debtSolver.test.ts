import { minimumCashFlow, computeNetBalances, splitEqually, computeTotalPool } from '../lib/utils/debtSolver';
import { Participant } from '../lib/types';

function makeParticipant(id: string, name: string, paid: number, owed: number): Participant {
  return { id, name, contribution: 0, amountPaid: paid, amountOwed: owed, status: 'owing' };
}

describe('splitEqually', () => {
  it('splits equally', () => { expect(splitEqually(300, 3)).toBe(100); });
  it('rounds correctly', () => { expect(splitEqually(100, 3)).toBe(33.33); });
  it('handles zero count', () => { expect(splitEqually(100, 0)).toBe(0); });
});

describe('computeTotalPool', () => {
  it('sums contributions', () => { expect(computeTotalPool([1000, 2000, 1500])).toBe(4500); });
  it('empty array returns 0', () => { expect(computeTotalPool([])).toBe(0); });
});

describe('computeNetBalances', () => {
  it('computes net balances', () => {
    const ps = [makeParticipant('A', 'Alice', 300, 100), makeParticipant('B', 'Bob', 0, 100)];
    const b = computeNetBalances(ps);
    expect(b.get('A')).toBe(200);
    expect(b.get('B')).toBe(-100);
  });
});

describe('minimumCashFlow', () => {
  it('simple 2-person debt', () => {
    const ps = [makeParticipant('A', 'Alice', 200, 100), makeParticipant('B', 'Bob', 0, 100)];
    const edges = minimumCashFlow(ps);
    expect(edges.length).toBe(1);
    expect(edges[0].from).toBe('Bob');
    expect(edges[0].to).toBe('Alice');
    expect(edges[0].amount).toBe(100);
  });
  it('3-person split', () => {
    const ps = [makeParticipant('A', 'Alice', 300, 100), makeParticipant('B', 'Bob', 0, 100), makeParticipant('C', 'Charlie', 0, 100)];
    const edges = minimumCashFlow(ps);
    expect(edges.reduce((s, e) => s + e.amount, 0)).toBeCloseTo(200, 1);
  });
  it('settled group returns empty', () => {
    const ps = [makeParticipant('A', 'Alice', 100, 100), makeParticipant('B', 'Bob', 100, 100)];
    expect(minimumCashFlow(ps).length).toBe(0);
  });
});
