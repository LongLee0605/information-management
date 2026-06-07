import type { MonthlyFinance, SourceBreakdown } from '@/types/finance';

export interface LineChartPoint {
  month: string;
  label: string;
  income: number;
  expense: number;
}

export interface PieChartPoint {
  name: string;
  value: number;
  fill: string;
}

export function transformMonthlyToLineChart(
  data: MonthlyFinance[],
): LineChartPoint[] {
  return data.map((item) => ({
    month: item.month,
    label: item.month.slice(5),
    income: item.income,
    expense: item.expense,
  }));
}

export function transformBreakdownToPieChart(
  data: SourceBreakdown[],
  type: 'income' | 'expense',
  colors: readonly string[],
): PieChartPoint[] {
  return data
    .filter((item) => item.type === type)
    .map((item, index) => ({
      name: item.source,
      value: item.amount,
      fill: colors[index % colors.length] ?? colors[0],
    }));
}

export function calculateFinanceSummary(data: MonthlyFinance[]) {
  const totalIncome = data.reduce((sum, item) => sum + item.income, 0);
  const totalExpense = data.reduce((sum, item) => sum + item.expense, 0);

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
  };
}
