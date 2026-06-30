/*
===============================================================================
Author      : 26410067 - Lê Trần Đăng Long
File        : V26__LongLTD__Upsert__Reports_MoneyFlow_Accounts.sql
Part        : 6.11 - PieChart + SP_TruyVetDongTien + schema bổ sung
Purpose     : Gộp V26–V32 (cũ): PieChart, schema truy vết, loại TK ghi nợ/thấu chi, SP_TruyVetDongTien, đồng bộ số dư

Yêu cầu đề bài:
- Tạo SP_BaoCao_PieChart
- Tạo SP_TruyVetDongTien
- Bổ sung schema và đồng bộ số dư cho truy vết dòng tiền
===============================================================================
*/

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
    IF @TuNgay > @DenNgay
    BEGIN
        DECLARE @NgayTam DATE = @TuNgay;
        SET @TuNgay = @DenNgay;
        SET @DenNgay = @NgayTam;
    END;
    IF @LoaiGiaoDich NOT IN ('credit', 'debit') SET @LoaiGiaoDich = 'debit';

    DECLARE @TongTien DECIMAL(18,2);

    SELECT @TongTien = SUM(gd.SoTien)
    FROM dbo.GiaoDich gd
    INNER JOIN dbo.TaiKhoan tk ON tk.MaTaiKhoan = gd.MaTaiKhoan
    WHERE gd.LoaiGiaoDich = @LoaiGiaoDich
      AND CAST(gd.NgayGiaoDich AS DATE) BETWEEN @TuNgay AND @DenNgay
      AND (@MaKhachHang IS NULL OR tk.MaKhachHang = @MaKhachHang);

    SELECT
        ISNULL(gd.DanhMuc, N'Khác')                                           AS DanhMuc,
        SUM(gd.SoTien)                                                        AS TongTien,
        CAST(SUM(gd.SoTien) * 100.0 / NULLIF(@TongTien, 0) AS DECIMAL(5,2))  AS TyLePhanTram,
        COUNT(*)                                                               AS SoGiaoDich,
        ISNULL(gd.DanhMuc, N'Khác')                                           AS [name],
        CAST(SUM(gd.SoTien) * 100.0 / NULLIF(@TongTien, 0) AS DECIMAL(5,2))  AS [value]
    FROM dbo.GiaoDich gd
    INNER JOIN dbo.TaiKhoan tk ON tk.MaTaiKhoan = gd.MaTaiKhoan
    WHERE gd.LoaiGiaoDich = @LoaiGiaoDich
      AND CAST(gd.NgayGiaoDich AS DATE) BETWEEN @TuNgay AND @DenNgay
      AND (@MaKhachHang IS NULL OR tk.MaKhachHang = @MaKhachHang)
    GROUP BY ISNULL(gd.DanhMuc, N'Khác')
    ORDER BY TongTien DESC;
END;
GO

-- Schema: GiaoDich.MaTaiKhoanDich
IF COL_LENGTH('dbo.GiaoDich', 'MaTaiKhoanDich') IS NULL
BEGIN
    ALTER TABLE dbo.GiaoDich
        ADD MaTaiKhoanDich INT NULL;

    ALTER TABLE dbo.GiaoDich
        ADD CONSTRAINT FK_GiaoDich_TaiKhoanDich
            FOREIGN KEY (MaTaiKhoanDich) REFERENCES dbo.TaiKhoan (MaTaiKhoan);
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_GiaoDich_MaTaiKhoanDich'
      AND object_id = OBJECT_ID(N'dbo.GiaoDich')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_GiaoDich_MaTaiKhoanDich
        ON dbo.GiaoDich (MaTaiKhoan, MaTaiKhoanDich)
        WHERE MaTaiKhoanDich IS NOT NULL;
END;
GO

-- Loại bỏ tài khoản ghi nợ / thấu chi (idempotent khi nâng cấp DB cũ)
IF OBJECT_ID('dbo.GiaoDich', 'U') IS NOT NULL
BEGIN
    DELETE gd
    FROM dbo.GiaoDich gd
    INNER JOIN dbo.TaiKhoan tk
        ON tk.MaTaiKhoan = gd.MaTaiKhoan
       AND tk.LoaiTaiKhoan IN ('debit', 'overdraft');

    IF COL_LENGTH('dbo.GiaoDich', 'MaTaiKhoanDich') IS NOT NULL
    BEGIN
        DELETE gd
        FROM dbo.GiaoDich gd
        INNER JOIN dbo.TaiKhoan tk
            ON tk.MaTaiKhoan = gd.MaTaiKhoanDich
           AND tk.LoaiTaiKhoan IN ('debit', 'overdraft');
    END;
END;
GO

IF OBJECT_ID('dbo.TaiKhoan', 'U') IS NOT NULL
BEGIN
    DELETE FROM dbo.TaiKhoan
    WHERE LoaiTaiKhoan IN ('debit', 'overdraft');

    IF EXISTS (
        SELECT 1
        FROM sys.check_constraints
        WHERE name = 'CK_TaiKhoan_LoaiTaiKhoan'
          AND parent_object_id = OBJECT_ID('dbo.TaiKhoan')
    )
        ALTER TABLE dbo.TaiKhoan DROP CONSTRAINT CK_TaiKhoan_LoaiTaiKhoan;

    ALTER TABLE dbo.TaiKhoan
        ADD CONSTRAINT CK_TaiKhoan_LoaiTaiKhoan
            CHECK (LoaiTaiKhoan IN ('payment', 'savings'));
END;
GO

-- Backfill MaTaiKhoanDich cho giao dịch chuyển khoản
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
    ),
    Deduped AS (
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
    ),
    Candidates AS (
        SELECT
            d.*,
            ROW_NUMBER() OVER (
                PARTITION BY d.CapDo, ISNULL(d.MaTaiKhoanNguon, @RootMaTaiKhoan)
                ORDER BY d.SoTien DESC, d.NgayGiaoDich DESC, d.MaGiaoDich
            ) AS branchRank
        FROM Deduped d
        WHERE d.rn = 1
          AND (d.CapDo = 0 OR d.customerRn = 1)
    ),
    IncludedF0 AS (
        SELECT c.*
        FROM Candidates c
        WHERE c.CapDo = 0
    ),
    IncludedF1 AS (
        SELECT c.*
        FROM Candidates c
        WHERE c.CapDo = 1
          AND c.MaTaiKhoanNguon = @RootMaTaiKhoan
          AND c.branchRank <= 3
    ),
    IncludedF2 AS (
        SELECT c.*
        FROM Candidates c
        INNER JOIN IncludedF1 p ON p.MaTaiKhoan = c.MaTaiKhoanNguon
        WHERE c.CapDo = 2
          AND c.branchRank <= 3
    ),
    IncludedF3 AS (
        SELECT c.*
        FROM Candidates c
        INNER JOIN IncludedF2 p ON p.MaTaiKhoan = c.MaTaiKhoanNguon
        WHERE c.CapDo = 3
          AND c.branchRank <= 3
    ),
    IncludedF4 AS (
        SELECT c.*
        FROM Candidates c
        INNER JOIN IncludedF3 p ON p.MaTaiKhoan = c.MaTaiKhoanNguon
        WHERE c.CapDo = 4
          AND c.branchRank <= 3
    ),
    IncludedF5 AS (
        SELECT c.*
        FROM Candidates c
        INNER JOIN IncludedF4 p ON p.MaTaiKhoan = c.MaTaiKhoanNguon
        WHERE c.CapDo = 5
          AND c.branchRank <= 3
    ),
    Included AS (
        SELECT * FROM IncludedF0
        UNION ALL SELECT * FROM IncludedF1
        UNION ALL SELECT * FROM IncludedF2
        UNION ALL SELECT * FROM IncludedF3
        UNION ALL SELECT * FROM IncludedF4
        UNION ALL SELECT * FROM IncludedF5
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
    FROM Included tr
    ORDER BY tr.CapDo, tr.MaTaiKhoanNguon, tr.NgayGiaoDich, tr.MaGiaoDich
    OPTION (MAXRECURSION 200);
END;
GO

-- SP: dbo.SP_TaiKhoan_DongBoSoDu
/*
===============================================================================
Update SP SP_TaiKhoan_DongBoSoDu
Purpose     : Dong bo so du tung tai khoan bang Cursor (sau seed giao dich)
Backend     : EXEC trong V27 sau migrate
===============================================================================
*/
IF OBJECT_ID('dbo.SP_TaiKhoan_DongBoSoDu', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_TaiKhoan_DongBoSoDu;
GO

CREATE PROCEDURE dbo.SP_TaiKhoan_DongBoSoDu
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @MaTaiKhoan     INT;
    DECLARE @SoDuKhoiTao    DECIMAL(18, 2);
    DECLARE @TongBienDong   DECIMAL(18, 2);
    DECLARE @SoDuMoi        DECIMAL(18, 2);
    DECLARE @TrangThai      VARCHAR(10);
    DECLARE @SoDuDongBang   DECIMAL(18, 2);

    DECLARE cur CURSOR LOCAL FAST_FORWARD FOR
        SELECT tk.MaTaiKhoan
        FROM dbo.TaiKhoan tk
        INNER JOIN (
            SELECT * FROM (VALUES
                (1,  37900000.00), (2,  24635000.00), (3, 166000000.00), (4,  85000000.00),
                (5,  52000000.00), (6,  12500000.00), (7,  45000000.00), (8,  30000000.00),
                (9,  28000000.00), (10, 18500000.00), (11, 10000000.00), (12,  9800000.00),
                (13, 32000000.00), (14, 15000000.00), (15, 210000000.00), (16, 120000000.00)
            ) AS v(MaTaiKhoan, SoDuKhoiTao)
        ) seed ON seed.MaTaiKhoan = tk.MaTaiKhoan;

    OPEN cur;
    FETCH NEXT FROM cur INTO @MaTaiKhoan;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        SELECT @SoDuKhoiTao = seed.SoDuKhoiTao
        FROM (
            SELECT * FROM (VALUES
                (1,  37900000.00), (2,  24635000.00), (3, 166000000.00), (4,  85000000.00),
                (5,  52000000.00), (6,  12500000.00), (7,  45000000.00), (8,  30000000.00),
                (9,  28000000.00), (10, 18500000.00), (11, 10000000.00), (12,  9800000.00),
                (13, 32000000.00), (14, 15000000.00), (15, 210000000.00), (16, 120000000.00)
            ) AS v(MaTaiKhoan, SoDuKhoiTao)
        ) seed
        WHERE seed.MaTaiKhoan = @MaTaiKhoan;

        SELECT @TongBienDong = ISNULL(SUM(
            CASE WHEN gd.LoaiGiaoDich = 'credit' THEN gd.SoTien ELSE -gd.SoTien END
        ), 0)
        FROM dbo.GiaoDich gd
        WHERE gd.MaTaiKhoan = @MaTaiKhoan;

        SET @SoDuMoi = @SoDuKhoiTao + @TongBienDong;

        SELECT
            @TrangThai    = tk.TrangThai,
            @SoDuDongBang = tk.SoDuDongBang
        FROM dbo.TaiKhoan tk
        WHERE tk.MaTaiKhoan = @MaTaiKhoan;

        UPDATE dbo.TaiKhoan
        SET
            SoDuHienTai = @SoDuMoi,
            SoDuDongBang = CASE
                WHEN @TrangThai = 'inactive' THEN @SoDuMoi
                WHEN @SoDuDongBang > @SoDuMoi THEN @SoDuMoi
                ELSE @SoDuDongBang
            END
        WHERE MaTaiKhoan = @MaTaiKhoan;

        FETCH NEXT FROM cur INTO @MaTaiKhoan;
    END;

    CLOSE cur;
    DEALLOCATE cur;
END;
GO

/*
===============================================================================
Test mẫu - chỉ chạy MANUAL.
- Uncomment block bên dưới để test.
- Happy case: truy vết dòng tiền theo CIF seed [TRUYVET] (sau V27)

Cleanup: không cần (read-only)
===============================================================================
*/

-- EXEC dbo.SP_TruyVetDongTien @CIFGoc = '26410052', @TuNgay = '2025-01-01', @DenNgay = '2025-12-31', @MaxLevel = 3;
