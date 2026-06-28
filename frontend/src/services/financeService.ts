import api, { API_PATHS } from '@/lib/api';
import type { AvgBalanceRecord, MonthlyFinance, SourceBreakdown, UserFinance } from '@/types';
import { APP_YEARS, getEffectiveAppDateRange } from '@/utils/demoDate';

export interface FinanceDateRange {
    fromDate: string;
    toDate: string;
}

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

function defaultFinanceRange(): FinanceDateRange {
    const range = getEffectiveAppDateRange();
    return { fromDate: range.fromDate, toDate: range.toDate };
}

function monthKeyFromDate(date: string): string {
    return date.slice(0, 7);
}

function yearsInRange(fromDate: string, toDate: string): number[] {
    const fromYear = Number(fromDate.slice(0, 4));
    const toYear = Number(toDate.slice(0, 4));
    return APP_YEARS.filter((year) => year >= fromYear && year <= toYear);
}

async function fetchMonthlyForYear(userId: string, year: number): Promise<MonthlyFinance[]> {
    const { data } = await api.get<ApiMonthlyChart[]>(API_PATHS.reports.monthlyChart, {
        params: { customerId: userId, year },
    });
    return data.map(mapMonthly);
}

async function getMonthlyFinance(userId: string, range: FinanceDateRange): Promise<MonthlyFinance[]> {
    const years = yearsInRange(range.fromDate, range.toDate);
    if (!years.length) {
        return [];
    }

    const chunks = await Promise.all(years.map((year) => fetchMonthlyForYear(userId, year)));
    const fromMonth = monthKeyFromDate(range.fromDate);
    const toMonth = monthKeyFromDate(range.toDate);

    return chunks
        .flat()
        .filter((item) => item.month >= fromMonth && item.month <= toMonth)
        .sort((a, b) => a.month.localeCompare(b.month));
}

function pieChartParams(userId: string, transactionType: 'credit' | 'debit', range: FinanceDateRange) {
    return {
        customerId: userId,
        transactionType,
        fromDate: range.fromDate,
        toDate: range.toDate,
    };
}

export async function getSourceBreakdown(
    userId: string,
    range: FinanceDateRange = defaultFinanceRange(),
): Promise<SourceBreakdown[]> {
    const [income, expense] = await Promise.all([
        api.get<ApiPieChart[]>(API_PATHS.reports.pieChart, {
            params: pieChartParams(userId, 'credit', range),
        }),
        api.get<ApiPieChart[]>(API_PATHS.reports.pieChart, {
            params: pieChartParams(userId, 'debit', range),
        }),
    ]);

    return [
        ...income.data.map((row) => mapBreakdown(row, 'credit')),
        ...expense.data.map((row) => mapBreakdown(row, 'debit')),
    ];
}

export async function getUserFinance(
    userId: string,
    range: FinanceDateRange = defaultFinanceRange(),
): Promise<UserFinance> {
    const [monthly, breakdown] = await Promise.all([
        getMonthlyFinance(userId, range),
        getSourceBreakdown(userId, range),
    ]);

    return { userId, monthly, breakdown };
}

interface ApiAvgBalance {
    CIF: string;
    ThangNam: string;
    AvgBalance: number;
}

export async function getAvgBalance(
    userId: string,
    month: number,
    year: number,
): Promise<AvgBalanceRecord[]> {
    const { data } = await api.get<ApiAvgBalance[]>(API_PATHS.reports.avgBalance, {
        params: { customerId: userId, month, year },
    });
    return data.map((row) => ({
        cif: row.CIF,
        monthYear: row.ThangNam,
        avgBalance: row.AvgBalance,
    }));
}
