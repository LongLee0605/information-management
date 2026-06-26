/*
===============================================================================
Author      : 26410067 - Lê Trần Đăng Long
File        : V9__LongLTD__Create__View_TaiKhoan.sql
Part        : 3.2 - View TaiKhoan
Purpose     : Tạo View hiển thị tài khoản kèm thông tin khách hàng

Yêu cầu đề bài:
- Phụ thuộc: KhachHang (V5), TaiKhoan (V6)
- Tạo view VW_TaiKhoan với SoDuKhaDung và alias SoDuPhongToa
===============================================================================
*/

USE QLTT;
GO

IF OBJECT_ID('dbo.VW_TaiKhoan', 'V') IS NOT NULL
    DROP VIEW dbo.VW_TaiKhoan;
GO

CREATE VIEW dbo.VW_TaiKhoan
AS
SELECT
    tk.MaTaiKhoan,
    tk.SoTaiKhoan,
    tk.LoaiTaiKhoan,
    tk.NhanLoaiTaiKhoan,
    tk.SoDuHienTai,
    tk.SoDuDongBang,
    tk.SoDuDongBang AS SoDuPhongToa,
    CASE
        WHEN tk.SoDuHienTai >= tk.SoDuDongBang THEN tk.SoDuHienTai - tk.SoDuDongBang
        ELSE 0
    END AS SoDuKhaDung,
    tk.TrangThai,
    tk.NganHang,
    tk.LaTaiKhoanChinh,
    kh.MaKhachHang,
    kh.HoTen,
    kh.CCCD,
    kh.DienThoai,
    kh.Email,
    tk.CIF
FROM dbo.TaiKhoan tk
INNER JOIN dbo.KhachHang kh ON kh.MaKhachHang = tk.MaKhachHang;
GO

/*
===============================================================================
Create SP SP_TaiKhoan_LayTheoMa
Purpose     : Lấy chi tiết tài khoản theo MaTaiKhoan (GET/POST /api/accounts/:id)
===============================================================================
*/

IF OBJECT_ID('dbo.SP_TaiKhoan_LayTheoMa', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_TaiKhoan_LayTheoMa;
GO

CREATE PROCEDURE dbo.SP_TaiKhoan_LayTheoMa
    @MaTaiKhoan INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        v.MaTaiKhoan,
        v.SoTaiKhoan,
        v.LoaiTaiKhoan,
        v.NhanLoaiTaiKhoan,
        v.SoDuHienTai,
        v.SoDuDongBang,
        v.SoDuPhongToa,
        v.SoDuKhaDung,
        v.TrangThai,
        v.NganHang,
        v.LaTaiKhoanChinh,
        v.MaKhachHang,
        v.HoTen,
        v.CCCD,
        v.DienThoai,
        v.Email,
        v.CIF
    FROM dbo.VW_TaiKhoan v
    WHERE v.MaTaiKhoan = @MaTaiKhoan;
END;
GO
