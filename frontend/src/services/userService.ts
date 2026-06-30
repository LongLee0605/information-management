import api, { API_PATHS } from '@/lib/api';
import type { CreateUserInput, CreateUserResult, CustomerTier, Gender, UpdateUserInput, User } from '@/types';
import { getApiCifFromUserId, getApiUserIdFromCif } from '@/utils/apiAccountCache';
import { resolveUserIdFromRouteParam } from '@/utils/userRoute';
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
    CIF?: string | null;
    PhanHang?: CustomerTier | null;
}
interface ApiAccountLookup {
    MaKhachHang: number;
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
        tier: row.PhanHang ?? null,
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
    }
    catch {
        return null;
    }
}
export async function resolveCustomerIdFromRouteParam(routeParam: string): Promise<string | null> {
    const trimmed = routeParam.trim();
    if (!trimmed) {
        return null;
    }
    await warmApiAccountCache();
    const fromCache = getApiUserIdFromCif(trimmed);
    if (fromCache) {
        return fromCache;
    }
    const syncId = resolveUserIdFromRouteParam(trimmed);
    if (syncId) {
        const user = await getUserById(syncId);
        if (user) {
            return syncId;
        }
    }
    try {
        const { data } = await api.get<ApiAccountLookup[]>(API_PATHS.accounts, {
            params: { cif: trimmed, pageSize: 1 },
        });
        if (data.length) {
            return String(data[0].MaKhachHang);
        }
    }
    catch {
        return null;
    }
    return null;
}
export async function createUser(input: CreateUserInput): Promise<CreateUserResult> {
    const { data } = await api.post<ApiCustomer>(API_PATHS.customers, {
        fullName: input.fullName,
        citizenId: input.citizenId,
        dateOfBirth: input.dateOfBirth,
        gender: input.gender,
        address: input.address,
    });
    const user = mapUser(data);
    await warmApiAccountCache();
    notifyDataChange('users');
    const cif = data.CIF?.trim() || getApiCifFromUserId(user.id) || user.id;
    return { user, cif };
}

function toUpdatePayload(input: UpdateUserInput) {
    return {
        fullName: input.fullName.trim(),
        citizenId: input.citizenId,
        dateOfBirth: input.dateOfBirth,
        gender: input.gender,
        phone: input.phone.trim() || null,
        email: input.email.trim() || null,
        address: input.address.trim() || null,
        workplace: input.workplace.trim() || null,
        maritalStatus: input.maritalStatus.trim() || null,
        education: input.education.trim() || null,
        monthlyIncome: input.monthlyIncomeAvg > 0 ? input.monthlyIncomeAvg : null,
    };
}

export async function updateUser(userId: string, input: UpdateUserInput): Promise<User> {
    const { data } = await api.put<ApiCustomer>(`${API_PATHS.customers}/${userId}`, toUpdatePayload(input));
    await warmApiAccountCache();
    notifyDataChange('users');
    return mapUser(data);
}
export async function deleteUser(userId: string): Promise<void> {
    await api.delete(`${API_PATHS.customers}/${userId}`);
    notifyDataChange('users');
}
