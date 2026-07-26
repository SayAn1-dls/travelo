import { minimumCashFlow, computeNetBalances, splitEqually, computeTotalPool } from '@/lib/utils/debtSolver';
import { Participant } from '@/lib/types';

function makeParticipant(id: string, name: string, paid: number, owed: number): Participant {
  return { id, name, contribution: 0, amountPaid: paid, amountOwed: owed, status: 'owing' };
}

describe('debtSolver — splitEqually', () => {
  it('splits equally across members', () => {
    expect(splitEqually(300, 3)).toBe(100);
  });
  it('handles non-divisible amounts with rounding', () => {
    expect(splitEqually(100, 3)).toBe(33.33);
  });
  it('returns 0 when count is 0', () => {
    expect(splitEqually(100, 0)).toBe(0);
  });
});

describe('debtSolver — computeTotalPool', () => {
  it('sums all contributions', () => {
    expect(computeTotalPool([1000, 2000, 1500])).toBe(4500);
  });
  it('returns 0 for empty array', () => {
    expect(computeTotalPool([])).toBe(0);
  });
});

describe('debtSolver — computeNetBalances', () => {
  it('correctly computes net balance per participant', () => {
    const participants = [
      makeParticipant('A', 'Alice', 300, 100),   // net +200 (creditor)
      makeParticipant('B', 'Bob', 0, 100),        // net -100 (debtor)
      makeParticipant('C', 'Charlie', 0, 100),    // net -100 (debtor)
    ];
    const balances = computeNetBalances(participants);
    expect(balances.get('A')).toBe(200);
    expect(balances.get('B')).toBe(-100);
    expect(balances.get('C')).toBe(-100);
  });
});

describe('debtSolver — minimumCashFlow', () => {
  it('resolves a simple 2-person debt', () => {
    const participants = [
      makeParticipant('A', 'Alice', 200, 100),  // net +100
      makeParticipant('B', 'Bob', 0, 100),      // net -100
    ];
    const edges = minimumCashFlow(participants);
    expect(edges.length).toBe(1);
    expect(edges[0].from).toBe('Bob');
    expect(edges[0].to).toBe('Alice');
    expect(edges[0].amount).toBe(100);
  });

  it('resolves a 3-person unequal split into minimum transactions', () => {
    // Alice paid 300, Bob paid 0, Charlie paid 0
    // each owes 100. So Bob->Alice 100, Charlie->Alice 100
    const participants = [
      makeParticipant('A', 'Alice', 300, 100),  // net +200
      makeParticipant('B', 'Bob', 0, 100),      // net -100
      makeParticipant('C', 'Charlie', 0, 100),  // net -100
    ];
    const edges = minimumCashFlow(participants);
    const totalFlow = edges.reduce((s, e) => s + e.amount, 0);
    expect(totalFlow).toBeCloseTo(200, 1);
    expect(edges.length).toBeLessThanOrEqual(2);
  });

  it('returns empty when all balances are settled', () => {
    const participants = [
      makeParticipant('A', 'Alice', 100, 100),
      makeParticipant('B', 'Bob', 100, 100),
    ];
    const edges = minimumCashFlow(participants);
    expect(edges.length).toBe(0);
  });
});
