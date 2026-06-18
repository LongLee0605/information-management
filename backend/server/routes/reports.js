import { Router } from 'express';
import { sql } from '../db.js';

const router = Router();

// GET /api/reports/overview?fromDate=&toDate=
router.get('/overview', async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    const result = await req.pool.request()
      .input('TuNgay',  sql.Date, fromDate || null)
      .input('DenNgay', sql.Date, toDate   || null)
      .execute('SP_BaoCao_TongQuan');
    res.json({
      summary:        result.recordsets[0]?.[0] || {},
      periodActivity: result.recordsets[1]?.[0] || {},
      topCategories:  result.recordsets[2]       || [],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/monthly-chart?customerId=&year=
router.get('/monthly-chart', async (req, res) => {
  try {
    const { customerId, year } = req.query;
    const result = await req.pool.request()
      .input('MaKhachHang', sql.Int, customerId ? Number(customerId) : null)
      .input('Nam',         sql.Int, year       ? Number(year)       : null)
      .execute('SP_BaoCao_BieuDoTheoThang');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/pie-chart?customerId=&transactionType=&fromDate=&toDate=
router.get('/pie-chart', async (req, res) => {
  try {
    const { customerId, transactionType = 'debit', fromDate, toDate } = req.query;
    const result = await req.pool.request()
      .input('MaKhachHang',  sql.Int,        customerId ? Number(customerId) : null)
      .input('LoaiGiaoDich', sql.VarChar(10), transactionType)
      .input('TuNgay',       sql.Date,        fromDate || null)
      .input('DenNgay',      sql.Date,        toDate   || null)
      .execute('SP_BaoCao_PieChart');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/money-flow?customerId=&accountId=&cif=&accountNumber=&fromDate=&toDate=
router.get('/money-flow', async (req, res) => {
  try {
    let { customerId, accountId, cif, accountNumber, fromDate, toDate, amountThreshold } = req.query;

    if (!customerId && !accountId && (cif || accountNumber)) {
      const lookupKey = String(accountNumber || cif).trim();
      const lookup = await req.pool.request()
        .input('Lookup', sql.VarChar(20), lookupKey)
        .query(`
          SELECT TOP 1 MaTaiKhoan, MaKhachHang
          FROM dbo.TaiKhoan
          WHERE SoTaiKhoan = @Lookup OR CIF = @Lookup
        `);

      if (lookup.recordset.length) {
        accountId = lookup.recordset[0].MaTaiKhoan;
        customerId = lookup.recordset[0].MaKhachHang;
      }
    }

    const result = await req.pool.request()
      .input('MaKhachHang',  sql.Int,          customerId      ? Number(customerId)      : null)
      .input('MaTaiKhoan',   sql.Int,          accountId       ? Number(accountId)       : null)
      .input('TuNgay',       sql.Date,         fromDate        || null)
      .input('DenNgay',      sql.Date,         toDate          || null)
      .input('SoTienNguong', sql.Decimal(18,2), amountThreshold ? Number(amountThreshold) : null)
      .execute('SP_TruyVetDongTien');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
