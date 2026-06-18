import { Router } from 'express';
import { sql } from '../db.js';

const router = Router();

// GET /api/customers?fullName=&citizenId=&phone=&gender=&page=&pageSize=
router.get('/', async (req, res) => {
  try {
    const { fullName, citizenId, phone, gender, page = 1, pageSize = 20 } = req.query;
    const result = await req.pool.request()
      .input('HoTen',      sql.NVarChar(100), fullName   || null)
      .input('CCCD',       sql.VarChar(12),   citizenId  || null)
      .input('DienThoai',  sql.VarChar(15),   phone      || null)
      .input('GioiTinh',   sql.VarChar(6),    gender     || null)
      .input('PageNumber', sql.Int,           Number(page))
      .input('PageSize',   sql.Int,           Number(pageSize))
      .execute('SP_KhachHang_TimKiem');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/customers/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await req.pool.request()
      .input('MaKhachHang', sql.Int, Number(req.params.id))
      .query('SELECT * FROM dbo.KhachHang WHERE MaKhachHang = @MaKhachHang');
    if (!result.recordset.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/customers
router.post('/', async (req, res) => {
  try {
    const { fullName, citizenId, dateOfBirth, gender, phone, email, address, workplace, maritalStatus, education, monthlyIncome } = req.body;
    const result = await req.pool.request()
      .input('MaKhachHang',      sql.Int,            null)
      .input('HoTen',            sql.NVarChar(100),   fullName)
      .input('CCCD',             sql.VarChar(12),     citizenId)
      .input('NgaySinh',         sql.Date,            dateOfBirth)
      .input('GioiTinh',         sql.VarChar(6),      gender)
      .input('DienThoai',        sql.VarChar(15),     phone           || null)
      .input('Email',            sql.VarChar(100),    email           || null)
      .input('DiaChi',           sql.NVarChar(200),   address         || null)
      .input('NoiLamViec',       sql.NVarChar(200),   workplace       || null)
      .input('TinhTrangHonNhan', sql.NVarChar(50),    maritalStatus   || null)
      .input('HocVan',           sql.NVarChar(100),   education       || null)
      .input('ThuNhapTBThang',   sql.Decimal(18, 2),  monthlyIncome   || null)
      .execute('SP_KhachHang_ThemCapNhat');
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/customers/:id
router.put('/:id', async (req, res) => {
  try {
    const { fullName, citizenId, dateOfBirth, gender, phone, email, address, workplace, maritalStatus, education, monthlyIncome } = req.body;
    const result = await req.pool.request()
      .input('MaKhachHang',      sql.Int,            Number(req.params.id))
      .input('HoTen',            sql.NVarChar(100),   fullName)
      .input('CCCD',             sql.VarChar(12),     citizenId)
      .input('NgaySinh',         sql.Date,            dateOfBirth)
      .input('GioiTinh',         sql.VarChar(6),      gender)
      .input('DienThoai',        sql.VarChar(15),     phone           || null)
      .input('Email',            sql.VarChar(100),    email           || null)
      .input('DiaChi',           sql.NVarChar(200),   address         || null)
      .input('NoiLamViec',       sql.NVarChar(200),   workplace       || null)
      .input('TinhTrangHonNhan', sql.NVarChar(50),    maritalStatus   || null)
      .input('HocVan',           sql.NVarChar(100),   education       || null)
      .input('ThuNhapTBThang',   sql.Decimal(18, 2),  monthlyIncome   || null)
      .execute('SP_KhachHang_ThemCapNhat');
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/customers/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await req.pool.request()
      .input('MaKhachHang', sql.Int, Number(req.params.id))
      .input('XacNhan',     sql.Bit, 1)
      .execute('SP_KhachHang_Xoa');
    res.json(result.recordset[0] ?? { success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
