import { Router } from 'express';
import { sql } from '../db.js';
import { ensureRecordset, parsePositiveInt, sendApiDocs, wantsApiDocs } from '../utils/http.js';

const router = Router();

router.get('/', (_req, res) => {
    res.json({
        overview: '/api/reports/overview',
        monthlyChart: '/api/reports/monthly-chart',
        pieChart: '/api/reports/pie-chart',
        moneyFlow: '/api/reports/money-flow',
        docs: 'Thêm ?docs=1 vào sub-route để xem hướng dẫn tham số',
    });
});

router.get('/overview', async (req, res) => {
    try {
        if (wantsApiDocs(req)) {
            sendApiDocs(res, {
                message: 'Báo cáo tổng quan hệ thống',
                example: '/api/reports/overview?fromDate=2025-01-01&toDate=2025-12-31',
                params: {
                    fromDate: 'YYYY-MM-DD (tùy chọn)',
                    toDate: 'YYYY-MM-DD (tùy chọn)',
                    cif: 'Lọc theo CIF (tùy chọn, NULL = toàn hệ thống)',
                },
            });
            return;
        }
        const { fromDate, toDate, cif } = req.query;
        const result = await req.pool.request()
            .input('TuNgay', sql.DateTime, fromDate || null)
            .input('DenNgay', sql.DateTime, toDate || null)
            .input('CIF', sql.VarChar(20), typeof cif === 'string' && cif.trim() ? cif.trim() : null)
            .execute('SP_BaoCao_TongQuan');
        res.json(result.recordset[0] || {});
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/monthly-chart', async (req, res) => {
    try {
        const { customerId, year } = req.query;
        if (wantsApiDocs(req) || !customerId) {
            sendApiDocs(res, {
                message: 'Biểu đồ thu chi theo tháng — cần customerId',
                example: '/api/reports/monthly-chart?customerId=1&year=2025',
                params: {
                    customerId: 'MaKhachHang (bắt buộc)',
                    year: 'Năm, ví dụ 2025 (tùy chọn)',
                },
            });
            return;
        }
        const parsedCustomerId = parsePositiveInt(customerId);
        if (parsedCustomerId === null) {
            res.status(400).json({ error: 'customerId phải là số nguyên dương.' });
            return;
        }
        const result = await req.pool.request()
            .input('MaKhachHang', sql.Int, parsedCustomerId)
            .input('Nam', sql.Int, year ? Number(year) : null)
            .execute('SP_BaoCao_BieuDoTheoThang');
        res.json(ensureRecordset(result.recordset));
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/pie-chart', async (req, res) => {
    try {
        const { customerId, transactionType = 'debit', fromDate, toDate } = req.query;
        if (wantsApiDocs(req) || !customerId) {
            sendApiDocs(res, {
                message: 'Biểu đồ phân bổ theo danh mục — cần customerId',
                example: '/api/reports/pie-chart?customerId=1&transactionType=debit&fromDate=2025-01-01&toDate=2025-12-31',
                params: {
                    customerId: 'MaKhachHang (bắt buộc)',
                    transactionType: 'credit | debit (mặc định debit)',
                    fromDate: 'YYYY-MM-DD (tùy chọn)',
                    toDate: 'YYYY-MM-DD (tùy chọn)',
                },
            });
            return;
        }
        const parsedCustomerId = parsePositiveInt(customerId);
        if (parsedCustomerId === null) {
            res.status(400).json({ error: 'customerId phải là số nguyên dương.' });
            return;
        }
        const result = await req.pool.request()
            .input('MaKhachHang', sql.Int, parsedCustomerId)
            .input('LoaiGiaoDich', sql.VarChar(10), transactionType)
            .input('TuNgay', sql.Date, fromDate || null)
            .input('DenNgay', sql.Date, toDate || null)
            .execute('SP_BaoCao_PieChart');
        res.json(ensureRecordset(result.recordset));
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/money-flow', async (req, res) => {
    try {
        let { customerId, accountId, cif, accountNumber, fromDate, toDate, amountThreshold, maxLevel } = req.query;
        const trimmedCif = cif ? String(cif).trim() : '';
        const trimmedAccount = accountNumber ? String(accountNumber).trim() : '';
        const hasLookup = Boolean(
            customerId || accountId || trimmedCif || trimmedAccount,
        );

        if (wantsApiDocs(req) || !hasLookup) {
            sendApiDocs(res, {
                message: 'Truy vết dòng tiền — cần ít nhất một tham số: cif, accountNumber, customerId hoặc accountId',
                example: '/api/reports/money-flow?cif=26410052&accountNumber=01234567890&fromDate=2025-01-01&toDate=2025-12-31&maxLevel=3',
                params: {
                    cif: 'Số CIF tài khoản F0',
                    accountNumber: 'Số tài khoản F0',
                    customerId: 'Mã khách hàng (MaKhachHang)',
                    accountId: 'Mã tài khoản (MaTaiKhoan)',
                    fromDate: 'YYYY-MM-DD',
                    toDate: 'YYYY-MM-DD',
                    maxLevel: '1-5, mặc định 3',
                    amountThreshold: 'Số tiền tối thiểu',
                },
            });
            return;
        }

        if (customerId) {
            const parsedCustomerId = parsePositiveInt(customerId);
            if (parsedCustomerId === null) {
                res.status(400).json({ error: 'customerId phải là số nguyên dương.' });
                return;
            }
            customerId = String(parsedCustomerId);
        }

        if (accountId) {
            const parsedAccountId = parsePositiveInt(accountId);
            if (parsedAccountId === null) {
                res.status(400).json({ error: 'accountId phải là số nguyên dương.' });
                return;
            }
            accountId = String(parsedAccountId);
        }

        if (!customerId && !accountId && (trimmedCif || trimmedAccount)) {
            const lookupKey = trimmedAccount || trimmedCif;
            const lookup = await req.pool.request()
                .input('Lookup', sql.VarChar(20), lookupKey)
                .query(`
          SELECT TOP 1 MaTaiKhoan, MaKhachHang
          FROM dbo.TaiKhoan
          WHERE SoTaiKhoan = @Lookup OR CIF = @Lookup
          ORDER BY LaTaiKhoanChinh DESC, MaTaiKhoan
        `);
            if (lookup.recordset.length) {
                accountId = String(lookup.recordset[0].MaTaiKhoan);
                customerId = String(lookup.recordset[0].MaKhachHang);
            }
        }

        const result = await req.pool.request()
            .input('MaKhachHang', sql.Int, customerId ? Number(customerId) : null)
            .input('MaTaiKhoan', sql.Int, accountId ? Number(accountId) : null)
            .input('CIFGoc', sql.VarChar(20), trimmedCif || null)
            .input('SoTaiKhoan', sql.VarChar(20), trimmedAccount || null)
            .input('TuNgay', sql.Date, fromDate || null)
            .input('DenNgay', sql.Date, toDate || null)
            .input('MaxLevel', sql.Int, maxLevel ? Number(maxLevel) : 3)
            .input('SoTienNguong', sql.Decimal(18, 2), amountThreshold ? Number(amountThreshold) : null)
            .execute('SP_TruyVetDongTien');

        res.json(ensureRecordset(result.recordset));
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
