import { Router } from 'express';
import { sql } from '../db.js';

const router = Router();

// GET /api/transactions?accountId=&customerId=&type=&fromDate=&toDate=&category=&minAmount=&maxAmount=&page=&pageSize=
router.get('/', async (req, res) => {
  try {
    const {
      accountId, customerId, type,
      fromDate, toDate, category,
      minAmount, maxAmount,
      page = 1, pageSize = 20,
    } = req.query;
    const result = await req.pool.request()
      .input('MaTaiKhoan',     sql.Int,           accountId  ? Number(accountId)  : null)
      .input('MaKhachHang',    sql.Int,           customerId ? Number(customerId) : null)
      .input('LoaiGiaoDich',   sql.VarChar(10),   type       || null)
      .input('TuNgay',         sql.DateTime2,     fromDate   || null)
      .input('DenNgay',        sql.DateTime2,     toDate     || null)
      .input('DanhMuc',        sql.NVarChar(100), category   || null)
      .input('SoTienToiThieu', sql.Decimal(18,2), minAmount  ? Number(minAmount)  : null)
      .input('SoTienToiDa',    sql.Decimal(18,2), maxAmount  ? Number(maxAmount)  : null)
      .input('PageNumber',     sql.Int,           Number(page))
      .input('PageSize',       sql.Int,           Number(pageSize))
      .execute('SP_GiaoDich_TimKiem');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/transactions/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await req.pool.request()
      .input('MaGiaoDich', sql.Int, Number(req.params.id))
      .query('SELECT * FROM dbo.VW_GiaoDich WHERE MaGiaoDich = @MaGiaoDich');
    if (!result.recordset.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/transactions
router.post('/', async (req, res) => {
  try {
    const { accountId, type, amount, description, category, paymentMethod } = req.body;
    const result = await req.pool.request()
      .input('MaTaiKhoan',          sql.Int,           Number(accountId))
      .input('LoaiGiaoDich',        sql.VarChar(10),   type)
      .input('SoTien',              sql.Decimal(18,2), Number(amount))
      .input('MoTa',                sql.NVarChar(500), description   || null)
      .input('DanhMuc',             sql.NVarChar(100), category      || null)
      .input('PhuongThucThanhToan', sql.NVarChar(50),  paymentMethod || null)
      .execute('SP_GiaoDich_TaoGiaoDich');
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
