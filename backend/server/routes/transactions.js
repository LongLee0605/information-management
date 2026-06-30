import { Router } from 'express';
import { sql } from '../db.js';
import { ensureRecordset, parsePageNumber, parsePageSize, parsePositiveInt } from '../utils/http.js';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const { accountId, customerId, type, fromDate, toDate, category, minAmount, maxAmount, page = 1, pageSize = 20, } = req.query;
        const parsedAccountId = accountId ? parsePositiveInt(accountId) : null;
        const parsedCustomerId = customerId ? parsePositiveInt(customerId) : null;
        if (accountId && parsedAccountId === null) {
            res.status(400).json({ error: 'accountId phải là số nguyên dương.' });
            return;
        }
        if (customerId && parsedCustomerId === null) {
            res.status(400).json({ error: 'customerId phải là số nguyên dương.' });
            return;
        }
        const result = await req.pool.request()
            .input('MaTaiKhoan', sql.Int, parsedAccountId)
            .input('MaKhachHang', sql.Int, parsedCustomerId)
            .input('LoaiGiaoDich', sql.VarChar(10), type || null)
            .input('TuNgay', sql.DateTime2, fromDate || null)
            .input('DenNgay', sql.DateTime2, toDate || null)
            .input('DanhMuc', sql.NVarChar(100), category || null)
            .input('SoTienToiThieu', sql.Decimal(18, 2), minAmount ? Number(minAmount) : null)
            .input('SoTienToiDa', sql.Decimal(18, 2), maxAmount ? Number(maxAmount) : null)
            .input('PageNumber', sql.Int, parsePageNumber(page))
            .input('PageSize', sql.Int, parsePageSize(pageSize))
            .execute('SP_GiaoDich_TimKiem');
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
            .input('MaGiaoDich', sql.Int, id)
            .execute('SP_GiaoDich_LayTheoMa');
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
        const { accountId, type, amount, description, category, paymentMethod, destinationAccountId } = req.body;
        const parsedAccountId = parsePositiveInt(accountId);
        if (parsedAccountId === null) {
            res.status(400).json({ error: 'accountId phải là số nguyên dương.' });
            return;
        }
        const parsedDestinationAccountId = destinationAccountId
            ? parsePositiveInt(destinationAccountId)
            : null;
        if (destinationAccountId && parsedDestinationAccountId === null) {
            res.status(400).json({ error: 'destinationAccountId phải là số nguyên dương.' });
            return;
        }
        const created = await req.pool.request()
            .input('MaTaiKhoan', sql.Int, parsedAccountId)
            .input('LoaiGiaoDich', sql.VarChar(10), type)
            .input('SoTien', sql.Decimal(18, 2), Number(amount))
            .input('MoTa', sql.NVarChar(500), description || null)
            .input('DanhMuc', sql.NVarChar(100), category || null)
            .input('PhuongThucThanhToan', sql.NVarChar(50), paymentMethod || null)
            .input('MaTaiKhoanDich', sql.Int, parsedDestinationAccountId)
            .execute('SP_GiaoDich_TaoGiaoDich');
        const maGiaoDich = created.recordset[0]?.MaGiaoDich;
        if (!maGiaoDich) {
            res.status(500).json({ error: 'Không tạo được giao dịch.' });
            return;
        }
        const detail = await req.pool.request()
            .input('MaGiaoDich', sql.Int, maGiaoDich)
            .execute('SP_GiaoDich_LayTheoMa');
        res.status(201).json(detail.recordset[0] ?? created.recordset[0]);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});

export default router;
