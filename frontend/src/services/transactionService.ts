import api, { API_PATHS } from '@/lib/api';
import type { PaymentMethod, TransactionType, TransactionWithUser } from '@/types';
import { notifyDataChanges } from '@/utils/dataChangeBus';
import type { TransferDraft } from '@/utils/transferAccounts';
interface ApiTransaction {
    MaGiaoDich: number;
    MaTaiKhoan: number;
    MaKhachHang: number;
    HoTen: string;
    SoTaiKhoan: string;
    NganHang: string;
    LoaiGiaoDich: string;
    TenLoaiGiaoDich?: string | null;
    SoTien: number;
    NgayGiaoDich: string;
    MoTa: string | null;
    DanhMuc: string | null;
    PhuongThucThanhToan: string | null;
}
interface ApiAccount {
    MaTaiKhoan: number;
}
function mapTransaction(row: ApiTransaction): TransactionWithUser {
    return {
        id: String(row.MaGiaoDich),
        userId: String(row.MaKhachHang),
        date: row.NgayGiaoDich ? row.NgayGiaoDich.split('T')[0] : '',
        type: row.LoaiGiaoDich as TransactionType,
        typeLabel: row.TenLoaiGiaoDich ?? undefined,
        amount: row.SoTien,
        description: row.MoTa ?? '',
        category: row.DanhMuc ?? '',
        method: (row.PhuongThucThanhToan as PaymentMethod) ?? 'Chuyển khoản',
        userFullName: row.HoTen,
    };
}
export async function getAllTransactions(): Promise<TransactionWithUser[]> {
    const { data } = await api.get<ApiTransaction[]>(API_PATHS.transactions, {
        params: { pageSize: 500 },
    });
    return data.map(mapTransaction);
}
export async function getTransactionsByUserId(userId: string): Promise<TransactionWithUser[]> {
    const { data } = await api.get<ApiTransaction[]>(API_PATHS.transactions, {
        params: { customerId: userId, pageSize: 500 },
    });
    return data.map(mapTransaction);
}
export async function getTransactionById(id: string): Promise<TransactionWithUser | null> {
    try {
        const { data } = await api.get<ApiTransaction>(`${API_PATHS.transactions}/${id}`);
        return mapTransaction(data);
    }
    catch {
        return null;
    }
}
export async function createTransferTransaction(draft: TransferDraft): Promise<TransactionWithUser> {
    if (draft.sourceUserId === draft.recipientUserId) {
        throw new Error('Không thể chuyển khoản giữa các tài khoản của cùng khách hàng.');
    }
    const sourceAccountId = await resolveAccountId(draft.sourceAccountNumber);
    const recipientAccountId = await resolveAccountId(draft.recipientAccount);
    const { data } = await api.post<ApiTransaction>(API_PATHS.transactions, {
        accountId: sourceAccountId,
        type: 'debit',
        amount: draft.amount,
        description: `${draft.content} — Chuyển đến ${draft.recipientName} (${draft.bankName} ${draft.recipientAccount})`,
        category: 'Chuyển khoản',
        paymentMethod: 'Chuyển khoản',
        destinationAccountId: recipientAccountId,
    });
    await api.post(API_PATHS.transactions, {
        accountId: recipientAccountId,
        type: 'credit',
        amount: draft.amount,
        description: `Nhận chuyển khoản từ ${draft.sourceUserName} (${draft.sourceAccountNumber})`,
        category: 'Chuyển khoản',
        paymentMethod: 'Chuyển khoản',
    });
    notifyDataChanges('transactions', 'accounts');
    return mapTransaction(data);
}
async function resolveAccountId(accountNumber: string): Promise<number> {
    const normalized = accountNumber.replace(/\D/g, '');
    const { data } = await api.get<ApiAccount[]>(API_PATHS.accounts, {
        params: { accountNumber: normalized, pageSize: 1 },
    });
    if (!data.length) {
        throw new Error(`Không tìm thấy tài khoản ${accountNumber}`);
    }
    return data[0].MaTaiKhoan;
}
