/*
===============================================================================
Author      : 26410005 - Trần Phúc Quyền Anh
File        : V8__AnhTPQ__Create__View_KhachHang.sql
Part        : 3.1 - View KhachHang
Purpose     : Tạo View hiển thị thông tin khách hàng kèm số tài khoản chính

Yêu cầu đề bài:
- Phụ thuộc: KhachHang (V5), TaiKhoan (V6)
- Tạo view VW_KhachHang join tài khoản chính active
===============================================================================
*/

USE QLTT;
GO

IF OBJECT_ID('dbo.VW_KhachHang', 'V') IS NOT NULL
    DROP VIEW dbo.VW_KhachHang;
GO

CREATE VIEW dbo.VW_KhachHang
AS
SELECT
    kh.MaKhachHang,
    kh.HoTen,
    kh.CCCD,
    kh.NgaySinh,
    kh.GioiTinh,
    kh.DienThoai,
    kh.Email,
    kh.DiaChi,
    kh.NoiLamViec,
    kh.TinhTrangHonNhan,
    kh.HocVan,
    kh.ThuNhapTBThang,
    tk.CIF              AS CIFChinh,
    tk.SoTaiKhoan       AS SoTaiKhoanChinh,
    tk.NganHang         AS NganHangChinh,
    tk.SoDuHienTai      AS SoDuTaiKhoanChinh,
    tk.TrangThai        AS TrangThaiTaiKhoanChinh
FROM dbo.KhachHang kh
LEFT JOIN dbo.TaiKhoan tk
    ON tk.MaKhachHang = kh.MaKhachHang
   AND tk.LaTaiKhoanChinh = 1
   AND tk.TrangThai = 'active';
GO

/*
===============================================================================
Create FN FN_KhachHang_TinhPhanHang
Purpose     : Tinh phan hang KH theo so du tai khoan chinh (Diamond/Gold/Silver)
Backend     : GET /api/customers/:id (qua SP_KhachHang_LayTheoMa)
===============================================================================
*/

IF OBJECT_ID('dbo.FN_KhachHang_TinhPhanHang', 'FN') IS NOT NULL
    DROP FUNCTION dbo.FN_KhachHang_TinhPhanHang;
GO

CREATE FUNCTION dbo.FN_KhachHang_TinhPhanHang(@SoDu DECIMAL(18, 2))
RETURNS NVARCHAR(20)
AS
BEGIN
    DECLARE @SILVER_RANK    DECIMAL(18, 2) = 1000000;    -- 1tr
    DECLARE @GOLD_RANK      DECIMAL(18, 2) = 50000000;   -- 50tr
    DECLARE @DIAMOND_RANK   DECIMAL(18, 2) = 100000000;  -- 100tr

    IF @SoDu IS NULL OR @SoDu < @SILVER_RANK
        RETURN NULL;

    IF @SoDu >= @DIAMOND_RANK
        RETURN N'Diamond';

    IF @SoDu >= @GOLD_RANK
        RETURN N'Gold';

    RETURN N'Silver';
END;
GO

/*
===============================================================================
Update SP SP_KhachHang_LayTheoMa (override V5)
Purpose     : Lay chi tiet KH kem PhanHang tu VW_KhachHang
Backend     : GET /api/customers/:id
===============================================================================
*/

IF OBJECT_ID('dbo.SP_KhachHang_LayTheoMa', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_KhachHang_LayTheoMa;
GO

CREATE PROCEDURE dbo.SP_KhachHang_LayTheoMa
    @MaKhachHang INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        kh.MaKhachHang,
        kh.HoTen,
        kh.CCCD,
        kh.NgaySinh,
        kh.GioiTinh,
        kh.DienThoai,
        kh.Email,
        kh.DiaChi,
        kh.NoiLamViec,
        kh.TinhTrangHonNhan,
        kh.HocVan,
        kh.ThuNhapTBThang,
        kh.IsActive,
        ISNULL(v.SoDuTaiKhoanChinh, 0) AS SoDuTinhPhanHang,
        dbo.FN_KhachHang_TinhPhanHang(v.SoDuTaiKhoanChinh) AS PhanHang
    FROM dbo.KhachHang kh
    LEFT JOIN dbo.VW_KhachHang v
        ON v.MaKhachHang = kh.MaKhachHang
    WHERE kh.MaKhachHang = @MaKhachHang;
END;
GO
