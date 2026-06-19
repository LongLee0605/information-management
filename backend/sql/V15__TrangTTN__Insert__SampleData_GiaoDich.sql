-- =============================================================================
-- V15__TrangTTN__Insert__SampleData_GiaoDich.sql
-- Chèn dữ liệu mẫu vào bảng GiaoDich
-- =============================================================================

USE QLTT;
GO

INSERT INTO dbo.GiaoDich (MaTaiKhoan, NgayGiaoDich, LoaiGiaoDich, SoTien, MoTa, DanhMuc, PhuongThucThanhToan)
VALUES
    (1, '2025-01-05 08:30:00', 'credit', 18000000, N'Lương tháng 1',          N'Thu nhập',        N'Chuyển khoản'),
    (1, '2025-01-10 14:20:00', 'debit',   5000000, N'Tiền nhà tháng 1',        N'Nhà ở',           N'Chuyển khoản'),
    (1, '2025-01-15 09:00:00', 'debit',   2500000, N'Ăn uống gia đình',        N'Ăn uống',         N'Tiền mặt'),
    (1, '2025-02-05 08:30:00', 'credit', 18000000, N'Lương tháng 2',          N'Thu nhập',        N'Chuyển khoản'),
    (1, '2025-02-20 16:00:00', 'debit',   3000000, N'Học phí con',             N'Giáo dục',        N'Chuyển khoản'),

    (3, '2025-01-05 08:00:00', 'credit', 42000000, N'Lương bác sĩ tháng 1',   N'Thu nhập',        N'Chuyển khoản'),
    (3, '2025-01-12 11:30:00', 'debit',   8000000, N'Tiền nhà',                N'Nhà ở',           N'Chuyển khoản'),
    (3, '2025-01-20 10:00:00', 'credit',  5000000, N'Khám ngoài giờ',          N'Thu nhập',        N'Tiền mặt'),
    (3, '2025-02-05 08:00:00', 'credit', 42000000, N'Lương bác sĩ tháng 2',   N'Thu nhập',        N'Chuyển khoản'),

    (6, '2025-01-10 09:00:00', 'credit', 15000000, N'Thu nhập tháng 1',       N'Thu nhập',        N'Chuyển khoản'),
    (6, '2025-01-15 12:00:00', 'debit',   2000000, N'Chi tiêu sinh hoạt',      N'Sinh hoạt',       N'Tiền mặt'),
    (6, '2025-01-25 18:00:00', 'debit',   1500000, N'Nộp học phí',             N'Giáo dục',        N'Chuyển khoản'),
    (6, '2025-02-10 09:00:00', 'credit', 15000000, N'Thu nhập tháng 2',       N'Thu nhập',        N'Chuyển khoản'),
    (6, '2025-02-14 20:00:00', 'debit',    500000, N'Mua sắm Valentine',       N'Mua sắm',         N'NAPAS'),
    (6, '2025-03-10 09:00:00', 'credit', 15000000, N'Thu nhập tháng 3',       N'Thu nhập',        N'Chuyển khoản'),
    (6, '2025-03-20 15:00:00', 'debit',   3000000, N'Chuyển khoản cho Lâm',   N'Chuyển khoản',    N'Chuyển khoản'),

    (7, '2025-01-05 08:00:00', 'credit', 28000000, N'Lương tháng 1',          N'Thu nhập',        N'Chuyển khoản'),
    (7, '2025-01-18 14:00:00', 'debit',   5000000, N'Chi phí sinh hoạt',       N'Sinh hoạt',       N'Tiền mặt'),

    (11, '2025-01-05 08:00:00', 'credit', 55000000, N'Lương tháng 1',          N'Thu nhập',        N'Chuyển khoản'),
    (11, '2025-01-08 10:00:00', 'credit',  3000000, N'Nhận từ Huy',             N'Chuyển khoản',    N'Chuyển khoản'),
    (11, '2025-02-05 08:00:00', 'credit', 55000000, N'Lương tháng 2',          N'Thu nhập',        N'Chuyển khoản'),
    (11, '2025-02-15 09:00:00', 'debit',  15000000, N'Đầu tư chứng khoán',     N'Đầu tư',          N'Chuyển khoản');
GO
