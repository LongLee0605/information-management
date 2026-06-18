import api from '@/lib/api';
import type {
  MoneyFlowFilterParams,
  MoneyFlowNode,
  MoneyFlowSearchResult,
  MoneyFlowTrace,
} from '@/types/moneyFlow';

interface ApiMoneyFlow {
  MaGiaoDich: number;
  MaTaiKhoan_Nguon: number | null;
  SoTaiKhoan_Nguon: string | null;
  HoTen_Nguon: string | null;
  NganHang_Nguon: string | null;
  MaTaiKhoan_Dich: number | null;
  SoTaiKhoan_Dich: string | null;
  HoTen_Dich: string | null;
  NganHang_Dich: string | null;
  SoTien: number;
  NgayGiaoDich: string;
  DanhMuc: string | null;
}

function buildFlowTree(rows: ApiMoneyFlow[], rootAccount: string): MoneyFlowNode | null {
  if (!rows.length) return null;

  const rootRow = rows.find(
    (r) => r.SoTaiKhoan_Nguon === rootAccount || r.SoTaiKhoan_Dich === rootAccount,
  );
  if (!rootRow) return null;

  const isSource = rootRow.SoTaiKhoan_Nguon === rootAccount;
  const dates = rows.map((r) => r.NgayGiaoDich).sort();

  return {
    id: `root-${rootAccount}`,
    level: 0,
    cif: rootAccount,
    accountNumber: rootAccount,
    fullName: isSource ? (rootRow.HoTen_Nguon ?? '') : (rootRow.HoTen_Dich ?? ''),
    bank: isSource ? (rootRow.NganHang_Nguon ?? '') : (rootRow.NganHang_Dich ?? ''),
    bankBadgeClass: 'bg-orange-500 text-white',
    amount: rows.reduce((sum, r) => sum + r.SoTien, 0),
    transactionCount: rows.length,
    dateFrom: dates[0] ?? '',
    dateTo: dates[dates.length - 1] ?? '',
    children: rows.map((r, idx): MoneyFlowNode => ({
      id: `node-${r.MaGiaoDich}-${idx}`,
      level: 1,
      cif: r.SoTaiKhoan_Dich ?? '',
      accountNumber: r.SoTaiKhoan_Dich ?? '',
      fullName: r.HoTen_Dich ?? '',
      bank: r.NganHang_Dich ?? '',
      bankBadgeClass: 'bg-blue-500 text-white',
      amount: r.SoTien,
      transactionCount: 1,
      dateFrom: r.NgayGiaoDich,
      dateTo: r.NgayGiaoDich,
    })),
  };
}

export async function getMoneyFlowTrace(userId: string): Promise<MoneyFlowTrace | null> {
  const { data } = await api.get<ApiMoneyFlow[]>('/api/reports/money-flow', {
    params: { customerId: userId },
  });
  if (!data.length) return null;
  const root = buildFlowTree(data, data[0]?.SoTaiKhoan_Nguon ?? '');
  if (!root) return null;
  return { rootUserId: userId, root };
}

export async function searchMoneyFlow(filters: MoneyFlowFilterParams): Promise<MoneyFlowSearchResult> {
  const empty = { relatedAccounts: 0, totalTransactions: 0, totalFlowAmount: 0, traceLevels: 0 };

  if (!filters.cif.trim() && !filters.accountNumber.trim()) {
    return { trace: null, stats: empty, error: 'Vui lòng nhập Số CIF hoặc Số tài khoản.' };
  }

  try {
    const rootAccount = filters.accountNumber.trim() || filters.cif.trim();
    const { data } = await api.get<ApiMoneyFlow[]>('/api/reports/money-flow', {
      params: {
        ...(filters.cif.trim()           && { cif:        filters.cif.trim() }),
        ...(filters.accountNumber.trim() && { accountNumber: filters.accountNumber.trim() }),
        ...(filters.fromDate             && { fromDate:    filters.fromDate }),
        ...(filters.toDate               && { toDate:      filters.toDate }),
      },
    });

    if (!data.length) {
      return { trace: null, stats: empty, error: 'Không có dữ liệu truy vết cho tài khoản này.' };
    }

    const root = buildFlowTree(data, rootAccount);
    if (!root) {
      return { trace: null, stats: empty, error: 'Không tìm thấy tài khoản.' };
    }

    const uniqueAccounts = new Set(
      data.flatMap((r) => [r.SoTaiKhoan_Nguon, r.SoTaiKhoan_Dich]).filter(Boolean),
    );

    return {
      trace: { rootUserId: rootAccount, root },
      stats: {
        relatedAccounts:  uniqueAccounts.size,
        totalTransactions: data.length,
        totalFlowAmount:  data.reduce((sum, r) => sum + r.SoTien, 0),
        traceLevels:      2,
      },
      error: null,
    };
  } catch (err) {
    return {
      trace: null,
      stats: empty,
      error: err instanceof Error ? err.message : 'Lỗi không xác định.',
    };
  }
}
