-- =============================================================================
-- V14__LoiLCA__Insert__SampleData_TaiKhoan.sql
-- Chèn dữ liệu mẫu vào bảng TaiKhoan
-- Dựa theo src/data/customerBankAccounts.json
-- =============================================================================

USE QLTT;
GO

-- Giả định MaKhachHang theo thứ tự INSERT ở V13:
-- 1=Lâm, 2=Lợi, 3=Nhân, 4=Trang, 5=Phong, 6=Việt, 7=Huy, 8=Anh, 9=Long, 10=Dũng

INSERT INTO dbo.TaiKhoan (MaKhachHang, CIF, SoTaiKhoan, LoaiTaiKhoan, NhanLoaiTaiKhoan, SoDuHienTai, SoDuDongBang, TrangThai, NganHang, LaTaiKhoanChinh)
VALUES
    -- Lê Phước Lâm (MaKH=1)
    (1, '26410052', '01234567890', 'payment',  N'Tài khoản thanh toán', 37900000,  1895000, 'active', N'OCB',    1),
    (1, '26410052', '01234569001', 'savings',  N'Tài khoản tiết kiệm',  24635000,  0,       'active', N'OCB',    0),
    (1, '26410052', '01234570112', 'debit',    N'Tài khoản ghi nợ',      5685000,  3032000, 'active', N'OCB',    0),

    -- Lê Công Anh Lợi (MaKH=2)
    (2, '26410064', '09876543210', 'payment',  N'Tài khoản thanh toán', 166000000, 8300000, 'active', N'TPBank', 1),
    (2, '26410064', '09876544321', 'savings',  N'Tài khoản tiết kiệm',   85000000, 0,       'active', N'TPBank', 0),

    -- Phan Thanh Nhân (MaKH=3)
    (3, '26410082', '07654321098', 'payment',  N'Tài khoản thanh toán',  52000000, 2600000, 'active', N'Vietcombank', 1),
    (3, '26410082', '07654322109', 'overdraft',N'Tài khoản thấu chi',     8500000, 4250000, 'active', N'Vietcombank', 0),

    -- Trần Thị Ngọc Trang (MaKH=4)
    (4, '26410138', '05432109876', 'payment',  N'Tài khoản thanh toán',  12500000, 625000,  'active', N'BIDV',   1),

    -- Nguyễn Lê Hoài Phong (MaKH=5)
    (5, '26410089', '03210987654', 'payment',  N'Tài khoản thanh toán',  45000000, 2250000, 'active', N'VietinBank', 1),
    (5, '26410089', '03210988765', 'savings',  N'Tài khoản tiết kiệm',   30000000, 0,       'active', N'VietinBank', 0),

    -- Võ Hoàng Việt (MaKH=6)
    (6, '26410156', '02109876543', 'payment',  N'Tài khoản thanh toán',  28000000, 1400000, 'active', N'MB Bank', 1),

    -- Trần Nguyễn Đăng Huy (MaKH=7)
    (7, '26410051', '08765432109', 'payment',  N'Tài khoản thanh toán',  18500000, 925000,  'active', N'VPBank',  1),
    (7, '26410051', '08765433210', 'savings',  N'Tài khoản tiết kiệm',   10000000, 0,       'active', N'VPBank',  0),

    -- Trần Phúc Quyền Anh (MaKH=8)
    (8, '26410005', '04321098765', 'payment',  N'Tài khoản thanh toán',   9800000, 490000,  'active', N'ACB',    1),

    -- Lê Trần Đăng Long (MaKH=9)
    (9, '26410067', '06543210987', 'payment',  N'Tài khoản thanh toán',  32000000, 1600000, 'active', N'Sacombank', 1),
    (9, '26410067', '06543211098', 'savings',  N'Tài khoản tiết kiệm',   15000000, 0,       'active', N'Sacombank', 0),

    -- Nguyễn Quốc Dũng (MaKH=10)
    (10, '26410064', '00123456789', 'payment', N'Tài khoản thanh toán', 210000000, 10500000,'active', N'Techcombank', 1),
    (10, '26410064', '00123457890', 'savings', N'Tài khoản tiết kiệm',  120000000, 0,       'active', N'Techcombank', 0);
GO
