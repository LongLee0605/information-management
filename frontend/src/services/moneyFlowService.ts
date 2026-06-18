import api, { API_PATHS } from '@/lib/api';
import type { MoneyFlowFilterParams, MoneyFlowNode, MoneyFlowSearchResult, MoneyFlowTrace, } from '@/types/moneyFlow';
import { getApiCifFromUserId } from '@/utils/apiAccountCache';
interface ApiMoneyFlowRow {
    HuongDongTien: 'outbound' | 'inbound';
    MaGiaoDich: number;
    NgayGiaoDich: string;
    SoTien: number;
    MoTa: string | null;
    DanhMuc: string | null;
    PhuongThucThanhToan: string | null;
    TaiKhoanNguon: string;
    KhachHangNguon: string;
    MaKhachHang: number;
}
function buildFlowTree(rows: ApiMoneyFlowRow[], rootUserId: string, rootAccountNumber: string, rootFullName: string): MoneyFlowNode | null {
    if (!rows.length)
        return null;
    const dates = rows.map((r) => r.NgayGiaoDich.split('T')[0]).sort();
    const cif = getApiCifFromUserId(rootUserId) ?? rootAccountNumber;
    return {
        id: `root-${rootUserId}`,
        level: 0,
        userId: rootUserId,
        cif,
        accountNumber: rootAccountNumber,
        fullName: rootFullName,
        bank: '',
        bankBadgeClass: 'bg-orange-500 text-white',
        amount: rows.reduce((sum, r) => sum + r.SoTien, 0),
        transactionCount: rows.length,
        dateFrom: dates[0] ?? '',
        dateTo: dates[dates.length - 1] ?? '',
        children: rows.map((row, idx): MoneyFlowNode => ({
            id: `flow-${row.MaGiaoDich}-${row.HuongDongTien}-${idx}`,
            level: 1,
            userId: String(row.MaKhachHang),
            cif: row.TaiKhoanNguon,
            accountNumber: row.TaiKhoanNguon,
            fullName: row.KhachHangNguon,
            bank: '',
            bankBadgeClass: row.HuongDongTien === 'outbound' ? 'bg-blue-500 text-white' : 'bg-emerald-500 text-white',
            amount: row.SoTien,
            transactionCount: 1,
            dateFrom: row.NgayGiaoDich.split('T')[0],
            dateTo: row.NgayGiaoDich.split('T')[0],
        })),
    };
}
function buildMoneyFlowParams(filters: Partial<MoneyFlowFilterParams> & {
    customerId?: string;
}) {
    return {
        ...(filters.customerId && { customerId: filters.customerId }),
        ...(filters.cif?.trim() && { cif: filters.cif.trim() }),
        ...(filters.accountNumber?.trim() && { accountNumber: filters.accountNumber.trim() }),
        ...(filters.fromDate && { fromDate: filters.fromDate }),
        ...(filters.toDate && { toDate: filters.toDate }),
    };
}
export async function getMoneyFlowTrace(userId: string): Promise<MoneyFlowTrace | null> {
    const { data } = await api.get<ApiMoneyFlowRow[]>(API_PATHS.reports.moneyFlow, {
        params: { customerId: userId },
    });
    if (!data.length)
        return null;
    const rootAccount = data[0]?.TaiKhoanNguon ?? '';
    const rootName = data[0]?.KhachHangNguon ?? '';
    const root = buildFlowTree(data, userId, rootAccount, rootName);
    if (!root)
        return null;
    return { rootUserId: userId, root };
}
export async function searchMoneyFlow(filters: MoneyFlowFilterParams): Promise<MoneyFlowSearchResult> {
    const empty = { relatedAccounts: 0, totalTransactions: 0, totalFlowAmount: 0, traceLevels: 0 };
    if (!filters.cif.trim() && !filters.accountNumber.trim()) {
        return { trace: null, stats: empty, error: 'Vui lòng nhập Số CIF hoặc Số tài khoản.' };
    }
    const { data } = await api.get<ApiMoneyFlowRow[]>(API_PATHS.reports.moneyFlow, { params: buildMoneyFlowParams(filters) });
    if (!data.length) {
        return { trace: null, stats: empty, error: 'Không có dữ liệu truy vết cho tài khoản này.' };
    }
    const rootUserId = String(data[0].MaKhachHang);
    const rootAccount = filters.accountNumber.trim() || data[0].TaiKhoanNguon;
    const rootName = data[0].KhachHangNguon;
    const root = buildFlowTree(data, rootUserId, rootAccount, rootName);
    if (!root) {
        return { trace: null, stats: empty, error: 'Không tìm thấy tài khoản.' };
    }
    const uniqueAccounts = new Set(data.map((r) => r.TaiKhoanNguon));
    return {
        trace: { rootUserId, root },
        stats: {
            relatedAccounts: uniqueAccounts.size,
            totalTransactions: data.length,
            totalFlowAmount: data.reduce((sum, r) => sum + r.SoTien, 0),
            traceLevels: 2,
        },
        error: null,
    };
}
