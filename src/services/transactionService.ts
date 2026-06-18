import api from '@/lib/api';
import type { PaymentMethod, TransactionType, TransactionWithUser } from '@/types';
import type { TransferDraft } from '@/utils/transferAccounts';

interface ApiTransaction {
  MaGiaoDich: number;
  MaTaiKhoan: number;
  MaKhachHang: number;
  HoTen: string;
  SoTaiKhoan: string;
  NganHang: string;
  LoaiGiaoDich: string;
  SoTien: number;
  NgayGiaoDich: string;
  MoTa: string | null;
  DanhMuc: string | null;
  PhuongThucThanhToan: string | null;
}

function mapTransaction(row: ApiTransaction): TransactionWithUser {
  return {
    id: String(row.MaGiaoDich),
    userId: String(row.MaKhachHang),
    date: row.NgayGiaoDich ? row.NgayGiaoDich.split('T')[0] : '',
    type: row.LoaiGiaoDich as TransactionType,
    amount: row.SoTien,
    description: row.MoTa ?? '',
    category: row.DanhMuc ?? '',
    method: (row.PhuongThucThanhToan as PaymentMethod) ?? 'Chuyển khoản',
    userFullName: row.HoTen,
  };
}

export async function getAllTransactions(): Promise<TransactionWithUser[]> {
  const { data } = await api.get<ApiTransaction[]>('/api/transactions');
  return data.map(mapTransaction);
}

export async function getTransactionsByUserId(userId: string): Promise<TransactionWithUser[]> {
  const { data } = await api.get<ApiTransaction[]>('/api/transactions', {
    params: { customerId: userId },
  });
  return data.map(mapTransaction);
}

export async function getTransactionById(id: string): Promise<TransactionWithUser | null> {
  try {
    const { data } = await api.get<ApiTransaction>(`/api/transactions/${id}`);
    return mapTransaction(data);
  } catch {
    return null;
  }
}

export async function createTransferTransaction(draft: TransferDraft): Promise<TransactionWithUser> {
  if (draft.sourceUserId === draft.recipientUserId) {
    throw new Error('Không thể chuyển khoản giữa các tài khoản của cùng khách hàng.');
  }

  const { data } = await api.post<ApiTransaction>('/api/transactions', {
    accountId:     Number(draft.sourceAccountId ?? draft.sourceUserId),
    type:          'debit',
    amount:        draft.amount,
    description:   `${draft.content} — Chuyển đến ${draft.recipientName} (${draft.bankName} ${draft.recipientAccount})`,
    category:      'Chuyển khoản',
    paymentMethod: 'Chuyển khoản',
  });

  await api.post('/api/transactions', {
    accountId:     Number(draft.recipientAccountId ?? draft.recipientUserId),
    type:          'credit',
    amount:        draft.amount,
    description:   `Nhận chuyển khoản từ ${draft.sourceUserName} (${draft.sourceAccountNumber})`,
    category:      'Chuyển khoản',
    paymentMethod: 'Chuyển khoản',
  });

  return mapTransaction(data);
}
