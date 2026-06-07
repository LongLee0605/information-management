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
  income: '#2dd4bf',
  expense: '#fb7185',
} as const;

export const PIE_COLORS = [
  '#818cf8',
  '#2dd4bf',
  '#c9a962',
  '#fb7185',
  '#a78bfa',
  '#38bdf8',
  '#f472b6',
  '#34d399',
] as const;

export const MOCK_DELAY_MS = 200;
