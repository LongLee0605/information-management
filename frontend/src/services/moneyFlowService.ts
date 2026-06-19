import api, { API_PATHS } from '@/lib/api';
import type { MoneyFlowFilterParams, MoneyFlowLevel, MoneyFlowNode, MoneyFlowSearchResult, MoneyFlowTrace, } from '@/types/moneyFlow';
import { getEffectiveAppDateRange } from '@/constants';
import { getApiCifFromUserId } from '@/utils/apiAccountCache';
import { formatMoneyFlowPeriodLabel } from '@/utils/moneyFlowHelpers';

interface ApiMoneyFlowRow {
    CapDo: number;
    MaTaiKhoan: number;
    MaTaiKhoanNguon: number | null;
    MaKhachHang: number;
    CIF: string;
    HoTen: string;
    KhachHangNguon?: string;
    SoTaiKhoan: string;
    TaiKhoanNguon?: string;
    NganHang: string;
    MaGiaoDich: number | null;
    SoTien: number | null;
    NgayGiaoDich: string | null;
    NgayTu: string | null;
    NgayDen: string | null;
    MoTa: string | null;
    DanhMuc: string | null;
    PhuongThucThanhToan: string | null;
    HuongDongTien: 'root' | 'outbound' | 'inbound';
    SoGiaoDich: number | null;
}

const LEVEL_BADGE: Record<number, string> = {
    0: 'bg-orange-500 text-white',
    1: 'bg-blue-500 text-white',
    2: 'bg-violet-500 text-white',
    3: 'bg-amber-500 text-white',
};

function resolveBankBadge(bankName: string, level: number): string {
    const normalized = bankName.toLowerCase();
    if (normalized.includes('ocb')) return 'bg-orange-500 text-white';
    if (normalized.includes('tpbank')) return 'bg-red-600 text-white';
    if (normalized.includes('vietcombank')) return 'bg-green-700 text-white';
    if (normalized.includes('bidv')) return 'bg-teal-700 text-white';
    if (normalized.includes('vietin')) return 'bg-blue-800 text-white';
    if (normalized.includes('mb')) return 'bg-blue-600 text-white';
    if (normalized.includes('vpbank')) return 'bg-green-600 text-white';
    if (normalized.includes('acb')) return 'bg-indigo-600 text-white';
    if (normalized.includes('sacombank')) return 'bg-rose-600 text-white';
    if (normalized.includes('techcombank')) return 'bg-red-700 text-white';
    return LEVEL_BADGE[level] ?? 'bg-slate-500 text-white';
}

function normalizeDate(value: string | null | undefined): string {
    if (!value) return '';
    return value.split('T')[0];
}

function mapRowToNode(row: ApiMoneyFlowRow): MoneyFlowNode {
    const level = Math.min(3, Math.max(0, row.CapDo)) as MoneyFlowLevel;
    const dateFrom = normalizeDate(row.NgayTu ?? row.NgayGiaoDich);
    const dateTo = normalizeDate(row.NgayDen ?? row.NgayGiaoDich);
    const fullName = row.HoTen ?? row.KhachHangNguon ?? '';
    const accountNumber = row.SoTaiKhoan ?? row.TaiKhoanNguon ?? '';

    return {
        id: level === 0
            ? `root-${row.MaKhachHang}`
            : `flow-${row.MaGiaoDich ?? `${row.MaKhachHang}-${level}`}`,
        level,
        userId: String(row.MaKhachHang),
        cif: row.CIF,
        accountNumber,
        fullName,
        bank: row.NganHang ?? '',
        bankBadgeClass: resolveBankBadge(row.NganHang ?? '', level),
        amount: row.SoTien ?? undefined,
        transactionCount: row.SoGiaoDich ?? (level === 0 ? undefined : 1),
        periodLabel: dateFrom && dateTo ? formatMoneyFlowPeriodLabel(dateFrom, dateTo) : undefined,
        dateFrom,
        dateTo,
    };
}

function buildFlowTree(rows: ApiMoneyFlowRow[], rootUserId: string): MoneyFlowNode | null {
    if (!rows.length) return null;

    const rootRow = rows.find((row) => row.CapDo === 0) ?? rows[0];
    const root = mapRowToNode(rootRow);

    if (String(rootRow.MaKhachHang) !== rootUserId) {
        root.userId = rootUserId;
        root.cif = getApiCifFromUserId(rootUserId) ?? root.cif;
    }

    const nodesByAccount = new Map<number, MoneyFlowNode>();
    nodesByAccount.set(rootRow.MaTaiKhoan, root);

    const hops = [...rows]
        .filter((row) => row.CapDo > 0)
        .sort((a, b) => a.CapDo - b.CapDo
            || (a.MaTaiKhoanNguon ?? 0) - (b.MaTaiKhoanNguon ?? 0)
            || (b.SoTien ?? 0) - (a.SoTien ?? 0));

    const linkedHops: ApiMoneyFlowRow[] = [];

    for (const hop of hops) {
        const node = mapRowToNode(hop);
        let parent: MoneyFlowNode | null = null;

        if (hop.CapDo === 1) {
            parent = root;
        }
        else {
            const parentAccountId = hop.MaTaiKhoanNguon;
            if (parentAccountId == null) {
                continue;
            }
            parent = nodesByAccount.get(parentAccountId) ?? null;
            if (!parent || parent.level + 1 !== hop.CapDo) {
                continue;
            }
        }

        const children = parent.children ?? [];
        const isDuplicate = children.some((child) => (
            child.level === node.level
            && child.userId === node.userId
            && child.accountNumber === node.accountNumber
        ));
        if (isDuplicate) {
            continue;
        }

        parent.children = [...children, node];
        linkedHops.push(hop);

        if (!nodesByAccount.has(hop.MaTaiKhoan)) {
            nodesByAccount.set(hop.MaTaiKhoan, node);
        }
    }

    sortChildrenByLevel(root);

    if (linkedHops.length) {
        root.amount = linkedHops.reduce((sum, row) => sum + (row.SoTien ?? 0), 0);
        root.transactionCount = linkedHops.length;
        const dates = linkedHops
            .map((row) => normalizeDate(row.NgayTu ?? row.NgayGiaoDich))
            .filter(Boolean)
            .sort();
        if (dates.length) {
            root.dateFrom = dates[0];
            root.dateTo = dates[dates.length - 1];
            root.periodLabel = formatMoneyFlowPeriodLabel(root.dateFrom, root.dateTo);
        }
    }

    return root;
}

function sortChildrenByLevel(node: MoneyFlowNode): void {
    if (!node.children?.length) {
        return;
    }
    node.children.sort((left, right) => {
        if (left.level !== right.level) {
            return left.level - right.level;
        }
        return (right.amount ?? 0) - (left.amount ?? 0);
    });
    for (const child of node.children) {
        sortChildrenByLevel(child);
    }
}

function buildMoneyFlowParams(filters: Partial<MoneyFlowFilterParams> & {
    customerId?: string;
    maxLevel?: number;
}) {
    return {
        ...(filters.customerId?.trim() && { customerId: filters.customerId.trim() }),
        ...(filters.cif?.trim() && { cif: filters.cif.trim() }),
        ...(filters.accountNumber?.trim() && { accountNumber: filters.accountNumber.trim() }),
        ...(filters.fromDate && { fromDate: filters.fromDate }),
        ...(filters.toDate && { toDate: filters.toDate }),
        maxLevel: filters.maxLevel ?? 3,
    };
}

function buildStats(rows: ApiMoneyFlowRow[]): MoneyFlowSearchResult['stats'] {
    const hops = rows.filter((row) => row.CapDo > 0);
    const accounts = new Set(rows.map((row) => row.SoTaiKhoan));
    const maxLevel = rows.reduce((max, row) => Math.max(max, row.CapDo), 0);

    return {
        relatedAccounts: accounts.size,
        totalTransactions: hops.length,
        totalFlowAmount: hops.reduce((sum, row) => sum + (row.SoTien ?? 0), 0),
        traceLevels: maxLevel + 1,
    };
}

export async function getMoneyFlowTrace(userId: string): Promise<MoneyFlowTrace | null> {
    const { fromDate, toDate } = getEffectiveAppDateRange();
    const { data } = await api.get<ApiMoneyFlowRow[]>(API_PATHS.reports.moneyFlow, {
        params: {
            customerId: userId,
            fromDate,
            toDate,
            maxLevel: 3,
        },
    });

    if (!data.length) return null;

    const root = buildFlowTree(data, userId);
    if (!root) return null;

    return { rootUserId: userId, root };
}

export async function searchMoneyFlow(filters: MoneyFlowFilterParams): Promise<MoneyFlowSearchResult> {
    const empty = { relatedAccounts: 0, totalTransactions: 0, totalFlowAmount: 0, traceLevels: 0 };

    const hasLookup = Boolean(
        filters.customerId?.trim()
        || filters.cif.trim()
        || filters.accountNumber.trim(),
    );
    if (!hasLookup) {
        return { trace: null, stats: empty, error: 'Vui lòng nhập Số CIF hoặc Số tài khoản.' };
    }

    const { data } = await api.get<ApiMoneyFlowRow[]>(API_PATHS.reports.moneyFlow, {
        params: buildMoneyFlowParams(filters),
    });

    if (!data.length) {
        return { trace: null, stats: empty, error: 'Không có dữ liệu truy vết cho tài khoản này.' };
    }

    const rootRow = data.find((row) => row.CapDo === 0) ?? data[0];
    const rootUserId = String(rootRow.MaKhachHang);
    const root = buildFlowTree(data, rootUserId);

    if (!root) {
        return { trace: null, stats: empty, error: 'Không tìm thấy tài khoản.' };
    }

    return {
        trace: { rootUserId, root },
        stats: buildStats(data),
        error: null,
    };
}
