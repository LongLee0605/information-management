export const APP_MODE = import.meta.env.MODE;
export const IS_DEV = import.meta.env.DEV;
export const IS_PROD = import.meta.env.PROD;
const apiUrl = import.meta.env.VITE_API_URL?.trim() ?? '';
export function resolveApiBaseUrl(): string {
    if (IS_DEV) {
        return '';
    }
    if (!apiUrl) {
        return '';
    }
    return apiUrl.replace(/\/$/, '');
}
