import { loadAppEnv } from './load-env.js';
import sql from 'mssql';
loadAppEnv();
const BASE_URL = `http://localhost:${process.env.API_PORT || 3001}`;
function getDbConfig() {
    return {
        server: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 1433,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'QLTT',
        options: {
            encrypt: process.env.DB_ENCRYPT === 'true',
            trustServerCertificate: process.env.DB_TRUST_SERVER_CERT !== 'false',
        },
    };
}
async function fetchJson(path) {
    const response = await fetch(`${BASE_URL}${path}`, { signal: AbortSignal.timeout(15000) });
    const text = await response.text();
    if (!response.ok) {
        throw new Error(`${path} → ${response.status}: ${text.slice(0, 120)}`);
    }
    return JSON.parse(text);
}
function pass(label) {
    console.log(`  ✓ ${label}`);
}
function fail(label, detail) {
    console.log(`  ✗ ${label}`);
    if (detail)
        console.log(`    ${detail}`);
}
async function main() {
    console.log('\n═══ QLTT — Kiểm tra Database ↔ API ═══\n');
    let pool;
    let errors = 0;
    try {
        pool = await sql.connect(getDbConfig());
        pass(`Kết nối SQL ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
    }
    catch (error) {
        fail('Kết nối SQL', error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
    try {
        await fetchJson('/api/health');
        pass(`API health ${BASE_URL}/api/health`);
    }
    catch (error) {
        fail('API health', error instanceof Error ? error.message : String(error));
        errors += 1;
    }
    const dbCounts = (await pool.request().query(`
    SELECT
      (SELECT COUNT(*) FROM dbo.KhachHang) AS customers,
      (SELECT COUNT(*) FROM dbo.TaiKhoan) AS accounts,
      (SELECT COUNT(*) FROM dbo.GiaoDich) AS transactions
  `)).recordset[0];
    console.log('\n── Số lượng bản ghi ──');
    const checks = [
        ['customers', dbCounts.customers],
        ['accounts', dbCounts.accounts],
        ['transactions', dbCounts.transactions],
    ];
    for (const [name, db] of checks) {
        pass(`${name}: SQL=${db}`);
    }
    console.log('\n── API list endpoints ──');
    try {
        const [customers, accounts, transactions] = await Promise.all([
            fetchJson('/api/customers?pageSize=500'),
            fetchJson('/api/accounts?pageSize=500'),
            fetchJson('/api/transactions?pageSize=500'),
        ]);
        if (customers.length === dbCounts.customers) {
            pass(`GET /api/customers → ${customers.length} khách hàng`);
        }
        else {
            fail(`GET /api/customers → ${customers.length} (SQL: ${dbCounts.customers})`);
            errors += 1;
        }
        if (accounts.length === dbCounts.accounts) {
            pass(`GET /api/accounts → ${accounts.length} tài khoản`);
        }
        else {
            fail(`GET /api/accounts → ${accounts.length} (SQL: ${dbCounts.accounts})`);
            errors += 1;
        }
        if (transactions.length === dbCounts.transactions) {
            pass(`GET /api/transactions → ${transactions.length} giao dịch`);
        }
        else {
            fail(`GET /api/transactions → ${transactions.length} (SQL: ${dbCounts.transactions})`);
            errors += 1;
        }
        const sampleCustomerId = 1;
        if (sampleCustomerId) {
            const monthly = await fetchJson(`/api/reports/monthly-chart?customerId=${sampleCustomerId}&year=2025`);
            const hasIncome = monthly.some((row) => (row.TongThu ?? row.TongThuNhap ?? 0) > 0);
            const hasExpense = monthly.some((row) => (row.TongChi ?? row.TongChiTieu ?? 0) > 0);
            if (monthly.length > 0 && (hasIncome || hasExpense)) {
                pass(`Reports monthly-chart (KH #${sampleCustomerId}) → ${monthly.length} tháng có dữ liệu`);
            }
            else {
                fail(`Reports monthly-chart (KH #${sampleCustomerId}) → không có thu/chi`);
                errors += 1;
            }
            const pie = await fetchJson(`/api/reports/pie-chart?customerId=${sampleCustomerId}&transactionType=debit&fromDate=2025-01-01&toDate=2025-12-31`);
            const hasPie = pie.some((row) => (row.TongTien ?? row.TongSoTien ?? 0) > 0);
            if (pie.length > 0 && hasPie) {
                pass(`Reports pie-chart (KH #${sampleCustomerId}) → ${pie.length} danh mục`);
            }
            else {
                fail(`Reports pie-chart (KH #${sampleCustomerId}) → không có dữ liệu`);
                errors += 1;
            }
        }
    }
    catch (error) {
        fail('API list endpoints', error instanceof Error ? error.message : String(error));
        errors += 1;
    }
    console.log('\n── Mẫu khách hàng đầu tiên ──');
    const sample = (await pool.request().query('SELECT TOP 1 * FROM dbo.KhachHang ORDER BY MaKhachHang')).recordset[0];
    if (sample) {
        console.log(`  MaKhachHang=${sample.MaKhachHang}, HoTen=${sample.HoTen}, CCCD=${sample.CCCD}`);
    }
    await pool.close();
    console.log('\n' + '═'.repeat(40));
    if (errors === 0) {
        console.log('Kết quả: TẤT CẢ KIỂM TRA ĐẠT ✓\n');
    }
    else {
        console.log(`Kết quả: ${errors} lỗi — cần xem lại API/SQL\n`);
        process.exit(1);
    }
}
main().catch((error) => {
    console.error(error);
    process.exit(1);
});
