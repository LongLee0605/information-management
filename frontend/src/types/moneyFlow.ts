export type MoneyFlowLevel = 0 | 1 | 2 | 3;
export interface MoneyFlowNode {
    id: string;
    level: MoneyFlowLevel;
    userId?: string;
    cif: string;
    accountNumber: string;
    fullName: string;
    bank: string;
    bankBadgeClass: string;
    avatar?: string;
    amount?: number;
    transactionCount?: number;
    periodLabel?: string;
    dateFrom: string;
    dateTo: string;
    children?: MoneyFlowNode[];
}
export interface MoneyFlowTrace {
    rootUserId: string;
    root: MoneyFlowNode;
}
export interface MoneyFlowFilterParams {
    cif: string;
    accountNumber: string;
    fromDate: string;
    toDate: string;
}
export interface MoneyFlowStats {
    relatedAccounts: number;
    totalTransactions: number;
    totalFlowAmount: number;
    traceLevels: number;
}
export interface MoneyFlowSearchResult {
    trace: MoneyFlowTrace | null;
    stats: MoneyFlowStats;
    error: string | null;
}
