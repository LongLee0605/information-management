-- =============================================================================
-- V8__AnhTPQ__Create__View_KhachHang.sql
-- Tạo View hiển thị thông tin khách hàng kèm số tài khoản chính
-- Phụ thuộc: KhachHang (V5), TaiKhoan (V6)
-- =============================================================================

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
    tk.SoTaiKhoan    AS SoTaiKhoanChinh,
    tk.NganHang      AS NganHangChinh,
    tk.SoDuHienTai   AS SoDuTaiKhoanChinh,
    tk.TrangThai     AS TrangThaiTaiKhoanChinh
FROM dbo.KhachHang kh
LEFT JOIN dbo.TaiKhoan tk
    ON tk.MaKhachHang = kh.MaKhachHang
    AND tk.LaTaiKhoanChinh = 1
    AND tk.TrangThai = 'active';
GO
