import { Router } from 'express';
import { sql } from '../db.js';
import { ensureRecordset, parsePageNumber, parsePageSize, parsePositiveInt } from '../utils/http.js';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const { fullName, citizenId, phone, gender, page = 1, pageSize = 20 } = req.query;
        const result = await req.pool.request()
            .input('HoTen', sql.NVarChar(100), fullName || null)
            .input('CCCD', sql.VarChar(12), citizenId || null)
            .input('DienThoai', sql.VarChar(15), phone || null)
            .input('GioiTinh', sql.VarChar(6), gender || null)
            .input('PageNumber', sql.Int, parsePageNumber(page))
            .input('PageSize', sql.Int, parsePageSize(pageSize))
            .execute('SP_KhachHang_TimKiem');
        res.json(ensureRecordset(result.recordset));
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const id = parsePositiveInt(req.params.id);
        if (id === null) {
            res.status(400).json({ error: 'id phải là số nguyên dương.' });
            return;
        }
        const result = await req.pool.request()
            .input('MaKhachHang', sql.Int, id)
            .query('SELECT * FROM dbo.KhachHang WHERE MaKhachHang = @MaKhachHang');
        if (!result.recordset.length) {
            res.status(404).json({ error: 'Not found' });
            return;
        }
        res.json(result.recordset[0]);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { fullName, citizenId, dateOfBirth, gender, phone, email, address, workplace, maritalStatus, education, monthlyIncome } = req.body;

        if (!fullName?.trim() || !citizenId || !dateOfBirth || !gender) {
            res.status(400).json({ error: 'fullName, citizenId, dateOfBirth và gender là bắt buộc.' });
            return;
        }

        const spResult = await req.pool.request()
            .input('MaKhachHang', sql.Int, null)
            .input('HoTen', sql.NVarChar(100), fullName)
            .input('CCCD', sql.VarChar(12), citizenId)
            .input('NgaySinh', sql.Date, dateOfBirth)
            .input('GioiTinh', sql.VarChar(6), gender)
            .input('DienThoai', sql.VarChar(15), phone || null)
            .input('Email', sql.VarChar(100), email || null)
            .input('DiaChi', sql.NVarChar(200), address || null)
            .input('NoiLamViec', sql.NVarChar(200), workplace || null)
            .input('TinhTrangHonNhan', sql.NVarChar(50), maritalStatus || null)
            .input('HocVan', sql.NVarChar(100), education || null)
            .input('ThuNhapTBThang', sql.Decimal(18, 2), monthlyIncome || null)
            .execute('SP_KhachHang_ThemCapNhat');

        const created = spResult.recordset?.[0];
        const id = created?.ID;
        if (!id) {
            res.status(400).json({ error: created?.Message ?? 'Không thể tạo khách hàng.' });
            return;
        }

        const result = await req.pool.request()
            .input('MaKhachHang', sql.Int, id)
            .query('SELECT * FROM dbo.KhachHang WHERE MaKhachHang = @MaKhachHang');

        res.status(201).json({
            ...result.recordset[0],
            CIF: created.CIF ?? null,
        });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const id = parsePositiveInt(req.params.id);
        if (id === null) {
            res.status(400).json({ error: 'id phải là số nguyên dương.' });
            return;
        }
        const { fullName, citizenId, dateOfBirth, gender, phone, email, address, workplace, maritalStatus, education, monthlyIncome } = req.body;
        await req.pool.request()
            .input('MaKhachHang', sql.Int, id)
            .input('HoTen', sql.NVarChar(100), fullName)
            .input('CCCD', sql.VarChar(12), citizenId)
            .input('NgaySinh', sql.Date, dateOfBirth)
            .input('GioiTinh', sql.VarChar(6), gender)
            .input('DienThoai', sql.VarChar(15), phone || null)
            .input('Email', sql.VarChar(100), email || null)
            .input('DiaChi', sql.NVarChar(200), address || null)
            .input('NoiLamViec', sql.NVarChar(200), workplace || null)
            .input('TinhTrangHonNhan', sql.NVarChar(50), maritalStatus || null)
            .input('HocVan', sql.NVarChar(100), education || null)
            .input('ThuNhapTBThang', sql.Decimal(18, 2), monthlyIncome || null)
            .execute('SP_KhachHang_ThemCapNhat');

        const result = await req.pool.request()
            .input('MaKhachHang', sql.Int, id)
            .query('SELECT * FROM dbo.KhachHang WHERE MaKhachHang = @MaKhachHang');

        res.json(result.recordset[0]);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const id = parsePositiveInt(req.params.id);
        if (id === null) {
            res.status(400).json({ error: 'id phải là số nguyên dương.' });
            return;
        }
        const result = await req.pool.request()
            .input('MaKhachHang', sql.Int, id)
            .input('XacNhan', sql.Bit, 1)
            .execute('SP_KhachHang_Xoa');
        res.json(result.recordset[0] ?? { success: true });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});

export default router;
