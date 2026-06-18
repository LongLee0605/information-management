import { Router } from 'express';
import { sql } from '../db.js';

const router = Router();

// GET /api/accounts?customerId=&accountNumber=&accountType=&status=&bank=&cif=&page=&pageSize=
router.get('/', async (req, res) => {
  try {
    const {
      customerId,
      accountNumber,
      cif,
      accountType,
      status,
      bank,
      page = 1,
      pageSize = 100,
    } = req.query;

    const request = req.pool.request()
      .input('MaKhachHang', sql.Int, customerId ? Number(customerId) : null)
      .input('SoTaiKhoan', sql.VarChar(20), accountNumber || cif || null)
      .input('LoaiTaiKhoan', sql.VarChar(20), accountType || null)
      .input('TrangThai', sql.VarChar(10), status || null)
      .input('NganHang', sql.NVarChar(50), bank || null)
      .input('PageNumber', sql.Int, Number(page))
      .input('PageSize', sql.Int, Number(pageSize));

    const result = await request.query(`
      SELECT
        v.MaTaiKhoan,
        v.SoTaiKhoan,
        v.LoaiTaiKhoan,
        v.NhanLoaiTaiKhoan,
        v.SoDuHienTai,
        v.SoDuDongBang,
        v.SoDuKhaDung,
        v.TrangThai,
        v.NganHang,
        v.LaTaiKhoanChinh,
        v.MaKhachHang,
        v.HoTen,
        v.DienThoai,
        v.CIF
      FROM dbo.VW_TaiKhoan v
      WHERE
        (@MaKhachHang IS NULL OR v.MaKhachHang = @MaKhachHang)
        AND (
          @SoTaiKhoan IS NULL
          OR v.SoTaiKhoan = @SoTaiKhoan
          OR v.CIF = @SoTaiKhoan
        )
        AND (@LoaiTaiKhoan IS NULL OR v.LoaiTaiKhoan = @LoaiTaiKhoan)
        AND (@TrangThai IS NULL OR v.TrangThai = @TrangThai)
        AND (@NganHang IS NULL OR v.NganHang LIKE N'%' + @NganHang + N'%')
      ORDER BY v.HoTen, v.LaTaiKhoanChinh DESC
      OFFSET (@PageNumber - 1) * @PageSize ROWS
      FETCH NEXT @PageSize ROWS ONLY;
    `);

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/accounts/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await req.pool.request()
      .input('MaTaiKhoan', sql.Int, Number(req.params.id))
      .query('SELECT * FROM dbo.VW_TaiKhoan WHERE MaTaiKhoan = @MaTaiKhoan');
    if (!result.recordset.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/accounts — tạo tài khoản mới
const ACCOUNT_TYPE_LABELS = {
  payment: 'Tài khoản thanh toán',
  savings: 'Tài khoản tiết kiệm',
  debit: 'Tài khoản ghi nợ',
  overdraft: 'Tài khoản thấu chi',
};

router.post('/', async (req, res) => {
  try {
    const { customerId, accountType, bank, initialBalance, cif } = req.body;
    const normalizedType = accountType || 'payment';
    const accountNumber = String(Date.now()).slice(-10);
    const result = await req.pool.request()
      .input('MaKhachHang',      sql.Int,            Number(customerId))
      .input('CIF',              sql.VarChar(20),     cif || String(customerId).padStart(6, '0'))
      .input('SoTaiKhoan',       sql.VarChar(20),     accountNumber)
      .input('LoaiTaiKhoan',     sql.VarChar(20),     normalizedType)
      .input('NhanLoaiTaiKhoan', sql.NVarChar(50),    ACCOUNT_TYPE_LABELS[normalizedType] ?? normalizedType)
      .input('NganHang',         sql.NVarChar(50),    bank || 'OCB')
      .input('SoDuHienTai',      sql.Decimal(18, 2),  initialBalance ?? (normalizedType === 'payment' ? 10_000_000 : 0))
      .query(`
        INSERT INTO dbo.TaiKhoan (
          MaKhachHang, CIF, SoTaiKhoan, LoaiTaiKhoan, NhanLoaiTaiKhoan,
          NganHang, SoDuHienTai, SoDuDongBang, TrangThai
        )
        VALUES (
          @MaKhachHang, @CIF, @SoTaiKhoan, @LoaiTaiKhoan, @NhanLoaiTaiKhoan,
          @NganHang, @SoDuHienTai, 0, 'active'
        );
        SELECT * FROM dbo.VW_TaiKhoan WHERE MaTaiKhoan = SCOPE_IDENTITY();
      `);
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/accounts/:id/status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const result = await req.pool.request()
      .input('MaTaiKhoan', sql.Int,        Number(req.params.id))
      .input('TrangThai',  sql.VarChar(10), status)
      .execute('SP_TaiKhoan_CapNhatTrangThai');
    res.json(result.recordset[0] ?? { success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/accounts/:id/toggle
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { action } = req.body; // 'mo' | 'khoa'
    const result = await req.pool.request()
      .input('MaTaiKhoan', sql.Int,        Number(req.params.id))
      .input('HanhDong',   sql.VarChar(10), action)
      .execute('SP_TaiKhoan_MoTaiKhoa');
    res.json(result.recordset[0] ?? { success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
