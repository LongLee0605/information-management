-- =============================================================================
-- V10__PhongNLH__Create__View_GiaoDich.sql
-- Tạo View hiển thị giao dịch kèm thông tin tài khoản và khách hàng
-- Phụ thuộc: KhachHang (V5), TaiKhoan (V6), GiaoDich (V7)
-- =============================================================================

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
