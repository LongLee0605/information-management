import axios, { isAxiosError } from 'axios';
import { markApiDegraded, markApiOffline, markApiOnline, } from '@/lib/apiStatus';
import { resolveApiBaseUrl } from '@/lib/env';
export const API_BASE_URL = resolveApiBaseUrl();
export const API_PATHS = {
    health: '/api/health',
    customers: '/api/customers',
    accounts: '/api/accounts',
    transactions: '/api/transactions',
    reports: {
        monthlyChart: '/api/reports/monthly-chart',
        pieChart: '/api/reports/pie-chart',
        moneyFlow: '/api/reports/money-flow',
        overview: '/api/reports/overview',
    },
} as const;
export function formatApiError(error: unknown): string {
    if (isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
            return 'API không phản hồi (timeout). Kiểm tra backend đang chạy.';
        }
        if (!error.response) {
            return import.meta.env.PROD
                ? 'Không kết nối được API. Kiểm tra backend đang chạy.'
                : 'Không kết nối được backend. Chạy: cd backend && npm run be';
        }
        const data = error.response.data as {
            error?: string;
            message?: string;
        } | undefined;
        return data?.error ?? data?.message ?? error.message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'Lỗi kết nối API không xác định';
}
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
});
api.interceptors.response.use((res) => {
    markApiOnline();
    return res;
}, (err) => Promise.reject(new Error(formatApiError(err))));
export interface ApiHealthResult {
    status: 'ok' | 'error' | 'offline';
    db?: string;
    message?: string;
    latencyMs: number;
}
export async function checkApiHealth(): Promise<ApiHealthResult> {
    const start = Date.now();
    try {
        const { data } = await api.get<{
            status: string;
            db?: string;
            message?: string;
        }>(API_PATHS.health, { timeout: 5000 });
        const latencyMs = Date.now() - start;
        if (data.status === 'ok') {
            markApiOnline(data.db ?? null, latencyMs);
            return { status: 'ok', db: data.db, latencyMs };
        }
        const message = data.message ?? 'Database không sẵn sàng';
        markApiDegraded(message);
        return { status: 'error', db: data.db, message, latencyMs };
    }
    catch (error) {
        const latencyMs = Date.now() - start;
        const message = formatApiError(error);
        markApiOffline(message);
        return { status: 'offline', message, latencyMs };
    }
}
export default api;
