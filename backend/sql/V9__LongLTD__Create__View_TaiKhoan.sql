-- =============================================================================
-- V9__LongLTD__Create__View_TaiKhoan.sql
-- Tạo View hiển thị tài khoản kèm thông tin khách hàng
-- Phụ thuộc: KhachHang (V5), TaiKhoan (V6)
-- =============================================================================

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
