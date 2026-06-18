import api from '@/lib/api';
import type { MonthlyFinance, SourceBreakdown, UserFinance } from '@/types';

interface ApiMonthlyChart {
  Thang: number;
  Nam: number;
  TongThuNhap: number;
  TongChiTieu: number;
}

interface ApiPieChart {
  DanhMuc: string;
  TongSoTien: number;
  LoaiGiaoDich: string;
}

function mapMonthly(row: ApiMonthlyChart): MonthlyFinance {
  return {
    month: `${row.Nam}-${String(row.Thang).padStart(2, '0')}`,
    income: row.TongThuNhap ?? 0,
    expense: row.TongChiTieu ?? 0,
  };
}

function mapBreakdown(row: ApiPieChart): SourceBreakdown {
  return {
    source: row.DanhMuc,
    amount: row.TongSoTien,
    type: row.LoaiGiaoDich === 'credit' ? 'income' : 'expense',
  };
}

export async function getMonthlyFinance(userId: string): Promise<MonthlyFinance[]> {
  const { data } = await api.get<ApiMonthlyChart[]>('/api/reports/monthly-chart', {
    params: { customerId: userId },
  });
  return data.map(mapMonthly);
}

export async function getSourceBreakdown(userId: string): Promise<SourceBreakdown[]> {
  const [income, expense] = await Promise.all([
    api.get<ApiPieChart[]>('/api/reports/pie-chart', {
      params: { customerId: userId, transactionType: 'credit' },
    }),
    api.get<ApiPieChart[]>('/api/reports/pie-chart', {
      params: { customerId: userId, transactionType: 'debit' },
    }),
  ]);
  return [...income.data.map(mapBreakdown), ...expense.data.map(mapBreakdown)];
}

export async function getUserFinance(userId: string): Promise<UserFinance | null> {
  const [monthly, breakdown] = await Promise.all([
    getMonthlyFinance(userId),
    getSourceBreakdown(userId),
  ]);
  if (!monthly.length && !breakdown.length) return null;
  return { userId, monthly, breakdown };
}
