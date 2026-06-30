import { Router } from 'express';
import { sql } from '../db.js';
import { ensureRecordset, parsePageNumber, parsePageSize, parsePositiveInt } from '../utils/http.js';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const { customerId, accountNumber, cif, accountType, status, bank, page = 1, pageSize = 100, } = req.query;
        const parsedCustomerId = customerId ? parsePositiveInt(customerId) : null;
        if (customerId && parsedCustomerId === null) {
            res.status(400).json({ error: 'customerId phải là số nguyên dương.' });
            return;
        }
        const result = await req.pool.request()
            .input('MaKhachHang', sql.Int, parsedCustomerId)
            .input('CIF', sql.VarChar(20), null)
            .input('SoTaiKhoan', sql.VarChar(20), accountNumber || cif || null)
            .input('LoaiTaiKhoan', sql.VarChar(20), accountType || null)
            .input('TrangThai', sql.VarChar(10), status || null)
            .input('NganHang', sql.NVarChar(50), bank || null)
            .input('PageNumber', sql.Int, parsePageNumber(page))
            .input('PageSize', sql.Int, parsePageSize(pageSize, 100))
            .execute('SP_TaiKhoan_TimKiem');
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
            .input('MaTaiKhoan', sql.Int, id)
            .execute('SP_TaiKhoan_LayTheoMa');
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
        const { customerId, accountType, cif } = req.body;
        const normalizedType = accountType || 'payment';
        if (!['payment', 'savings'].includes(normalizedType)) {
            res.status(400).json({ error: 'accountType chỉ hỗ trợ payment hoặc savings khi mở tài khoản mới.' });
            return;
        }

        let resolvedCif = typeof cif === 'string' ? cif.trim() : '';
        const parsedCustomerId = customerId ? parsePositiveInt(customerId) : null;

        if (!resolvedCif && parsedCustomerId !== null) {
            const lookup = await req.pool.request()
                .input('MaKhachHang', sql.Int, parsedCustomerId)
                .execute('SP_TaiKhoan_LayCIFTheoKhachHang');
            resolvedCif = lookup.recordset[0]?.CIF ?? '';
        }

        if (!resolvedCif) {
            res.status(400).json({ error: 'CIF là bắt buộc để mở tài khoản mới.' });
            return;
        }

        const result = await req.pool.request()
            .input('CIF', sql.VarChar(20), resolvedCif)
            .input('LoaiTaiKhoan', sql.NVarChar(20), normalizedType)
            .execute('SP_TaiKhoan_MoTaiKhoan');

        const created = result.recordset?.[0];
        if (!created?.ID) {
            res.status(400).json({ error: created?.Message ?? 'Không thể mở tài khoản.' });
            return;
        }

        const account = await req.pool.request()
            .input('MaTaiKhoan', sql.Int, created.ID)
            .execute('SP_TaiKhoan_LayTheoMa');

        res.status(201).json(account.recordset[0] ?? created);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.patch('/:id/status', async (req, res) => {
    try {
        const id = parsePositiveInt(req.params.id);
        if (id === null) {
            res.status(400).json({ error: 'id phải là số nguyên dương.' });
            return;
        }
        const { status } = req.body;
        const result = await req.pool.request()
            .input('MaTaiKhoan', sql.Int, id)
            .input('TrangThai', sql.VarChar(10), status)
            .execute('SP_TaiKhoan_CapNhatTrangThai');
        res.json(result.recordset[0] ?? { success: true });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.patch('/:id/toggle', async (req, res) => {
    try {
        const id = parsePositiveInt(req.params.id);
        if (id === null) {
            res.status(400).json({ error: 'id phải là số nguyên dương.' });
            return;
        }
        const { action } = req.body;
        const status = action === 'mo' ? 'active' : action === 'khoa' ? 'inactive' : null;
        if (!status) {
            res.status(400).json({ error: 'action phải là mo hoặc khoa.' });
            return;
        }
        const result = await req.pool.request()
            .input('MaTaiKhoan', sql.Int, id)
            .input('TrangThai', sql.VarChar(10), status)
            .execute('SP_TaiKhoan_CapNhatTrangThai');
        res.json(result.recordset[0] ?? { success: true });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});

export default router;
