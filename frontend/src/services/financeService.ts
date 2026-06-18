import api, { API_PATHS } from '@/lib/api';
import type { MonthlyFinance, SourceBreakdown, UserFinance } from '@/types';
import { APP_DATE_RANGE, DEMO_YEAR } from '@/utils/demoDate';

interface ApiMonthlyChart {
  Thang: number;
  Nam: number;
  TongThu?: number;
  TongChi?: number;
  TongThuNhap?: number;
  TongChiTieu?: number;
}

interface ApiPieChart {
  DanhMuc: string;
  TongTien?: number;
  TongSoTien?: number;
  LoaiGiaoDich?: string;
}

function mapMonthly(row: ApiMonthlyChart): MonthlyFinance {
  return {
    month: `${row.Nam}-${String(row.Thang).padStart(2, '0')}`,
    income: row.TongThuNhap ?? row.TongThu ?? 0,
    expense: row.TongChiTieu ?? row.TongChi ?? 0,
  };
}

function mapBreakdown(row: ApiPieChart, transactionType: 'credit' | 'debit'): SourceBreakdown {
  return {
    source: row.DanhMuc,
    amount: row.TongSoTien ?? row.TongTien ?? 0,
    type: transactionType === 'credit' ? 'income' : 'expense',
  };
}

export async function getMonthlyFinance(userId: string): Promise<MonthlyFinance[]> {
  const { data } = await api.get<ApiMonthlyChart[]>(API_PATHS.reports.monthlyChart, {
    params: { customerId: userId, year: DEMO_YEAR },
  });
  return data.map(mapMonthly);
}

const pieChartParams = (userId: string, transactionType: 'credit' | 'debit') => ({
  customerId: userId,
  transactionType,
  fromDate: APP_DATE_RANGE.fromDate,
  toDate: `${DEMO_YEAR}-12-31`,
});

export async function getSourceBreakdown(userId: string): Promise<SourceBreakdown[]> {
  const [income, expense] = await Promise.all([
    api.get<ApiPieChart[]>(API_PATHS.reports.pieChart, {
      params: pieChartParams(userId, 'credit'),
    }),
    api.get<ApiPieChart[]>(API_PATHS.reports.pieChart, {
      params: pieChartParams(userId, 'debit'),
    }),
  ]);
  return [
    ...income.data.map((row) => mapBreakdown(row, 'credit')),
    ...expense.data.map((row) => mapBreakdown(row, 'debit')),
  ];
}

export async function getUserFinance(userId: string): Promise<UserFinance | null> {
  const [monthlyRes, incomeRes, expenseRes] = await Promise.all([
    api.get<ApiMonthlyChart[]>(API_PATHS.reports.monthlyChart, {
      params: { customerId: userId, year: DEMO_YEAR },
    }),
    api.get<ApiPieChart[]>(API_PATHS.reports.pieChart, {
      params: pieChartParams(userId, 'credit'),
    }),
    api.get<ApiPieChart[]>(API_PATHS.reports.pieChart, {
      params: pieChartParams(userId, 'debit'),
    }),
  ]);

  const monthly = monthlyRes.data.map(mapMonthly);
  const breakdown = [
    ...incomeRes.data.map((row) => mapBreakdown(row, 'credit')),
    ...expenseRes.data.map((row) => mapBreakdown(row, 'debit')),
  ];

  if (!monthly.length && !breakdown.length) return null;
  return { userId, monthly, breakdown };
}
