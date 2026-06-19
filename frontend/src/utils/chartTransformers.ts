import type { MonthlyFinance, SourceBreakdown } from '@/types/finance';
import { formatDemoDateLabel } from '@/utils/demoDate';
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
export function transformMonthlyToLineChart(data: MonthlyFinance[]): LineChartPoint[] {
    return data.map((item) => ({
        month: item.month,
        label: item.month.slice(5),
        income: item.income,
        expense: item.expense,
    }));
}
export function transformBreakdownToPieChart(data: SourceBreakdown[], type: 'income' | 'expense', colors: readonly string[]): PieChartPoint[] {
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
export function calculateTransactionSummary(transactions: Array<{
    type: 'credit' | 'debit';
    amount: number;
}>) {
    let totalIncome = 0;
    let totalExpense = 0;
    for (const transaction of transactions) {
        if (transaction.type === 'credit') {
            totalIncome += transaction.amount;
        }
        else {
            totalExpense += transaction.amount;
        }
    }
    return {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
    };
}
function toMonthKey(date: string): string {
    return date.slice(0, 7);
}
export function filterMonthlyByDateRange(data: MonthlyFinance[], fromDate: string, toDate: string): MonthlyFinance[] {
    const fromMonth = toMonthKey(fromDate);
    const toMonth = toMonthKey(toDate);
    return data.filter((item) => item.month >= fromMonth && item.month <= toMonth);
}
export function formatDateRangeLabel(fromDate: string, toDate: string): string {
    return `${formatDemoDateLabel(fromDate)} – ${formatDemoDateLabel(toDate)}`;
}
