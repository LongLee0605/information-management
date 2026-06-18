import api from '@/lib/api';
import type {
  BankAccountType,
  CifVerificationResult,
  CreateBankAccountInput,
  EnrichedBankAccount,
} from '@/types';

interface ApiAccount {
  MaTaiKhoan: number;
  MaKhachHang: number;
  HoTen: string;
  CIF: string;
  SoTaiKhoan: string;
  LoaiTaiKhoan: string;
  NganHang: string;
  SoDu: number;
  SoDuDongBang: number;
  TrangThai: string;
  SoDuKhaDung: number;
}

function mapAccountType(loai: string): BankAccountType {
  const map: Record<string, BankAccountType> = {
    payment: 'payment', savings: 'savings', debit: 'debit', overdraft: 'overdraft',
  };
  return map[loai?.toLowerCase()] ?? 'payment';
}

function mapAccount(row: ApiAccount): EnrichedBankAccount {
  return {
    id: String(row.MaTaiKhoan),
    userId: String(row.MaKhachHang),
    cif: row.CIF ?? row.SoTaiKhoan,
    accountNumber: row.SoTaiKhoan,
    accountType: mapAccountType(row.LoaiTaiKhoan),
    accountTypeLabel: row.LoaiTaiKhoan,
    balance: row.SoDu,
    frozenBalance: row.SoDuDongBang,
    status: row.TrangThai === 'hoat_dong' ? 'active' : 'inactive',
    bank: row.NganHang,
    bankBadgeClass: 'bg-orange-500 text-white',
    fullName: row.HoTen,
    avatar: '',
    availableBalance: row.SoDuKhaDung,
  };
}

export async function getAllCustomerBankAccounts(): Promise<EnrichedBankAccount[]> {
  const { data } = await api.get<ApiAccount[]>('/api/accounts');
  return data.map(mapAccount);
}

export async function getCustomerBankAccountsByUserId(userId: string): Promise<EnrichedBankAccount[]> {
  const { data } = await api.get<ApiAccount[]>('/api/accounts', {
    params: { customerId: userId },
  });
  return data.map(mapAccount);
}

export async function verifyCif(cif: string): Promise<CifVerificationResult> {
  const { data } = await api.get<ApiAccount[]>('/api/accounts', {
    params: { cif: cif.trim() },
  });
  if (!data.length) throw new Error('Không tìm thấy khách hàng với số CIF này.');
  const row = data[0];
  return {
    userId: String(row.MaKhachHang),
    cif: row.CIF ?? row.SoTaiKhoan,
    fullName: row.HoTen,
    phone: '',
  };
}

export async function createBankAccount(input: CreateBankAccountInput): Promise<EnrichedBankAccount> {
  const verification = await verifyCif(input.cif);
  const { data } = await api.post<ApiAccount>('/api/accounts', {
    customerId:     Number(verification.userId),
    cif:            verification.cif,
    accountType:    input.accountType,
    bank:           input.bankId ?? 'OCB',
    initialBalance: input.accountType === 'payment' ? 10_000_000 : 0,
  });
  return mapAccount(data);
}

export async function deleteBankAccount(accountId: string): Promise<void> {
  await api.patch(`/api/accounts/${accountId}/status`, { status: 'dong' });
}
