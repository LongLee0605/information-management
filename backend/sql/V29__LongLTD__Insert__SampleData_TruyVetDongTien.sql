USE QLTT;
GO

-- MaTaiKhoan: 1=Lâm, 4=Lợi, 6=Nhân, 8=Trang, 9=Phong, 11=Việt, 12=Huy, 14=Anh, 15=Long, 17=Dũng
-- Mỗi cấp F1/F2/F3 có 2-4 người nhận; không chuyển cho chính mình (MaKhachHang nguon <> dich)

IF NOT EXISTS (SELECT 1 FROM dbo.GiaoDich WHERE MoTa = N'[TRUYVET] KH1-F1')
BEGIN
    -- ===== KH1 (Lâm): F1=4 người, F2=2-3 người/nhánh, F3=2 người/nhánh =====
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

    -- ===== KH2 (Lợi): F1=3, F2=2/nhánh, F3=2 =====
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

    -- ===== KH3-KH10: mỗi KH 3 F1, 4 F2, 4 F3 (không chuyển về chính mình) =====
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
