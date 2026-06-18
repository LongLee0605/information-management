-- =============================================================================
-- V24__AnhTPQ__GetReport__SP_BaoCao_TongQuan.sql
-- SP báo cáo tổng quan hệ thống
-- =============================================================================

USE QLTT;
GO

IF OBJECT_ID('dbo.SP_BaoCao_TongQuan', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_BaoCao_TongQuan;
GO

CREATE PROCEDURE dbo.SP_BaoCao_TongQuan
    @TuNgay     DATE = NULL,
    @DenNgay    DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Mặc định: 30 ngày gần nhất
    IF @TuNgay IS NULL  SET @TuNgay  = CAST(DATEADD(DAY, -30, GETDATE()) AS DATE);
    IF @DenNgay IS NULL SET @DenNgay = CAST(GETDATE() AS DATE);

    -- Tổng quan khách hàng & tài khoản
    SELECT
        (SELECT COUNT(*) FROM dbo.KhachHang)                                AS TongKhachHang,
        (SELECT COUNT(*) FROM dbo.TaiKhoan WHERE TrangThai = 'active')      AS TaiKhoanActive,
        (SELECT COUNT(*) FROM dbo.TaiKhoan WHERE TrangThai = 'inactive')    AS TaiKhoanInactive,
        (SELECT SUM(SoDuHienTai) FROM dbo.TaiKhoan WHERE TrangThai = 'active') AS TongSoDuHienTai,
        (SELECT SUM(SoDuDongBang) FROM dbo.TaiKhoan WHERE TrangThai = 'inactive') AS TongSoDuDongBang;

    -- Giao dịch trong kỳ
    SELECT
        COUNT(*)                                                            AS TongGiaoDich,
        SUM(CASE WHEN LoaiGiaoDich = 'credit' THEN SoTien ELSE 0 END)      AS TongThu,
        SUM(CASE WHEN LoaiGiaoDich = 'debit'  THEN SoTien ELSE 0 END)      AS TongChi,
        SUM(CASE WHEN LoaiGiaoDich = 'credit' THEN SoTien ELSE -SoTien END) AS ChenhLech
    FROM dbo.GiaoDich
    WHERE CAST(NgayGiaoDich AS DATE) BETWEEN @TuNgay AND @DenNgay;

    -- Top 5 danh mục chi tiêu
    SELECT TOP 5
        DanhMuc,
        COUNT(*)        AS SoGiaoDich,
        SUM(SoTien)     AS TongTien
    FROM dbo.GiaoDich
    WHERE LoaiGiaoDich = 'debit'
      AND CAST(NgayGiaoDich AS DATE) BETWEEN @TuNgay AND @DenNgay
      AND DanhMuc IS NOT NULL
    GROUP BY DanhMuc
    ORDER BY TongTien DESC;
END;
GO
