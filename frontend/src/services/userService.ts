import api, { API_PATHS } from '@/lib/api';
import type { CreateUserInput, CreateUserResult, Gender, User } from '@/types';
import { getApiCifFromUserId } from '@/utils/apiAccountCache';
import { notifyDataChange } from '@/utils/dataChangeBus';
import { warmApiAccountCache } from '@/services/accountService';

interface ApiCustomer {
  MaKhachHang: number;
  HoTen: string;
  CCCD: string;
  NgaySinh: string;
  GioiTinh: string;
  DienThoai: string | null;
  Email: string | null;
  DiaChi: string | null;
  NoiLamViec: string | null;
  TinhTrangHonNhan: string | null;
  HocVan: string | null;
  ThuNhapTBThang: number | null;
}

function mapUser(row: ApiCustomer): User {
  return {
    id: String(row.MaKhachHang),
    avatar: '',
    fullName: row.HoTen,
    citizenId: row.CCCD,
    dateOfBirth: row.NgaySinh ? row.NgaySinh.split('T')[0] : '',
    gender: (row.GioiTinh as Gender) ?? 'male',
    phone: row.DienThoai ?? '',
    email: row.Email ?? '',
    address: row.DiaChi ?? '',
    workplace: row.NoiLamViec ?? '—',
    maritalStatus: row.TinhTrangHonNhan ?? '—',
    education: row.HocVan ?? '—',
    monthlyIncomeAvg: row.ThuNhapTBThang ?? 0,
  };
}

export async function getUsers(): Promise<User[]> {
  await warmApiAccountCache();
  const { data } = await api.get<ApiCustomer[]>(API_PATHS.customers, {
    params: { pageSize: 100 },
  });
  return data.map(mapUser);
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const { data } = await api.get<ApiCustomer>(`${API_PATHS.customers}/${id}`);
    return mapUser(data);
  } catch {
    return null;
  }
}

export async function createUser(input: CreateUserInput): Promise<CreateUserResult> {
  const { data } = await api.post<ApiCustomer>(API_PATHS.customers, {
    fullName:    input.fullName,
    citizenId:   input.citizenId,
    dateOfBirth: input.dateOfBirth,
    gender:      input.gender,
    address:     input.address,
  });
  const user = mapUser(data);
  await warmApiAccountCache();
  notifyDataChange('users');
  const cif = getApiCifFromUserId(user.id) ?? user.id;
  return { user, cif };
}

export async function deleteUser(userId: string): Promise<void> {
  await api.delete(`${API_PATHS.customers}/${userId}`);
  notifyDataChange('users');
}
