import { getAppEnv, loadAppEnv } from './load-env.js';

loadAppEnv();

const mode = getAppEnv();
const BASE_URL = `http://localhost:${process.env.API_PORT || 3001}`;

const ENDPOINTS = [
    { path: '/api/health', expectOk: true, expectJson: true, minBody: 10 },
    { path: '/api/customers?pageSize=1', expectOk: true, expectJson: true, expectArray: true },
    { path: '/api/accounts?pageSize=1', expectOk: true, expectJson: true, expectArray: true },
    { path: '/api/transactions?pageSize=1', expectOk: true, expectJson: true, expectArray: true },
    { path: '/api/reports/overview?fromDate=2025-01-01&toDate=2025-12-31', expectOk: true, expectJson: true, minBody: 10 },
    { path: '/api/reports/monthly-chart?customerId=1&year=2025', expectOk: true, expectJson: true, expectArray: true },
    { path: '/api/reports/pie-chart?customerId=1&fromDate=2025-01-01&toDate=2025-12-31', expectOk: true, expectJson: true, expectArray: true },
    { path: '/api/reports/money-flow?cif=26410052&fromDate=2025-01-01&toDate=2026-06-19', expectOk: true, expectJson: true, expectArray: true },
    { path: '/api/reports/money-flow?cif=INVALID', expectOk: true, expectJson: true, expectArray: true },
    { path: '/api/reports/money-flow', expectOk: true, expectJson: true, minBody: 10 },
    { path: '/api/reports/monthly-chart', expectOk: true, expectJson: true, minBody: 10 },
    { path: '/api/customers?pageSize=0', expectOk: true, expectJson: true, expectArray: true },
    { path: '/api/customers?page=-1', expectOk: true, expectJson: true, expectArray: true },
    { path: '/api/customers/abc', expectOk: false, expectStatus: 400, expectJson: true, minBody: 5 },
    { path: '/api/customers/99999', expectOk: false, expectStatus: 404, expectJson: true, minBody: 5 },
    { path: '/api/not-exist', expectOk: false, expectStatus: 404, expectJson: true, minBody: 5 },
];

async function checkEndpoint(spec) {
    const url = `${BASE_URL}${spec.path}`;
    const start = Date.now();
    try {
        const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
        const body = await response.text();
        const ms = Date.now() - start;
        let parsed;
        try {
            parsed = JSON.parse(body);
        }
        catch {
            parsed = null;
        }

        const issues = [];
        if (spec.expectOk !== undefined && response.ok !== spec.expectOk) {
            issues.push(`status ${response.status} (expected ok=${spec.expectOk})`);
        }
        if (spec.expectStatus !== undefined && response.status !== spec.expectStatus) {
            issues.push(`status ${response.status} (expected ${spec.expectStatus})`);
        }
        if (spec.expectJson && parsed === null) {
            issues.push('body is not valid JSON');
        }
        if (spec.minBody !== undefined && body.length < spec.minBody) {
            issues.push(`blank/short body (${body.length} bytes)`);
        }
        if (spec.expectArray && !Array.isArray(parsed)) {
            issues.push('expected JSON array');
        }

        return {
            path: spec.path,
            ok: issues.length === 0,
            status: response.status,
            ms,
            issues,
            preview: body.slice(0, 120),
        };
    }
    catch (error) {
        return {
            path: spec.path,
            ok: false,
            status: 0,
            ms: Date.now() - start,
            issues: [error instanceof Error ? error.message : String(error)],
            preview: '',
        };
    }
}

async function main() {
    console.log(`\nKiểm tra API [${mode}] tại ${BASE_URL}\n`);
    let failed = 0;

    for (const spec of ENDPOINTS) {
        const result = await checkEndpoint(spec);
        const icon = result.ok ? '✓' : '✗';
        console.log(`${icon} ${result.path}`);
        console.log(`  ${result.status || 'ERR'} · ${result.ms}ms`);
        if (result.issues.length) {
            console.log(`  ${result.issues.join('; ')}`);
        }
        console.log(`  ${result.preview}\n`);
        if (!result.ok) {
            failed += 1;
        }
    }

    if (failed > 0) {
        console.error(`Thất bại ${failed}/${ENDPOINTS.length} endpoint.`);
        process.exit(1);
    }
    console.log(`Tất cả ${ENDPOINTS.length} endpoint hoạt động bình thường.`);
}

main();
