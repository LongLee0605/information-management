-- =============================================================================
-- V30__LongLTD__GetReport__SP_MoneyFlowTrace_RealTransfers.sql
-- SP: dbo.SP_TruyVetDongTien — truy vết thực tế + giới hạn 2–3 người/cấp F
-- Backfill MaTaiKhoanDich cho giao dịch chuyển khoản đã có
-- =============================================================================

USE QLTT;
GO

UPDATE d
SET d.MaTaiKhoanDich = matched.MaTaiKhoan
FROM dbo.GiaoDich d
CROSS APPLY (
    SELECT TOP 1 c.MaTaiKhoan
    FROM dbo.GiaoDich c
    WHERE c.LoaiGiaoDich = 'credit'
      AND c.SoTien = d.SoTien
      AND ABS(DATEDIFF(SECOND, c.NgayGiaoDich, d.NgayGiaoDich)) <= 30
      AND c.MaTaiKhoan <> d.MaTaiKhoan
    ORDER BY ABS(DATEDIFF(MILLISECOND, c.NgayGiaoDich, d.NgayGiaoDich))
) matched
WHERE d.LoaiGiaoDich = 'debit'
  AND d.MaTaiKhoanDich IS NULL
  AND d.DanhMuc = N'Chuyển khoản';
GO

IF OBJECT_ID('dbo.SP_TruyVetDongTien', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_TruyVetDongTien;
GO

CREATE PROCEDURE dbo.SP_TruyVetDongTien
    @MaKhachHang    INT             = NULL,
    @MaTaiKhoan     INT             = NULL,
    @CIFGoc         VARCHAR(20)     = NULL,
    @SoTaiKhoan     VARCHAR(20)     = NULL,
    @TuNgay         DATE            = NULL,
    @DenNgay        DATE            = NULL,
    @MaxLevel       INT             = 3,
    @SoTienNguong   DECIMAL(18,2)   = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @TuNgay IS NULL SET @TuNgay = CAST(DATEADD(MONTH, -12, GETDATE()) AS DATE);
    IF @DenNgay IS NULL SET @DenNgay = CAST(GETDATE() AS DATE);
    IF @TuNgay > @DenNgay
    BEGIN
        DECLARE @Swap DATE = @TuNgay;
        SET @TuNgay = @DenNgay;
        SET @DenNgay = @Swap;
    END;
    IF @MaxLevel IS NULL OR @MaxLevel < 1 SET @MaxLevel = 3;
    IF @MaxLevel > 5 SET @MaxLevel = 5;

    DECLARE @RootMaTaiKhoan INT;

    SELECT TOP 1
        @RootMaTaiKhoan = tk.MaTaiKhoan
    FROM dbo.TaiKhoan tk
    WHERE
        (@MaTaiKhoan IS NOT NULL AND tk.MaTaiKhoan = @MaTaiKhoan)
        OR (@MaTaiKhoan IS NULL AND @SoTaiKhoan IS NOT NULL AND tk.SoTaiKhoan = @SoTaiKhoan)
        OR (@MaTaiKhoan IS NULL AND @SoTaiKhoan IS NULL AND @CIFGoc IS NOT NULL AND tk.CIF = @CIFGoc)
        OR (@MaTaiKhoan IS NULL AND @SoTaiKhoan IS NULL AND @CIFGoc IS NULL AND @MaKhachHang IS NOT NULL AND tk.MaKhachHang = @MaKhachHang)
    ORDER BY
        tk.LaTaiKhoanChinh DESC,
        CASE WHEN tk.LoaiTaiKhoan = 'payment' THEN 0 ELSE 1 END,
        tk.MaTaiKhoan;

    IF @RootMaTaiKhoan IS NULL
        RETURN;

    DECLARE @RootMaKhachHang INT;

    SELECT @RootMaKhachHang = tk.MaKhachHang
    FROM dbo.TaiKhoan tk
    WHERE tk.MaTaiKhoan = @RootMaTaiKhoan;

    ;WITH Trace AS (
        SELECT
            0                                                   AS CapDo,
            tk.MaTaiKhoan,
            CAST(NULL AS INT)                                   AS MaTaiKhoanNguon,
            tk.MaKhachHang,
            tk.CIF,
            tk.SoTaiKhoan,
            tk.NganHang,
            kh.HoTen,
            CAST(NULL AS INT)                                   AS MaGiaoDich,
            CAST(NULL AS DECIMAL(18,2))                         AS SoTien,
            CAST(NULL AS DATETIME2(0))                          AS NgayGiaoDich,
            CAST(NULL AS NVARCHAR(500))                         AS MoTa,
            CAST(NULL AS NVARCHAR(100))                         AS DanhMuc,
            CAST(NULL AS NVARCHAR(50))                          AS PhuongThucThanhToan,
            CAST('root' AS VARCHAR(10))                         AS HuongDongTien,
            CAST(',' + CAST(tk.MaTaiKhoan AS VARCHAR(20)) + ',' AS VARCHAR(MAX)) AS Path
        FROM dbo.TaiKhoan tk
        INNER JOIN dbo.KhachHang kh ON kh.MaKhachHang = tk.MaKhachHang
        WHERE tk.MaTaiKhoan = @RootMaTaiKhoan

        UNION ALL

        SELECT
            t.CapDo + 1,
            tk_d.MaTaiKhoan,
            gd.MaTaiKhoan                                       AS MaTaiKhoanNguon,
            tk_d.MaKhachHang,
            tk_d.CIF,
            tk_d.SoTaiKhoan,
            tk_d.NganHang,
            kh_d.HoTen,
            gd.MaGiaoDich,
            gd.SoTien,
            gd.NgayGiaoDich,
            gd.MoTa,
            gd.DanhMuc,
            gd.PhuongThucThanhToan,
            CAST('outbound' AS VARCHAR(10)),
            t.Path + CAST(tk_d.MaTaiKhoan AS VARCHAR(20)) + ','
        FROM Trace t
        INNER JOIN dbo.GiaoDich gd
            ON gd.MaTaiKhoan = t.MaTaiKhoan
           AND gd.LoaiGiaoDich = 'debit'
           AND gd.MaTaiKhoanDich IS NOT NULL
           AND CAST(gd.NgayGiaoDich AS DATE) BETWEEN @TuNgay AND @DenNgay
           AND (@SoTienNguong IS NULL OR gd.SoTien >= @SoTienNguong)
           AND (
               CHARINDEX(
                   N'[TRUYVET] KH' + CAST(@RootMaKhachHang AS VARCHAR(10)) + N'-F' + CAST(t.CapDo + 1 AS VARCHAR(1)),
                   ISNULL(gd.MoTa, N'')
               ) = 1
               OR (
                   t.CapDo = 0
                   AND CHARINDEX(N'[TRUYVET]', ISNULL(gd.MoTa, N'')) = 0
               )
           )
        INNER JOIN dbo.TaiKhoan tk_d ON tk_d.MaTaiKhoan = gd.MaTaiKhoanDich
        INNER JOIN dbo.KhachHang kh_d ON kh_d.MaKhachHang = tk_d.MaKhachHang
        WHERE t.CapDo < @MaxLevel
          AND tk_d.MaKhachHang <> t.MaKhachHang
          AND CHARINDEX(',' + CAST(tk_d.MaTaiKhoan AS VARCHAR(20)) + ',', t.Path) = 0
    )
    SELECT
        tr.CapDo,
        tr.MaTaiKhoan,
        tr.MaTaiKhoanNguon,
        tr.MaKhachHang,
        tr.CIF,
        tr.HoTen,
        tr.HoTen                                            AS KhachHangNguon,
        tr.SoTaiKhoan,
        tr.SoTaiKhoan                                       AS TaiKhoanNguon,
        tr.NganHang,
        tr.MaGiaoDich,
        tr.SoTien,
        tr.NgayGiaoDich,
        CAST(CAST(tr.NgayGiaoDich AS DATE) AS VARCHAR(10))  AS NgayTu,
        CAST(CAST(tr.NgayGiaoDich AS DATE) AS VARCHAR(10))  AS NgayDen,
        tr.MoTa,
        tr.DanhMuc,
        tr.PhuongThucThanhToan,
        tr.HuongDongTien,
        CASE WHEN tr.CapDo = 0 THEN NULL ELSE 1 END         AS SoGiaoDich
    FROM (
        SELECT
            dedup.*,
            ROW_NUMBER() OVER (
                PARTITION BY dedup.CapDo
                ORDER BY dedup.SoTien DESC, dedup.NgayGiaoDich DESC, dedup.MaGiaoDich
            ) AS levelRank
        FROM (
            SELECT
                tr.*,
                ROW_NUMBER() OVER (
                    PARTITION BY tr.CapDo, ISNULL(tr.MaGiaoDich, tr.MaTaiKhoan)
                    ORDER BY tr.MaTaiKhoanNguon, tr.MaGiaoDich
                ) AS rn,
                ROW_NUMBER() OVER (
                    PARTITION BY tr.CapDo, tr.MaKhachHang
                    ORDER BY tr.SoTien DESC, tr.NgayGiaoDich DESC, tr.MaGiaoDich
                ) AS customerRn
            FROM Trace tr
        ) dedup
        WHERE dedup.rn = 1
          AND (dedup.CapDo = 0 OR dedup.customerRn = 1)
    ) tr
    WHERE tr.CapDo = 0 OR tr.levelRank <= 3
    ORDER BY tr.CapDo, tr.MaTaiKhoanNguon, tr.NgayGiaoDich, tr.MaGiaoDich
    OPTION (MAXRECURSION 200);
END;
GO
