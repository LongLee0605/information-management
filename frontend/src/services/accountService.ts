import api, { API_PATHS } from '@/lib/api';
import type { BankAccountType, CifVerificationResult, CreateBankAccountInput, EnrichedBankAccount, } from '@/types';
import { clearApiAccountCache, setApiAccountCache } from '@/utils/apiAccountCache';
import { notifyDataChange } from '@/utils/dataChangeBus';
interface ApiAccount {
    MaTaiKhoan: number;
    MaKhachHang: number;
    HoTen: string;
    CIF?: string;
    DienThoai?: string;
    SoTaiKhoan: string;
    LoaiTaiKhoan: string;
    NhanLoaiTaiKhoan?: string;
    NganHang: string;
    SoDu?: number;
    SoDuHienTai?: number;
    SoDuDongBang: number;
    TrangThai: string;
    SoDuKhaDung: number;
}
function mapAccountType(loai: string): BankAccountType {
    const map: Record<string, BankAccountType> = {
        payment: 'payment', savings: 'savings',
    };
    return map[loai?.toLowerCase()] ?? 'payment';
}
function isActiveAccountStatus(status: string): boolean {
    return status === 'hoat_dong' || status === 'active';
}
function mapAccount(row: ApiAccount): EnrichedBankAccount {
    return {
        id: String(row.MaTaiKhoan),
        userId: String(row.MaKhachHang),
        cif: row.CIF ?? row.SoTaiKhoan,
        accountNumber: row.SoTaiKhoan,
        accountType: mapAccountType(row.LoaiTaiKhoan),
        accountTypeLabel: row.NhanLoaiTaiKhoan ?? row.LoaiTaiKhoan,
        balance: row.SoDuHienTai ?? row.SoDu ?? 0,
        frozenBalance: row.SoDuDongBang,
        status: isActiveAccountStatus(row.TrangThai) ? 'active' : 'inactive',
        bank: row.NganHang,
        bankBadgeClass: 'bg-orange-500 text-white',
        fullName: row.HoTen,
        avatar: '',
        availableBalance: row.SoDuKhaDung,
    };
}
async function fetchAccountsFromApi(params?: Record<string, string | number>): Promise<EnrichedBankAccount[]> {
    const { data } = await api.get<ApiAccount[]>(API_PATHS.accounts, {
        params: { pageSize: 200, ...params },
    });
    const accounts = data.map(mapAccount);
    if (!params) {
        setApiAccountCache(accounts);
    }
    return accounts;
}
export async function warmApiAccountCache(): Promise<void> {
    try {
        await fetchAccountsFromApi();
    }
    catch {
        clearApiAccountCache();
    }
}
export async function getAllCustomerBankAccounts(): Promise<EnrichedBankAccount[]> {
    return fetchAccountsFromApi();
}
export async function getCustomerBankAccountsByUserId(userId: string): Promise<EnrichedBankAccount[]> {
    return fetchAccountsFromApi({ customerId: userId });
}
export async function verifyCif(cif: string): Promise<CifVerificationResult> {
    const { data } = await api.get<ApiAccount[]>(API_PATHS.accounts, {
        params: { cif: cif.trim() },
    });
    if (!data.length)
        throw new Error('Không tìm thấy khách hàng với số CIF này.');
    const row = data[0];
    return {
        userId: String(row.MaKhachHang),
        cif: row.CIF ?? row.SoTaiKhoan,
        fullName: row.HoTen,
        phone: row.DienThoai ?? '',
    };
}
export async function createBankAccount(input: CreateBankAccountInput): Promise<EnrichedBankAccount> {
    const { data: matches } = await api.get<ApiAccount[]>(API_PATHS.accounts, {
        params: { cif: input.cif.trim() },
    });
    if (!matches.length) {
        throw new Error('Không tìm thấy khách hàng với số CIF này.');
    }
    const owner = matches[0];
    const { data } = await api.post<ApiAccount>(API_PATHS.accounts, {
        customerId: owner.MaKhachHang,
        cif: owner.CIF ?? owner.SoTaiKhoan,
        accountType: input.accountType,
        bank: input.bankId ?? 'OCB',
        initialBalance: input.accountType === 'payment' ? 10000000 : 0,
    });
    await warmApiAccountCache();
    notifyDataChange('accounts');
    return mapAccount(data);
}
export async function deleteBankAccount(accountId: string): Promise<void> {
    await api.patch(`${API_PATHS.accounts}/${accountId}/status`, { status: 'inactive' });
    await warmApiAccountCache();
    notifyDataChange('accounts');
}
export interface AccountLookup {
    userId: string;
    fullName: string;
    accountNumber: string;
}
export async function lookupAccountByNumber(accountNumber: string): Promise<AccountLookup | null> {
    const normalized = accountNumber.replace(/\D/g, '');
    if (!normalized)
        return null;
    const { data } = await api.get<ApiAccount[]>(API_PATHS.accounts, {
        params: { accountNumber: normalized, pageSize: 1 },
    });
    if (!data.length)
        return null;
    const row = data[0];
    return {
        userId: String(row.MaKhachHang),
        fullName: row.HoTen,
        accountNumber: row.SoTaiKhoan,
    };
}
