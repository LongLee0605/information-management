/*
===============================================================================
Author      : 26410089 - Nguyễn Lê Hoài Phong
File        : V10__PhongNLH__Create__View_GiaoDich.sql
Part        : 3.3 - View GiaoDich
Purpose     : Tạo View hiển thị giao dịch kèm thông tin tài khoản và khách hàng

Yêu cầu đề bài:
- Phụ thuộc: KhachHang (V5), TaiKhoan (V6), GiaoDich (V7)
- Tạo view VW_GiaoDich join TaiKhoan và KhachHang
===============================================================================
*/

USE QLTT;
GO

IF OBJECT_ID('dbo.VW_GiaoDich', 'V') IS NOT NULL
    DROP VIEW dbo.VW_GiaoDich;
GO

CREATE VIEW dbo.VW_GiaoDich
AS
SELECT
    gd.MaGiaoDich,
    gd.NgayGiaoDich,
    gd.LoaiGiaoDich,
    gd.SoTien,
    gd.MoTa,
    gd.DanhMuc,
    gd.PhuongThucThanhToan,
    tk.MaTaiKhoan,
    tk.SoTaiKhoan,
    tk.CIF,
    tk.LoaiTaiKhoan,
    tk.NganHang,
    kh.MaKhachHang,
    kh.HoTen,
    kh.DienThoai,
    kh.Email
FROM dbo.GiaoDich gd
INNER JOIN dbo.TaiKhoan tk ON tk.MaTaiKhoan = gd.MaTaiKhoan
INNER JOIN dbo.KhachHang kh ON kh.MaKhachHang = tk.MaKhachHang;
GO

/*
===============================================================================
Create SP SP_GiaoDich_LayTheoMa
Purpose     : Lấy chi tiết giao dịch theo MaGiaoDich (GET/POST /api/transactions/:id)
===============================================================================
*/

IF OBJECT_ID('dbo.SP_GiaoDich_LayTheoMa', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_GiaoDich_LayTheoMa;
GO

CREATE PROCEDURE dbo.SP_GiaoDich_LayTheoMa
    @MaGiaoDich INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        v.MaGiaoDich,
        v.NgayGiaoDich,
        v.LoaiGiaoDich,
        v.SoTien,
        v.MoTa,
        v.DanhMuc,
        v.PhuongThucThanhToan,
        v.MaTaiKhoan,
        v.SoTaiKhoan,
        v.CIF,
        v.LoaiTaiKhoan,
        v.NganHang,
        v.MaKhachHang,
        v.HoTen,
        v.DienThoai,
        v.Email
    FROM dbo.VW_GiaoDich v
    WHERE v.MaGiaoDich = @MaGiaoDich;
END;
GO
