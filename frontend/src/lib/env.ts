/** Vite mode: development | production (từ --mode hoặc build) */
export const APP_MODE = import.meta.env.MODE;

export const IS_DEV = import.meta.env.DEV;
export const IS_PROD = import.meta.env.PROD;

const apiUrl = import.meta.env.VITE_API_URL?.trim() ?? '';

/**
 * Dev: baseURL rỗng → request `/api/*` qua Vite proxy (không CORS).
 * Prod: gọi thẳng VITE_API_URL (backend phải bật CORS cho origin FE).
 */
export function resolveApiBaseUrl(): string {
  if (IS_DEV) {
    return '';
  }

  if (!apiUrl) {
    console.error(
      '[QLTT] Thiếu VITE_API_URL trong .env.production. Chạy: copy .env.production.example .env.production rồi npm run build',
    );
    return 'http://localhost:3001';
  }

  return apiUrl.replace(/\/$/, '');
}

if (IS_DEV) {
  console.info(`[QLTT] FE development · proxy → ${apiUrl || 'http://localhost:3001'}`);
} else {
  console.info(`[QLTT] FE production · API → ${resolveApiBaseUrl()}`);
}
