/*
===============================================================================
Author      : 26410005 - Trần Phúc Quyền Anh
File        : V24__AnhTPQ__GetReport__SP_BaoCao_TongQuan.sql
Part        : 6.9 - SP_BaoCao_TongQuan
Purpose     : SP báo cáo tổng quan hệ thống

Yêu cầu đề bài:
- Báo cáo tổng quan theo khoảng ngày TuNgay, DenNgay
- Lọc theo CIF tùy chọn (NULL = toàn hệ thống)
===============================================================================
*/

USE QLTT;
GO

IF OBJECT_ID('dbo.SP_BaoCao_TongQuan', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_BaoCao_TongQuan;
GO

CREATE PROCEDURE dbo.SP_BaoCao_TongQuan
    @TuNgay     DATETIME        = NULL,
    @DenNgay    DATETIME        = NULL,
    @CIF        VARCHAR(20)     = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @TuNgay IS NULL
        SET @TuNgay = CAST(DATEADD(DAY, -30, GETDATE()) AS DATE);

    IF @DenNgay IS NULL
        SET @DenNgay = CAST(GETDATE() AS DATE);

    IF @TuNgay > @DenNgay
    BEGIN
        DECLARE @Swap DATETIME = @TuNgay;
        SET @TuNgay = @DenNgay;
        SET @DenNgay = @Swap;
    END;

    SELECT
        COUNT(*) AS TongGiaoDich,
        ISNULL(SUM(CASE WHEN gd.LoaiGiaoDich = 'debit'  THEN gd.SoTien ELSE 0 END), 0) AS TongGhiNo,
        ISNULL(SUM(CASE WHEN gd.LoaiGiaoDich = 'credit' THEN gd.SoTien ELSE 0 END), 0) AS TongGhiCo,
        SUM(CASE WHEN gd.PhuongThucThanhToan = 'NAPAS' THEN 1 ELSE 0 END) AS NapasCount,
        SUM(CASE
            WHEN gd.PhuongThucThanhToan IS NOT NULL AND gd.PhuongThucThanhToan <> 'NAPAS' THEN 1
            ELSE 0
        END) AS NoiBoCount
    FROM dbo.GiaoDich gd
    INNER JOIN dbo.TaiKhoan tk ON tk.MaTaiKhoan = gd.MaTaiKhoan
    WHERE CAST(gd.NgayGiaoDich AS DATE) BETWEEN CAST(@TuNgay AS DATE) AND CAST(@DenNgay AS DATE)
      AND (@CIF IS NULL OR tk.CIF = @CIF);
END;
GO

/*
===============================================================================
Test mẫu - chỉ chạy MANUAL.
- Uncomment block bên dưới để test.
- Happy case: báo cáo tổng quan năm 2025

Cleanup: không cần (read-only)
===============================================================================
*/

-- EXEC dbo.SP_BaoCao_TongQuan @TuNgay = '2025-01-01', @DenNgay = '2025-12-31';

