export const ROUTES = {
  HOME: '/',
  USER_DETAIL: '/users/:id',
} as const;

export function userDetailPath(id: string): string {
  return `/users/${id}`;
}

export type DetailTab = 'info' | 'charts' | 'sources';

export const DETAIL_TABS: { key: DetailTab; label: string }[] = [
  { key: 'info', label: 'Thông tin' },
  { key: 'charts', label: 'Biểu đồ thu chi' },
  { key: 'sources', label: 'Phân tích nguồn' },
];

export const CHART_COLORS = {
  income: '#10b981',
  expense: '#ef4444',
} as const;

export const PIE_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#84cc16',
] as const;

export const MOCK_DELAY_MS = 200;
