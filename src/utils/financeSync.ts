import type { MonthlyFinance, SourceBreakdown } from '@/types';

export function expandMonthlyToAppYears(monthly: MonthlyFinance[]): MonthlyFinance[] {
  const year2026 = monthly
    .filter((item) => item.month.startsWith('2025-'))
    .map((item, index) => ({
      month: item.month.replace('2025-', '2026-'),
      income: Math.round(item.income * (1.03 + (index % 3) * 0.01)),
      expense: Math.round(item.expense * (1.02 + (index % 4) * 0.008)),
    }));

  return [...monthly, ...year2026];
}

function sumMonthlyIncome(monthly: MonthlyFinance[]): number {  return monthly.reduce((total, item) => total + item.income, 0);
}

function sumMonthlyExpense(monthly: MonthlyFinance[]): number {
  return monthly.reduce((total, item) => total + item.expense, 0);
}

function sumBreakdownByType(breakdown: SourceBreakdown[], type: SourceBreakdown['type']): number {
  return breakdown
    .filter((item) => item.type === type)
    .reduce((total, item) => total + item.amount, 0);
}

function scaleItems(
  items: SourceBreakdown[],
  targetTotal: number,
): SourceBreakdown[] {
  if (items.length === 0 || targetTotal <= 0) {
    return items;
  }

  const currentTotal = items.reduce((total, item) => total + item.amount, 0);
  if (currentTotal <= 0) {
    return items;
  }

  const ratio = targetTotal / currentTotal;
  const scaled = items.map((item) => ({
    ...item,
    amount: Math.max(1, Math.round(item.amount * ratio)),
  }));

  const scaledTotal = scaled.reduce((total, item) => total + item.amount, 0);
  const diff = targetTotal - scaledTotal;

  if (diff !== 0) {
    const lastIndex = scaled.length - 1;
    scaled[lastIndex] = {
      ...scaled[lastIndex],
      amount: Math.max(1, scaled[lastIndex].amount + diff),
    };
  }

  return scaled;
}

export function syncBreakdownWithMonthly(
  breakdown: SourceBreakdown[],
  monthly: MonthlyFinance[],
): SourceBreakdown[] {
  if (!breakdown.length || !monthly.length) {
    return breakdown;
  }

  const targetIncome = sumMonthlyIncome(monthly);
  const targetExpense = sumMonthlyExpense(monthly);
  const incomeItems = breakdown.filter((item) => item.type === 'income');
  const expenseItems = breakdown.filter((item) => item.type === 'expense');

  const currentIncome = sumBreakdownByType(breakdown, 'income');
  const currentExpense = sumBreakdownByType(breakdown, 'expense');

  if (currentIncome === targetIncome && currentExpense === targetExpense) {
    return breakdown;
  }

  return [
    ...scaleItems(incomeItems, targetIncome),
    ...scaleItems(expenseItems, targetExpense),
  ];
}

export function calculateMonthlyIncomeAverage(monthly: MonthlyFinance[]): number {
  if (!monthly.length) {
    return 0;
  }

  return Math.round(sumMonthlyIncome(monthly) / monthly.length);
}
