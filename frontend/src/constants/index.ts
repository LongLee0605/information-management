import { getUserRouteSegment } from '@/utils/userRoute';
export const ROUTES = {
    HOME: '/',
    ACCOUNTS: '/accounts',
    TRANSACTIONS: '/transactions',
    TRANSFER: '/transactions/transfer',
    USER_ACCOUNT: '/users/:id',
    USER_PROFILE: '/users/:id/profile',
    USER_TRANSACTIONS: '/users/:id/transactions',
    USER_TRANSFER: '/users/:id/transactions/transfer',
    USER_REPORTS: '/users/:id/reports',
    USER_MONEY_TRACE: '/users/:id/money-trace',
    MONEY_TRACE: '/money-trace',
} as const;
export function userAccountPath(userId: string): string {
    return `/users/${getUserRouteSegment(userId)}`;
}
export function userProfilePath(userId: string): string {
    return `/users/${getUserRouteSegment(userId)}/profile`;
}
export function userTransactionsPath(userId: string): string {
    return `/users/${getUserRouteSegment(userId)}/transactions`;
}
export function userTransferPath(userId: string): string {
    return `/users/${getUserRouteSegment(userId)}/transactions/transfer`;
}
export function userReportsPath(userId: string): string {
    return `/users/${getUserRouteSegment(userId)}/reports`;
}
export function userMoneyTracePath(userId: string): string {
    return `/users/${getUserRouteSegment(userId)}/money-trace`;
}
export function userDetailPath(id: string): string {
    return userProfilePath(id);
}
export type ReportTab = 'charts' | 'sources';
export const REPORT_TABS: {
    key: ReportTab;
    label: string;
}[] = [
    { key: 'charts', label: 'Biểu đồ thu chi' },
    { key: 'sources', label: 'Phân tích nguồn' },
];
export const CHART_COLORS = {
    income: '#16a34a',
    expense: '#dc2626',
} as const;
export const PIE_COLORS = [
    '#4472c4',
    '#16a34a',
    '#ca8a04',
    '#dc2626',
    '#7c3aed',
    '#0891b2',
    '#db2777',
    '#64748b',
] as const;
export { DEFAULT_PAGE_SIZE } from './pagination';
export { APP_DATE_RANGE, APP_YEARS, DEMO_DATE_RANGE, DEMO_YEAR, clampAppDate, clampAppDateRange, clampDemoDate, clampDemoDateRange, distributeAppDates, distributeDemoDates, formatAppDateLabel, formatDemoDateLabel, getDemoToday, getEffectiveAppDateRange, getTodayIso, isAppYearDate, isDateInRange, isDateOnOrBeforeToday, isDemoYearDate, } from '@/utils/demoDate';
export const APP_NAME = 'User Finance Manager';
export const APP_SUBTITLE = 'Admin Dashboard';
