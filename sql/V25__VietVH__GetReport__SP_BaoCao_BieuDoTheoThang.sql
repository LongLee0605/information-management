-- =============================================================================
-- V25__VietVH__GetReport__SP_BaoCao_BieuDoTheoThang.sql
-- SP báo cáo biểu đồ thu chi theo tháng (line chart data)
-- =============================================================================

USE QLTT;
GO

IF OBJECT_ID('dbo.SP_BaoCao_BieuDoTheoThang', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_BaoCao_BieuDoTheoThang;
GO

CREATE PROCEDURE dbo.SP_BaoCao_BieuDoTheoThang
    @MaKhachHang    INT     = NULL,   -- NULL = tất cả khách hàng
    @Nam            INT     = NULL    -- NULL = năm hiện tại
AS
BEGIN
    SET NOCOUNT ON;

    IF @Nam IS NULL SET @Nam = YEAR(GETDATE());

    SELECT
        YEAR(gd.NgayGiaoDich)                                               AS Nam,
        MONTH(gd.NgayGiaoDich)                                              AS Thang,
        FORMAT(gd.NgayGiaoDich, 'yyyy-MM')                                  AS NamThang,
        SUM(CASE WHEN gd.LoaiGiaoDich = 'credit' THEN gd.SoTien ELSE 0 END) AS TongThu,
        SUM(CASE WHEN gd.LoaiGiaoDich = 'debit'  THEN gd.SoTien ELSE 0 END) AS TongChi,
        COUNT(*)                                                             AS SoGiaoDich
    FROM dbo.GiaoDich gd
    INNER JOIN dbo.TaiKhoan tk ON tk.MaTaiKhoan = gd.MaTaiKhoan
    WHERE
        YEAR(gd.NgayGiaoDich) = @Nam
        AND (@MaKhachHang IS NULL OR tk.MaKhachHang = @MaKhachHang)
    GROUP BY
        YEAR(gd.NgayGiaoDich),
        MONTH(gd.NgayGiaoDich),
        FORMAT(gd.NgayGiaoDich, 'yyyy-MM')
    ORDER BY Nam, Thang;
END;
GO
