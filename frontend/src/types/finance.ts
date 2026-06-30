export interface MonthlyFinance {
    month: string;
    income: number;
    expense: number;
}
export interface SourceBreakdown {
    source: string;
    amount: number;
    type: 'income' | 'expense';
}
export interface UserFinance {
    userId: string;
    monthly: MonthlyFinance[];
    breakdown: SourceBreakdown[];
}
export interface AvgBalanceRecord {
    cif: string;
    monthYear: string;
    avgBalance: number;
}
