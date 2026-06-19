-- =============================================================================
-- V14__LoiLCA__Insert__SampleData_TaiKhoan.sql
-- Chèn dữ liệu mẫu vào bảng TaiKhoan — mỗi KH một CIF riêng
-- Idempotent: chỉ INSERT khi chưa có dữ liệu mẫu
-- =============================================================================

USE QLTT;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.TaiKhoan WHERE SoTaiKhoan = '01234567890')
BEGIN
    INSERT INTO dbo.TaiKhoan (MaKhachHang, CIF, SoTaiKhoan, LoaiTaiKhoan, NhanLoaiTaiKhoan, SoDuHienTai, SoDuDongBang, TrangThai, NganHang, LaTaiKhoanChinh)
    VALUES
        (1, '26410052', '01234567890', 'payment',  N'Tài khoản thanh toán', 37900000,  1895000, 'active', N'OCB',         1),
        (1, '26410052', '01234569001', 'savings',  N'Tài khoản tiết kiệm',  24635000,  0,       'active', N'OCB',         0),

        (2, '26410064', '09876543210', 'payment',  N'Tài khoản thanh toán', 166000000, 8300000, 'active', N'TPBank',      1),
        (2, '26410064', '09876544321', 'savings',  N'Tài khoản tiết kiệm',   85000000, 0,       'active', N'TPBank',      0),

        (3, '26410082', '07654321098', 'payment',  N'Tài khoản thanh toán',  52000000, 2600000, 'active', N'Vietcombank', 1),

        (4, '26410138', '05432109876', 'payment',  N'Tài khoản thanh toán',  12500000, 625000,  'active', N'BIDV',        1),

        (5, '26410089', '03210987654', 'payment',  N'Tài khoản thanh toán',  45000000, 2250000, 'active', N'VietinBank',  1),
        (5, '26410089', '03210988765', 'savings',  N'Tài khoản tiết kiệm',   30000000, 0,       'active', N'VietinBank',  0),

        (6, '26410156', '02109876543', 'payment',  N'Tài khoản thanh toán',  28000000, 1400000, 'active', N'MB Bank',     1),

        (7, '26410051', '08765432109', 'payment',  N'Tài khoản thanh toán',  18500000, 925000,  'active', N'VPBank',      1),
        (7, '26410051', '08765433210', 'savings',  N'Tài khoản tiết kiệm',   10000000, 0,       'active', N'VPBank',      0),

        (8, '26410005', '04321098765', 'payment',  N'Tài khoản thanh toán',   9800000, 490000,  'active', N'ACB',         1),

        (9, '26410067', '06543210987', 'payment',  N'Tài khoản thanh toán',  32000000, 1600000, 'active', N'Sacombank',   1),
        (9, '26410067', '06543211098', 'savings',  N'Tài khoản tiết kiệm',   15000000, 0,       'active', N'Sacombank',   0),

        (10, '26410198', '00123456789', 'payment', N'Tài khoản thanh toán', 210000000, 10500000,'active', N'Techcombank', 1),
        (10, '26410198', '00123457890', 'savings', N'Tài khoản tiết kiệm',  120000000, 0,       'active', N'Techcombank', 0);
END;
GO
