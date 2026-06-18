import { getAppEnv, loadAppEnv } from './load-env.js';
loadAppEnv();
const mode = getAppEnv();
const BASE_URL = `http://localhost:${process.env.API_PORT || 3001}`;
const ENDPOINTS = [
    '/api/health',
    '/api/customers?pageSize=1',
    '/api/accounts?pageSize=1',
    '/api/transactions?pageSize=1',
    '/api/reports/overview?fromDate=2025-01-01&toDate=2025-12-31',
];
async function checkEndpoint(path) {
    const url = `${BASE_URL}${path}`;
    const start = Date.now();
    try {
        const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
        const body = await response.text();
        const ms = Date.now() - start;
        return {
            path,
            ok: response.ok,
            status: response.status,
            ms,
            preview: body.slice(0, 120),
        };
    }
    catch (error) {
        return {
            path,
            ok: false,
            status: 0,
            ms: Date.now() - start,
            preview: error instanceof Error ? error.message : String(error),
        };
    }
}
async function main() {
    console.log(`\nKiểm tra API [${mode}] tại ${BASE_URL}\n`);
    let failed = 0;
    for (const path of ENDPOINTS) {
        const result = await checkEndpoint(path);
        const icon = result.ok ? '✓' : '✗';
        console.log(`${icon} ${result.path}`);
        console.log(`  ${result.status || 'ERR'} · ${result.ms}ms`);
        console.log(`  ${result.preview}\n`);
        if (!result.ok) {
            failed += 1;
        }
    }
    if (failed > 0) {
        console.error(`Thất bại ${failed}/${ENDPOINTS.length} endpoint.`);
        process.exit(1);
    }
    console.log('Tất cả endpoint hoạt động bình thường.');
}
main();
