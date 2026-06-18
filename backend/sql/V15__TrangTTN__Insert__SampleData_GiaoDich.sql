-- =============================================================================
-- V15__TrangTTN__Insert__SampleData_GiaoDich.sql
-- Chèn dữ liệu mẫu vào bảng GiaoDich
-- =============================================================================

USE QLTT;
GO

-- Giả định MaTaiKhoan theo thứ tự INSERT ở V14:
-- 1=Lâm-payment, 2=Lâm-savings, 3=Lâm-debit
-- 4=Lợi-payment, 5=Lợi-savings
-- 6=Nhân-payment, 7=Nhân-overdraft
-- 8=Trang-payment
-- 9=Phong-payment, 10=Phong-savings
-- 11=Việt-payment
-- 12=Huy-payment, 13=Huy-savings
-- 14=Anh-payment
-- 15=Long-payment, 16=Long-savings
-- 17=Dũng-payment, 18=Dũng-savings

INSERT INTO dbo.GiaoDich (MaTaiKhoan, NgayGiaoDich, LoaiGiaoDich, SoTien, MoTa, DanhMuc, PhuongThucThanhToan)
VALUES
    -- Lâm (TK 1 - payment)
    (1,  '2025-01-05 08:30:00', 'credit', 18000000, N'Lương tháng 1',          N'Thu nhập',        N'Chuyển khoản'),
    (1,  '2025-01-10 14:20:00', 'debit',   5000000, N'Tiền nhà tháng 1',        N'Nhà ở',           N'Chuyển khoản'),
    (1,  '2025-01-15 09:00:00', 'debit',   2500000, N'Ăn uống gia đình',        N'Ăn uống',         N'Tiền mặt'),
    (1,  '2025-02-05 08:30:00', 'credit', 18000000, N'Lương tháng 2',          N'Thu nhập',        N'Chuyển khoản'),
    (1,  '2025-02-20 16:00:00', 'debit',   3000000, N'Học phí con',             N'Giáo dục',        N'Chuyển khoản'),

    -- Lợi (TK 4 - payment)
    (4,  '2025-01-05 08:00:00', 'credit', 42000000, N'Lương bác sĩ tháng 1',   N'Thu nhập',        N'Chuyển khoản'),
    (4,  '2025-01-12 11:30:00', 'debit',   8000000, N'Tiền nhà',                N'Nhà ở',           N'Chuyển khoản'),
    (4,  '2025-01-20 10:00:00', 'credit',  5000000, N'Khám ngoài giờ',          N'Thu nhập',        N'Tiền mặt'),
    (4,  '2025-02-05 08:00:00', 'credit', 42000000, N'Lương bác sĩ tháng 2',   N'Thu nhập',        N'Chuyển khoản'),

    -- Huy (TK 12 - payment)
    (12, '2025-01-10 09:00:00', 'credit', 15000000, N'Thu nhập tháng 1',       N'Thu nhập',        N'Chuyển khoản'),
    (12, '2025-01-15 12:00:00', 'debit',   2000000, N'Chi tiêu sinh hoạt',      N'Sinh hoạt',       N'Tiền mặt'),
    (12, '2025-01-25 18:00:00', 'debit',   1500000, N'Nộp học phí',             N'Giáo dục',        N'Chuyển khoản'),
    (12, '2025-02-10 09:00:00', 'credit', 15000000, N'Thu nhập tháng 2',       N'Thu nhập',        N'Chuyển khoản'),
    (12, '2025-02-14 20:00:00', 'debit',    500000, N'Mua sắm Valentine',       N'Mua sắm',         N'NAPAS'),
    (12, '2025-03-10 09:00:00', 'credit', 15000000, N'Thu nhập tháng 3',       N'Thu nhập',        N'Chuyển khoản'),
    (12, '2025-03-20 15:00:00', 'debit',   3000000, N'Chuyển khoản cho Lâm',   N'Chuyển khoản',    N'Chuyển khoản'),

    -- Phong (TK 9 - payment)
    (9,  '2025-01-05 08:00:00', 'credit', 28000000, N'Lương tháng 1',          N'Thu nhập',        N'Chuyển khoản'),
    (9,  '2025-01-18 14:00:00', 'debit',   5000000, N'Chi phí sinh hoạt',       N'Sinh hoạt',       N'Tiền mặt'),

    -- Dũng (TK 17 - payment)
    (17, '2025-01-05 08:00:00', 'credit', 55000000, N'Lương tháng 1',          N'Thu nhập',        N'Chuyển khoản'),
    (17, '2025-01-08 10:00:00', 'credit',  3000000, N'Nhận từ Huy',             N'Chuyển khoản',    N'Chuyển khoản'),
    (17, '2025-02-05 08:00:00', 'credit', 55000000, N'Lương tháng 2',          N'Thu nhập',        N'Chuyển khoản'),
    (17, '2025-02-15 09:00:00', 'debit',  15000000, N'Đầu tư chứng khoán',     N'Đầu tư',          N'Chuyển khoản');
GO
