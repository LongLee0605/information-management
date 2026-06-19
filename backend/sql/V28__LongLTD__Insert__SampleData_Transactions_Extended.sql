-- =============================================================================
-- V28__LongLTD__Insert__SampleData_Transactions_Extended.sql
-- Dữ liệu mẫu: [TRUYVET] F1–F3 + [DEMO-TXN] giao dịch hàng ngày
-- =============================================================================

USE QLTT;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.GiaoDich WHERE MoTa = N'[TRUYVET] KH1-F1')
BEGIN
    INSERT INTO dbo.GiaoDich (MaTaiKhoan, MaTaiKhoanDich, NgayGiaoDich, LoaiGiaoDich, SoTien, MoTa, DanhMuc, PhuongThucThanhToan)
    VALUES
        (1,  4,  '2025-04-01 09:00:00', 'debit', 10000000, N'[TRUYVET] KH1-F1', N'Chuyển khoản', N'Chuyển khoản'),
        (1,  6,  '2025-04-01 09:15:00', 'debit',  8000000, N'[TRUYVET] KH1-F1', N'Chuyển khoản', N'Chuyển khoản'),
        (1,  8,  '2025-04-01 09:30:00', 'debit',  6000000, N'[TRUYVET] KH1-F1', N'Chuyển khoản', N'Chuyển khoản'),
        (1,  9,  '2025-04-01 09:45:00', 'debit',  5000000, N'[TRUYVET] KH1-F1', N'Chuyển khoản', N'Chuyển khoản'),

        (4,  12, '2025-04-05 10:00:00', 'debit',  5000000, N'[TRUYVET] KH1-F2', N'Chuyển khoản', N'Chuyển khoản'),
        (4,  14, '2025-04-05 10:15:00', 'debit',  4000000, N'[TRUYVET] KH1-F2', N'Chuyển khoản', N'Chuyển khoản'),
        (4,  15, '2025-04-05 10:30:00', 'debit',  3000000, N'[TRUYVET] KH1-F2', N'Chuyển khoản', N'Chuyển khoản'),
        (6,  11, '2025-04-05 11:00:00', 'debit',  7000000, N'[TRUYVET] KH1-F2', N'Chuyển khoản', N'Chuyển khoản'),
        (6,  17, '2025-04-05 11:15:00', 'debit',  5000000, N'[TRUYVET] KH1-F2', N'Chuyển khoản', N'Chuyển khoản'),
        (8,  12, '2025-04-05 12:00:00', 'debit',  6000000, N'[TRUYVET] KH1-F2', N'Chuyển khoản', N'Chuyển khoản'),
        (8,  14, '2025-04-05 12:15:00', 'debit',  4000000, N'[TRUYVET] KH1-F2', N'Chuyển khoản', N'Chuyển khoản'),
        (9,  17, '2025-04-05 13:00:00', 'debit',  8000000, N'[TRUYVET] KH1-F2', N'Chuyển khoản', N'Chuyển khoản'),
        (9,  15, '2025-04-05 13:15:00', 'debit',  4000000, N'[TRUYVET] KH1-F2', N'Chuyển khoản', N'Chuyển khoản'),

        (12, 14, '2025-04-10 11:00:00', 'debit',  3000000, N'[TRUYVET] KH1-F3', N'Chuyển khoản', N'Chuyển khoản'),
        (12, 17, '2025-04-10 11:15:00', 'debit',  2000000, N'[TRUYVET] KH1-F3', N'Chuyển khoản', N'Chuyển khoản'),
        (14, 11, '2025-04-10 12:00:00', 'debit',  4000000, N'[TRUYVET] KH1-F3', N'Chuyển khoản', N'Chuyển khoản'),
        (14, 15, '2025-04-10 12:15:00', 'debit',  3000000, N'[TRUYVET] KH1-F3', N'Chuyển khoản', N'Chuyển khoản'),
        (11, 17, '2025-04-10 13:00:00', 'debit',  3000000, N'[TRUYVET] KH1-F3', N'Chuyển khoản', N'Chuyển khoản'),
        (11, 15, '2025-04-10 13:15:00', 'debit',  2000000, N'[TRUYVET] KH1-F3', N'Chuyển khoản', N'Chuyển khoản'),
        (15, 14, '2025-04-10 14:00:00', 'debit',  2000000, N'[TRUYVET] KH1-F3', N'Chuyển khoản', N'Chuyển khoản'),
        (15, 11, '2025-04-10 14:15:00', 'debit',  2000000, N'[TRUYVET] KH1-F3', N'Chuyển khoản', N'Chuyển khoản'),
        (17, 14, '2025-04-10 15:00:00', 'debit',  2500000, N'[TRUYVET] KH1-F3', N'Chuyển khoản', N'Chuyển khoản'),
        (17, 11, '2025-04-10 15:15:00', 'debit',  2500000, N'[TRUYVET] KH1-F3', N'Chuyển khoản', N'Chuyển khoản');

    INSERT INTO dbo.GiaoDich (MaTaiKhoan, NgayGiaoDich, LoaiGiaoDich, SoTien, MoTa, DanhMuc, PhuongThucThanhToan)
    VALUES
        (4,  '2025-04-01 09:00:00', 'credit', 10000000, N'[TRUYVET] KH1-F1-IN', N'Chuyển khoản', N'Chuyển khoản'),
        (6,  '2025-04-01 09:15:00', 'credit',  8000000, N'[TRUYVET] KH1-F1-IN', N'Chuyển khoản', N'Chuyển khoản'),
        (8,  '2025-04-01 09:30:00', 'credit',  6000000, N'[TRUYVET] KH1-F1-IN', N'Chuyển khoản', N'Chuyển khoản'),
        (9,  '2025-04-01 09:45:00', 'credit',  5000000, N'[TRUYVET] KH1-F1-IN', N'Chuyển khoản', N'Chuyển khoản'),
        (12, '2025-04-05 10:00:00', 'credit',  5000000, N'[TRUYVET] KH1-F2-IN', N'Chuyển khoản', N'Chuyển khoản'),
        (14, '2025-04-05 10:15:00', 'credit',  4000000, N'[TRUYVET] KH1-F2-IN', N'Chuyển khoản', N'Chuyển khoản'),
        (15, '2025-04-05 10:30:00', 'credit',  3000000, N'[TRUYVET] KH1-F2-IN', N'Chuyển khoản', N'Chuyển khoản'),
        (11, '2025-04-05 11:00:00', 'credit',  7000000, N'[TRUYVET] KH1-F2-IN', N'Chuyển khoản', N'Chuyển khoản'),
        (17, '2025-04-05 11:15:00', 'credit',  5000000, N'[TRUYVET] KH1-F2-IN', N'Chuyển khoản', N'Chuyển khoản'),
        (14, '2025-04-10 11:00:00', 'credit',  3000000, N'[TRUYVET] KH1-F3-IN', N'Chuyển khoản', N'Chuyển khoản'),
        (17, '2025-04-10 11:15:00', 'credit',  2000000, N'[TRUYVET] KH1-F3-IN', N'Chuyển khoản', N'Chuyển khoản'),
        (11, '2025-04-10 12:00:00', 'credit',  4000000, N'[TRUYVET] KH1-F3-IN', N'Chuyển khoản', N'Chuyển khoản'),
        (15, '2025-04-10 12:15:00', 'credit',  3000000, N'[TRUYVET] KH1-F3-IN', N'Chuyển khoản', N'Chuyển khoản');

    INSERT INTO dbo.GiaoDich (MaTaiKhoan, MaTaiKhoanDich, NgayGiaoDich, LoaiGiaoDich, SoTien, MoTa, DanhMuc, PhuongThucThanhToan)
    VALUES
        (4,  6,  '2025-04-02 09:00:00', 'debit', 10000000, N'[TRUYVET] KH2-F1', N'Chuyển khoản', N'Chuyển khoản'),
        (4,  8,  '2025-04-02 09:15:00', 'debit',  8000000, N'[TRUYVET] KH2-F1', N'Chuyển khoản', N'Chuyển khoản'),
        (4,  11, '2025-04-02 09:30:00', 'debit',  6000000, N'[TRUYVET] KH2-F1', N'Chuyển khoản', N'Chuyển khoản'),
        (6,  12, '2025-04-06 10:00:00', 'debit',  5000000, N'[TRUYVET] KH2-F2', N'Chuyển khoản', N'Chuyển khoản'),
        (6,  14, '2025-04-06 10:15:00', 'debit',  4000000, N'[TRUYVET] KH2-F2', N'Chuyển khoản', N'Chuyển khoản'),
        (8,  15, '2025-04-06 11:00:00', 'debit',  5000000, N'[TRUYVET] KH2-F2', N'Chuyển khoản', N'Chuyển khoản'),
        (8,  17, '2025-04-06 11:15:00', 'debit',  4000000, N'[TRUYVET] KH2-F2', N'Chuyển khoản', N'Chuyển khoản'),
        (12, 14, '2025-04-11 11:00:00', 'debit',  3000000, N'[TRUYVET] KH2-F3', N'Chuyển khoản', N'Chuyển khoản'),
        (12, 17, '2025-04-11 11:15:00', 'debit',  2000000, N'[TRUYVET] KH2-F3', N'Chuyển khoản', N'Chuyển khoản'),
        (15, 11, '2025-04-11 12:00:00', 'debit',  3000000, N'[TRUYVET] KH2-F3', N'Chuyển khoản', N'Chuyển khoản'),
        (15, 14, '2025-04-11 12:15:00', 'debit',  2000000, N'[TRUYVET] KH2-F3', N'Chuyển khoản', N'Chuyển khoản');

    INSERT INTO dbo.GiaoDich (MaTaiKhoan, NgayGiaoDich, LoaiGiaoDich, SoTien, MoTa, DanhMuc, PhuongThucThanhToan)
    VALUES
        (6,  '2025-04-02 09:00:00', 'credit', 10000000, N'[TRUYVET] KH2-F1-IN', N'Chuyển khoản', N'Chuyển khoản'),
        (8,  '2025-04-02 09:15:00', 'credit',  8000000, N'[TRUYVET] KH2-F1-IN', N'Chuyển khoản', N'Chuyển khoản'),
        (11, '2025-04-02 09:30:00', 'credit',  6000000, N'[TRUYVET] KH2-F1-IN', N'Chuyển khoản', N'Chuyển khoản');

    INSERT INTO dbo.GiaoDich (MaTaiKhoan, MaTaiKhoanDich, NgayGiaoDich, LoaiGiaoDich, SoTien, MoTa, DanhMuc, PhuongThucThanhToan)
    VALUES
        (6,  8,  '2025-04-03 09:00:00', 'debit', 10000000, N'[TRUYVET] KH3-F1', N'Chuyển khoản', N'Chuyển khoản'),
        (6,  9,  '2025-04-03 09:15:00', 'debit',  8000000, N'[TRUYVET] KH3-F1', N'Chuyển khoản', N'Chuyển khoản'),
        (6,  11, '2025-04-03 09:30:00', 'debit',  6000000, N'[TRUYVET] KH3-F1', N'Chuyển khoản', N'Chuyển khoản'),
        (8,  12, '2025-04-07 10:00:00', 'debit',  5000000, N'[TRUYVET] KH3-F2', N'Chuyển khoản', N'Chuyển khoản'),
        (8,  14, '2025-04-07 10:15:00', 'debit',  4000000, N'[TRUYVET] KH3-F2', N'Chuyển khoản', N'Chuyển khoản'),
        (9,  15, '2025-04-07 11:00:00', 'debit',  5000000, N'[TRUYVET] KH3-F2', N'Chuyển khoản', N'Chuyển khoản'),
        (9,  17, '2025-04-07 11:15:00', 'debit',  4000000, N'[TRUYVET] KH3-F2', N'Chuyển khoản', N'Chuyển khoản'),
        (12, 14, '2025-04-12 11:00:00', 'debit',  3000000, N'[TRUYVET] KH3-F3', N'Chuyển khoản', N'Chuyển khoản'),
        (12, 17, '2025-04-12 11:15:00', 'debit',  2000000, N'[TRUYVET] KH3-F3', N'Chuyển khoản', N'Chuyển khoản'),
        (15, 11, '2025-04-12 12:00:00', 'debit',  3000000, N'[TRUYVET] KH3-F3', N'Chuyển khoản', N'Chuyển khoản'),
        (15, 14, '2025-04-12 12:15:00', 'debit',  2000000, N'[TRUYVET] KH3-F3', N'Chuyển khoản', N'Chuyển khoản'),

        (8,  9,  '2025-04-03 10:00:00', 'debit', 10000000, N'[TRUYVET] KH4-F1', N'Chuyển khoản', N'Chuyển khoản'),
        (8,  11, '2025-04-03 10:15:00', 'debit',  8000000, N'[TRUYVET] KH4-F1', N'Chuyển khoản', N'Chuyển khoản'),
        (8,  12, '2025-04-03 10:30:00', 'debit',  6000000, N'[TRUYVET] KH4-F1', N'Chuyển khoản', N'Chuyển khoản'),
        (9,  14, '2025-04-07 10:00:00', 'debit',  5000000, N'[TRUYVET] KH4-F2', N'Chuyển khoản', N'Chuyển khoản'),
        (9,  15, '2025-04-07 10:15:00', 'debit',  4000000, N'[TRUYVET] KH4-F2', N'Chuyển khoản', N'Chuyển khoản'),
        (11, 17, '2025-04-07 11:00:00', 'debit',  5000000, N'[TRUYVET] KH4-F2', N'Chuyển khoản', N'Chuyển khoản'),
        (11, 6,  '2025-04-07 11:15:00', 'debit',  4000000, N'[TRUYVET] KH4-F2', N'Chuyển khoản', N'Chuyển khoản'),
        (14, 17, '2025-04-12 11:00:00', 'debit',  3000000, N'[TRUYVET] KH4-F3', N'Chuyển khoản', N'Chuyển khoản'),
        (14, 11, '2025-04-12 11:15:00', 'debit',  2000000, N'[TRUYVET] KH4-F3', N'Chuyển khoản', N'Chuyển khoản'),
        (15, 12, '2025-04-12 12:00:00', 'debit',  3000000, N'[TRUYVET] KH4-F3', N'Chuyển khoản', N'Chuyển khoản'),
        (15, 14, '2025-04-12 12:15:00', 'debit',  2000000, N'[TRUYVET] KH4-F3', N'Chuyển khoản', N'Chuyển khoản'),

        (9,  11, '2025-04-04 09:00:00', 'debit', 10000000, N'[TRUYVET] KH5-F1', N'Chuyển khoản', N'Chuyển khoản'),
        (9,  12, '2025-04-04 09:15:00', 'debit',  8000000, N'[TRUYVET] KH5-F1', N'Chuyển khoản', N'Chuyển khoản'),
        (9,  14, '2025-04-04 09:30:00', 'debit',  6000000, N'[TRUYVET] KH5-F1', N'Chuyển khoản', N'Chuyển khoản'),
        (11, 15, '2025-04-08 10:00:00', 'debit',  5000000, N'[TRUYVET] KH5-F2', N'Chuyển khoản', N'Chuyển khoản'),
        (11, 17, '2025-04-08 10:15:00', 'debit',  4000000, N'[TRUYVET] KH5-F2', N'Chuyển khoản', N'Chuyển khoản'),
        (12, 6,  '2025-04-08 11:00:00', 'debit',  5000000, N'[TRUYVET] KH5-F2', N'Chuyển khoản', N'Chuyển khoản'),
        (12, 8,  '2025-04-08 11:15:00', 'debit',  4000000, N'[TRUYVET] KH5-F2', N'Chuyển khoản', N'Chuyển khoản'),
        (15, 14, '2025-04-13 11:00:00', 'debit',  3000000, N'[TRUYVET] KH5-F3', N'Chuyển khoản', N'Chuyển khoản'),
        (15, 17, '2025-04-13 11:15:00', 'debit',  2000000, N'[TRUYVET] KH5-F3', N'Chuyển khoản', N'Chuyển khoản'),
        (17, 11, '2025-04-13 12:00:00', 'debit',  3000000, N'[TRUYVET] KH5-F3', N'Chuyển khoản', N'Chuyển khoản'),
        (17, 12, '2025-04-13 12:15:00', 'debit',  2000000, N'[TRUYVET] KH5-F3', N'Chuyển khoản', N'Chuyển khoản'),

        (11, 6,  '2025-04-04 10:00:00', 'debit', 10000000, N'[TRUYVET] KH6-F1', N'Chuyển khoản', N'Chuyển khoản'),
        (11, 8,  '2025-04-04 10:15:00', 'debit',  8000000, N'[TRUYVET] KH6-F1', N'Chuyển khoản', N'Chuyển khoản'),
        (11, 9,  '2025-04-04 10:30:00', 'debit',  6000000, N'[TRUYVET] KH6-F1', N'Chuyển khoản', N'Chuyển khoản'),
        (6,  12, '2025-04-08 10:00:00', 'debit',  5000000, N'[TRUYVET] KH6-F2', N'Chuyển khoản', N'Chuyển khoản'),
        (6,  14, '2025-04-08 10:15:00', 'debit',  4000000, N'[TRUYVET] KH6-F2', N'Chuyển khoản', N'Chuyển khoản'),
        (8,  15, '2025-04-08 11:00:00', 'debit',  5000000, N'[TRUYVET] KH6-F2', N'Chuyển khoản', N'Chuyển khoản'),
        (8,  17, '2025-04-08 11:15:00', 'debit',  4000000, N'[TRUYVET] KH6-F2', N'Chuyển khoản', N'Chuyển khoản'),
        (12, 14, '2025-04-13 11:00:00', 'debit',  3000000, N'[TRUYVET] KH6-F3', N'Chuyển khoản', N'Chuyển khoản'),
        (12, 17, '2025-04-13 11:15:00', 'debit',  2000000, N'[TRUYVET] KH6-F3', N'Chuyển khoản', N'Chuyển khoản'),
        (15, 9,  '2025-04-13 12:00:00', 'debit',  3000000, N'[TRUYVET] KH6-F3', N'Chuyển khoản', N'Chuyển khoản'),
        (15, 14, '2025-04-13 12:15:00', 'debit',  2000000, N'[TRUYVET] KH6-F3', N'Chuyển khoản', N'Chuyển khoản'),

        (12, 17, '2025-04-05 09:00:00', 'debit', 10000000, N'[TRUYVET] KH7-F1', N'Chuyển khoản', N'Chuyển khoản'),
        (12, 14, '2025-04-05 09:15:00', 'debit',  8000000, N'[TRUYVET] KH7-F1', N'Chuyển khoản', N'Chuyển khoản'),
        (12, 15, '2025-04-05 09:30:00', 'debit',  6000000, N'[TRUYVET] KH7-F1', N'Chuyển khoản', N'Chuyển khoản'),
        (17, 11, '2025-04-09 10:00:00', 'debit',  5000000, N'[TRUYVET] KH7-F2', N'Chuyển khoản', N'Chuyển khoản'),
        (17, 6,  '2025-04-09 10:15:00', 'debit',  4000000, N'[TRUYVET] KH7-F2', N'Chuyển khoản', N'Chuyển khoản'),
        (14, 8,  '2025-04-09 11:00:00', 'debit',  5000000, N'[TRUYVET] KH7-F2', N'Chuyển khoản', N'Chuyển khoản'),
        (14, 9,  '2025-04-09 11:15:00', 'debit',  4000000, N'[TRUYVET] KH7-F2', N'Chuyển khoản', N'Chuyển khoản'),
        (11, 15, '2025-04-14 11:00:00', 'debit',  3000000, N'[TRUYVET] KH7-F3', N'Chuyển khoản', N'Chuyển khoản'),
        (11, 14, '2025-04-14 11:15:00', 'debit',  2000000, N'[TRUYVET] KH7-F3', N'Chuyển khoản', N'Chuyển khoản'),
        (8,  17, '2025-04-14 12:00:00', 'debit',  3000000, N'[TRUYVET] KH7-F3', N'Chuyển khoản', N'Chuyển khoản'),
        (8,  11, '2025-04-14 12:15:00', 'debit',  2000000, N'[TRUYVET] KH7-F3', N'Chuyển khoản', N'Chuyển khoản'),

        (14, 15, '2025-04-06 09:00:00', 'debit', 10000000, N'[TRUYVET] KH8-F1', N'Chuyển khoản', N'Chuyển khoản'),
        (14, 17, '2025-04-06 09:15:00', 'debit',  8000000, N'[TRUYVET] KH8-F1', N'Chuyển khoản', N'Chuyển khoản'),
        (14, 11, '2025-04-06 09:30:00', 'debit',  6000000, N'[TRUYVET] KH8-F1', N'Chuyển khoản', N'Chuyển khoản'),
        (15, 12, '2025-04-10 10:00:00', 'debit',  5000000, N'[TRUYVET] KH8-F2', N'Chuyển khoản', N'Chuyển khoản'),
        (15, 6,  '2025-04-10 10:15:00', 'debit',  4000000, N'[TRUYVET] KH8-F2', N'Chuyển khoản', N'Chuyển khoản'),
        (17, 8,  '2025-04-10 11:00:00', 'debit',  5000000, N'[TRUYVET] KH8-F2', N'Chuyển khoản', N'Chuyển khoản'),
        (17, 9,  '2025-04-10 11:15:00', 'debit',  4000000, N'[TRUYVET] KH8-F2', N'Chuyển khoản', N'Chuyển khoản'),
        (12, 11, '2025-04-15 11:00:00', 'debit',  3000000, N'[TRUYVET] KH8-F3', N'Chuyển khoản', N'Chuyển khoản'),
        (12, 17, '2025-04-15 11:15:00', 'debit',  2000000, N'[TRUYVET] KH8-F3', N'Chuyển khoản', N'Chuyển khoản'),
        (6,  14, '2025-04-15 12:00:00', 'debit',  3000000, N'[TRUYVET] KH8-F3', N'Chuyển khoản', N'Chuyển khoản'),
        (6,  15, '2025-04-15 12:15:00', 'debit',  2000000, N'[TRUYVET] KH8-F3', N'Chuyển khoản', N'Chuyển khoản'),

        (15, 17, '2025-04-06 10:00:00', 'debit', 10000000, N'[TRUYVET] KH9-F1', N'Chuyển khoản', N'Chuyển khoản'),
        (15, 12, '2025-04-06 10:15:00', 'debit',  8000000, N'[TRUYVET] KH9-F1', N'Chuyển khoản', N'Chuyển khoản'),
        (15, 14, '2025-04-06 10:30:00', 'debit',  6000000, N'[TRUYVET] KH9-F1', N'Chuyển khoản', N'Chuyển khoản'),
        (17, 11, '2025-04-10 10:00:00', 'debit',  5000000, N'[TRUYVET] KH9-F2', N'Chuyển khoản', N'Chuyển khoản'),
        (17, 6,  '2025-04-10 10:15:00', 'debit',  4000000, N'[TRUYVET] KH9-F2', N'Chuyển khoản', N'Chuyển khoản'),
        (12, 8,  '2025-04-10 11:00:00', 'debit',  5000000, N'[TRUYVET] KH9-F2', N'Chuyển khoản', N'Chuyển khoản'),
        (12, 9,  '2025-04-10 11:15:00', 'debit',  4000000, N'[TRUYVET] KH9-F2', N'Chuyển khoản', N'Chuyển khoản'),
        (11, 14, '2025-04-15 11:00:00', 'debit',  3000000, N'[TRUYVET] KH9-F3', N'Chuyển khoản', N'Chuyển khoản'),
        (11, 17, '2025-04-15 11:15:00', 'debit',  2000000, N'[TRUYVET] KH9-F3', N'Chuyển khoản', N'Chuyển khoản'),
        (8,  15, '2025-04-15 12:00:00', 'debit',  3000000, N'[TRUYVET] KH9-F3', N'Chuyển khoản', N'Chuyển khoản'),
        (8,  12, '2025-04-15 12:15:00', 'debit',  2000000, N'[TRUYVET] KH9-F3', N'Chuyển khoản', N'Chuyển khoản'),

        (17, 4,  '2025-04-07 09:00:00', 'debit', 10000000, N'[TRUYVET] KH10-F1', N'Chuyển khoản', N'Chuyển khoản'),
        (17, 6,  '2025-04-07 09:15:00', 'debit',  8000000, N'[TRUYVET] KH10-F1', N'Chuyển khoản', N'Chuyển khoản'),
        (17, 8,  '2025-04-07 09:30:00', 'debit',  6000000, N'[TRUYVET] KH10-F1', N'Chuyển khoản', N'Chuyển khoản'),
        (4,  12, '2025-04-11 10:00:00', 'debit',  5000000, N'[TRUYVET] KH10-F2', N'Chuyển khoản', N'Chuyển khoản'),
        (4,  14, '2025-04-11 10:15:00', 'debit',  4000000, N'[TRUYVET] KH10-F2', N'Chuyển khoản', N'Chuyển khoản'),
        (6,  15, '2025-04-11 11:00:00', 'debit',  5000000, N'[TRUYVET] KH10-F2', N'Chuyển khoản', N'Chuyển khoản'),
        (6,  11, '2025-04-11 11:15:00', 'debit',  4000000, N'[TRUYVET] KH10-F2', N'Chuyển khoản', N'Chuyển khoản'),
        (12, 14, '2025-04-16 11:00:00', 'debit',  3000000, N'[TRUYVET] KH10-F3', N'Chuyển khoản', N'Chuyển khoản'),
        (12, 11, '2025-04-16 11:15:00', 'debit',  2000000, N'[TRUYVET] KH10-F3', N'Chuyển khoản', N'Chuyển khoản'),
        (15, 8,  '2025-04-16 12:00:00', 'debit',  3000000, N'[TRUYVET] KH10-F3', N'Chuyển khoản', N'Chuyển khoản'),
        (15, 9,  '2025-04-16 12:15:00', 'debit',  2000000, N'[TRUYVET] KH10-F3', N'Chuyển khoản', N'Chuyển khoản');
END;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.GiaoDich WHERE MoTa = N'[DEMO-TXN] KH1-1')
BEGIN
    ;WITH N AS (
        SELECT TOP 50 ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS Seq
        FROM sys.all_objects
    ),
    Accounts AS (
        SELECT * FROM (VALUES
            (1,  1),
            (4,  2),
            (6,  3),
            (8,  4),
            (9,  5),
            (11, 6),
            (12, 7),
            (14, 8),
            (15, 9),
            (17, 10)
        ) AS v(MaTaiKhoan, MaKhachHang)
    ),
    Expanded AS (
        SELECT
            a.MaTaiKhoan,
            a.MaKhachHang,
            n.Seq,
            DATEADD(
                DAY,
                CASE
                    WHEN DATEDIFF(DAY, '2025-01-01', CAST(GETDATE() AS DATE)) <= 0 THEN 0
                    ELSE (DATEDIFF(DAY, '2025-01-01', CAST(GETDATE() AS DATE)) * (n.Seq - 1)) / 49
                END,
                CAST('2025-01-01' AS DATE)
            ) AS NgayGiaoDichDate
        FROM Accounts a
        CROSS JOIN N n
    )
    INSERT INTO dbo.GiaoDich (MaTaiKhoan, NgayGiaoDich, LoaiGiaoDich, SoTien, MoTa, DanhMuc, PhuongThucThanhToan)
    SELECT
        e.MaTaiKhoan,
        DATEADD(
            MINUTE,
            (e.Seq * 37 + e.MaKhachHang * 13) % 720,
            DATEADD(HOUR, 8 + (e.Seq % 10), CAST(e.NgayGiaoDichDate AS DATETIME2(0)))
        ),
        CASE WHEN e.Seq % 5 IN (1, 2) THEN 'credit' ELSE 'debit' END,
        CASE
            WHEN e.Seq % 5 IN (1, 2)
                THEN CAST(4500000 + (e.MaKhachHang * 420000) + (e.Seq * 95000) AS DECIMAL(18, 2))
            ELSE CAST(350000 + ((e.Seq * 127000 + e.MaKhachHang * 53000) % 4800000) + 150000 AS DECIMAL(18, 2))
        END,
        N'[DEMO-TXN] KH' + CAST(e.MaKhachHang AS NVARCHAR(10)) + N'-' + CAST(e.Seq AS NVARCHAR(10)),
        CASE
            WHEN e.Seq % 5 IN (1, 2) THEN N'Thu nhập'
            WHEN e.Seq % 6 = 0 THEN N'Nhà ở'
            WHEN e.Seq % 6 = 1 THEN N'Ăn uống'
            WHEN e.Seq % 6 = 2 THEN N'Giáo dục'
            WHEN e.Seq % 6 = 3 THEN N'Sinh hoạt'
            WHEN e.Seq % 6 = 4 THEN N'Mua sắm'
            ELSE N'Chuyển khoản'
        END,
        CASE e.Seq % 4
            WHEN 0 THEN N'Chuyển khoản'
            WHEN 1 THEN N'Tiền mặt'
            WHEN 2 THEN N'NAPAS'
            ELSE N'Deposit'
        END
    FROM Expanded e;
END;
GO
