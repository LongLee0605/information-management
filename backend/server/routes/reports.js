import { Router } from 'express';
import { sql } from '../db.js';
const router = Router();
router.get('/', (_req, res) => {
    res.json({
        overview: '/api/reports/overview',
        monthlyChart: '/api/reports/monthly-chart',
        pieChart: '/api/reports/pie-chart',
        moneyFlow: '/api/reports/money-flow',
    });
});
router.get('/overview', async (req, res) => {
    try {
        const { fromDate, toDate } = req.query;
        const result = await req.pool.request()
            .input('TuNgay', sql.Date, fromDate || null)
            .input('DenNgay', sql.Date, toDate || null)
            .execute('SP_BaoCao_TongQuan');
        res.json({
            summary: result.recordsets[0]?.[0] || {},
            periodActivity: result.recordsets[1]?.[0] || {},
            topCategories: result.recordsets[2] || [],
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/monthly-chart', async (req, res) => {
    try {
        const { customerId, year } = req.query;
        const result = await req.pool.request()
            .input('MaKhachHang', sql.Int, customerId ? Number(customerId) : null)
            .input('Nam', sql.Int, year ? Number(year) : null)
            .execute('SP_BaoCao_BieuDoTheoThang');
        res.json(result.recordset);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/pie-chart', async (req, res) => {
    try {
        const { customerId, transactionType = 'debit', fromDate, toDate } = req.query;
        const result = await req.pool.request()
            .input('MaKhachHang', sql.Int, customerId ? Number(customerId) : null)
            .input('LoaiGiaoDich', sql.VarChar(10), transactionType)
            .input('TuNgay', sql.Date, fromDate || null)
            .input('DenNgay', sql.Date, toDate || null)
            .execute('SP_BaoCao_PieChart');
        res.json(result.recordset);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/money-flow', async (req, res) => {
    try {
        let { customerId, accountId, cif, accountNumber, fromDate, toDate, amountThreshold, maxLevel } = req.query;
        const hasLookup = Boolean(
            customerId || accountId || (cif && String(cif).trim()) || (accountNumber && String(accountNumber).trim()),
        );
        if (!hasLookup) {
            res.json({
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
                data: [],
            });
            return;
        }
        if (!customerId && !accountId && (cif || accountNumber)) {
            const lookupKey = String(accountNumber || cif).trim();
            const lookup = await req.pool.request()
                .input('Lookup', sql.VarChar(20), lookupKey)
                .query(`
          SELECT TOP 1 MaTaiKhoan, MaKhachHang
          FROM dbo.TaiKhoan
          WHERE SoTaiKhoan = @Lookup OR CIF = @Lookup
          ORDER BY LaTaiKhoanChinh DESC, MaTaiKhoan
        `);
            if (lookup.recordset.length) {
                accountId = lookup.recordset[0].MaTaiKhoan;
                customerId = lookup.recordset[0].MaKhachHang;
            }
        }
        const result = await req.pool.request()
            .input('MaKhachHang', sql.Int, customerId ? Number(customerId) : null)
            .input('MaTaiKhoan', sql.Int, accountId ? Number(accountId) : null)
            .input('CIFGoc', sql.VarChar(20), cif ? String(cif).trim() : null)
            .input('SoTaiKhoan', sql.VarChar(20), accountNumber ? String(accountNumber).trim() : null)
            .input('TuNgay', sql.Date, fromDate || null)
            .input('DenNgay', sql.Date, toDate || null)
            .input('MaxLevel', sql.Int, maxLevel ? Number(maxLevel) : 3)
            .input('SoTienNguong', sql.Decimal(18, 2), amountThreshold ? Number(amountThreshold) : null)
            .execute('SP_TruyVetDongTien');
        res.json(result.recordset);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
export default router;
