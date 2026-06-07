export const ROUTES = {
  HOME: '/',
  TRANSACTIONS: '/transactions',
  TRANSFER: '/transactions/transfer',
  USER_ACCOUNT: '/users/:id',
  USER_TRANSACTIONS: '/users/:id/transactions',
  USER_TRANSFER: '/users/:id/transactions/transfer',
  USER_REPORTS: '/users/:id/reports',
  USER_MONEY_TRACE: '/users/:id/money-trace',
  MONEY_TRACE: '/money-trace',
} as const;

export function userAccountPath(id: string): string {
  return `/users/${id}`;
}

export function userTransactionsPath(id: string): string {
  return `/users/${id}/transactions`;
}

export function userTransferPath(id: string): string {
  return `/users/${id}/transactions/transfer`;
}

export function userReportsPath(id: string): string {
  return `/users/${id}/reports`;
}

export function userMoneyTracePath(id: string): string {
  return `/users/${id}/money-trace`;
}

export function userDetailPath(id: string): string {
  return userAccountPath(id);
}

export type ReportTab = 'charts' | 'sources';

export const REPORT_TABS: { key: ReportTab; label: string }[] = [
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

export const MOCK_DELAY_MS = 200;

export {
  APP_DATE_RANGE,
  APP_YEARS,
  DEMO_DATE_RANGE,
  DEMO_YEAR,
  clampAppDate,
  clampAppDateRange,
  clampDemoDate,
  clampDemoDateRange,
  distributeAppDates,
  distributeDemoDates,
  formatAppDateLabel,
  formatDemoDateLabel,
  getDemoToday,
  getEffectiveAppDateRange,
  getTodayIso,
  isAppYearDate,
  isDateInRange,
  isDateOnOrBeforeToday,
  isDemoYearDate,
} from '@/utils/demoDate';

export const APP_NAME = 'User Finance Manager';
export const APP_SUBTITLE = 'Admin Dashboard';
