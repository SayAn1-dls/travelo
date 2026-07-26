export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCompact(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return formatINR(amount);
}

export function budgetHealthPercent(spent: number, budget: number): number {
  if (budget <= 0) return 0;
  return Math.min((spent / budget) * 100, 100);
}

export function budgetStatus(spent: number, budget: number): 'safe' | 'warning' | 'critical' {
  const pct = budgetHealthPercent(spent, budget);
  if (pct < 70) return 'safe';
  if (pct < 90) return 'warning';
  return 'critical';
}
