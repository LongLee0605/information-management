-- =============================================================================
-- V26__LongLTD__GetReport__SP_BaoCao_PieChart.sql
-- SP báo cáo phân bổ danh mục (pie chart data)
-- =============================================================================

USE QLTT;
GO

IF OBJECT_ID('dbo.SP_BaoCao_PieChart', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_BaoCao_PieChart;
GO

CREATE PROCEDURE dbo.SP_BaoCao_PieChart
    @MaKhachHang    INT             = NULL,
    @LoaiGiaoDich   VARCHAR(10)     = 'debit',  -- 'credit' hoặc 'debit'
    @TuNgay         DATE            = NULL,
    @DenNgay        DATE            = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @TuNgay  IS NULL SET @TuNgay  = CAST(DATEADD(MONTH, -12, GETDATE()) AS DATE);
    IF @DenNgay IS NULL SET @DenNgay = CAST(GETDATE() AS DATE);

    DECLARE @TongTien DECIMAL(18,2);

    SELECT @TongTien = SUM(gd.SoTien)
    FROM dbo.GiaoDich gd
    INNER JOIN dbo.TaiKhoan tk ON tk.MaTaiKhoan = gd.MaTaiKhoan
    WHERE gd.LoaiGiaoDich = @LoaiGiaoDich
      AND CAST(gd.NgayGiaoDich AS DATE) BETWEEN @TuNgay AND @DenNgay
      AND (@MaKhachHang IS NULL OR tk.MaKhachHang = @MaKhachHang);

    SELECT
        ISNULL(gd.DanhMuc, N'Khác')                                         AS DanhMuc,
        SUM(gd.SoTien)                                                      AS TongTien,
        CAST(SUM(gd.SoTien) * 100.0 / NULLIF(@TongTien, 0) AS DECIMAL(5,2)) AS TyLePhanTram,
        COUNT(*)                                                             AS SoGiaoDich
    FROM dbo.GiaoDich gd
    INNER JOIN dbo.TaiKhoan tk ON tk.MaTaiKhoan = gd.MaTaiKhoan
    WHERE gd.LoaiGiaoDich = @LoaiGiaoDich
      AND CAST(gd.NgayGiaoDich AS DATE) BETWEEN @TuNgay AND @DenNgay
      AND (@MaKhachHang IS NULL OR tk.MaKhachHang = @MaKhachHang)
    GROUP BY ISNULL(gd.DanhMuc, N'Khác')
    ORDER BY TongTien DESC;
END;
GO
