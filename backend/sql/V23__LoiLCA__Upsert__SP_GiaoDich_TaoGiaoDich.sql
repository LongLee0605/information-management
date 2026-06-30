/*
===============================================================================
Author      : 26410064 - Lê Công Anh Lợi
File        : V23__LoiLCA__Upsert__SP_GiaoDich_TaoGiaoDich.sql
Part        : 6.8 - SP_GiaoDich_TaoGiaoDich
Purpose     : SP tạo giao dịch và cập nhật số dư

Yêu cầu đề bài:
- Design: SP_DESIGN.md — V23 | Backend: POST /api/transactions
- Thêm cột MaTaiKhoanDich nếu chưa có
- Tạo giao dịch credit/debit và cập nhật số dư tài khoản
===============================================================================
*/

USE QLTT;
GO

IF COL_LENGTH('dbo.GiaoDich', 'MaTaiKhoanDich') IS NULL
BEGIN
    ALTER TABLE dbo.GiaoDich
        ADD MaTaiKhoanDich INT NULL;

    ALTER TABLE dbo.GiaoDich
        ADD CONSTRAINT FK_GiaoDich_TaiKhoanDich
            FOREIGN KEY (MaTaiKhoanDich) REFERENCES dbo.TaiKhoan (MaTaiKhoan);
END;
GO

IF OBJECT_ID('dbo.SP_GiaoDich_TaoGiaoDich', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_GiaoDich_TaoGiaoDich;
GO

CREATE PROCEDURE dbo.SP_GiaoDich_TaoGiaoDich
    @MaTaiKhoan             INT,
    @LoaiGiaoDich           VARCHAR(10),
    @SoTien                 DECIMAL(18,2),
    @MoTa                   NVARCHAR(500)   = NULL,
    @DanhMuc                NVARCHAR(100)   = NULL,
    @PhuongThucThanhToan    NVARCHAR(50)    = NULL,
    @MaTaiKhoanDich         INT             = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        IF @LoaiGiaoDich NOT IN ('credit', 'debit')
            THROW 50040, N'LoaiGiaoDich chi chap nhan ''credit'' hoac ''debit''.', 1;

        IF @SoTien IS NULL OR @SoTien <= 0
            THROW 50041, N'SoTien phai lon hon 0.', 1;

        IF @MaTaiKhoanDich IS NOT NULL AND @LoaiGiaoDich <> 'debit'
            THROW 50047, N'MaTaiKhoanDich chi ap dung cho giao dich debit.', 1;

        IF @MaTaiKhoanDich = @MaTaiKhoan
            THROW 50046, N'Tai khoan dich phai khac tai khoan nguon.', 1;

        DECLARE @TrangThai      VARCHAR(10);
        DECLARE @MaKhachHang    INT;
        DECLARE @SoDuHienTai    DECIMAL(18,2);
        DECLARE @SoDuDongBang   DECIMAL(18,2);

        SELECT
            @TrangThai    = tk.TrangThai,
            @MaKhachHang  = tk.MaKhachHang,
            @SoDuHienTai  = tk.SoDuHienTai,
            @SoDuDongBang = tk.SoDuDongBang
        FROM dbo.TaiKhoan tk
        WHERE tk.MaTaiKhoan = @MaTaiKhoan;

        IF @TrangThai IS NULL
            THROW 50042, N'Khong tim thay TaiKhoan.', 1;

        IF @TrangThai = 'inactive'
            THROW 50043, N'Tai khoan dang bi khoa, khong the thuc hien giao dich.', 1;

        IF @MaTaiKhoanDich IS NOT NULL
        BEGIN
            DECLARE @DichTrangThai  VARCHAR(10);
            DECLARE @DichMaKH       INT;

            SELECT
                @DichTrangThai = tk.TrangThai,
                @DichMaKH      = tk.MaKhachHang
            FROM dbo.TaiKhoan tk
            WHERE tk.MaTaiKhoan = @MaTaiKhoanDich;

            IF @DichTrangThai IS NULL
                THROW 50045, N'Khong tim thay tai khoan dich.', 1;

            IF @DichTrangThai = 'inactive'
                THROW 50048, N'Tai khoan dich dang bi khoa.', 1;

            IF @DichMaKH = @MaKhachHang
                THROW 50049, N'Khong the chuyen tien giua cac tai khoan cung khach hang.', 1;
        END;

        IF @LoaiGiaoDich = 'debit'
        BEGIN
            DECLARE @SoDuKhaDung DECIMAL(18,2) = dbo.FN_TaiKhoan_TinhSoDuKhaDung(@SoDuHienTai, @SoDuDongBang);
            IF @SoDuKhaDung < @SoTien
                THROW 50044, N'So du kha dung khong du de thuc hien giao dich.', 1;
        END;

        BEGIN TRANSACTION;

        INSERT INTO dbo.GiaoDich (
            MaTaiKhoan,
            MaTaiKhoanDich,
            LoaiGiaoDich,
            SoTien,
            MoTa,
            DanhMuc,
            PhuongThucThanhToan
        )
        VALUES (
            @MaTaiKhoan,
            @MaTaiKhoanDich,
            @LoaiGiaoDich,
            @SoTien,
            @MoTa,
            @DanhMuc,
            @PhuongThucThanhToan
        );

        DECLARE @MaGiaoDich INT = SCOPE_IDENTITY();

        UPDATE dbo.TaiKhoan
        SET SoDuHienTai = CASE @LoaiGiaoDich
            WHEN 'credit' THEN SoDuHienTai + @SoTien
            WHEN 'debit'  THEN SoDuHienTai - @SoTien
            END
        WHERE MaTaiKhoan = @MaTaiKhoan;

        COMMIT TRANSACTION;

        SELECT
            gd.MaGiaoDich,
            gd.NgayGiaoDich,
            gd.LoaiGiaoDich,
            gd.SoTien,
            gd.MaTaiKhoanDich,
            tk.SoDuHienTai AS SoDuSauGiaoDich
        FROM dbo.GiaoDich gd
        INNER JOIN dbo.TaiKhoan tk ON tk.MaTaiKhoan = gd.MaTaiKhoan
        WHERE gd.MaGiaoDich = @MaGiaoDich;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO

/*
===============================================================================
Test mẫu - chỉ chạy MANUAL.
- Uncomment block bên dưới để test.
- Happy case: tạo giao dịch credit nhỏ trên tài khoản seed

Cleanup: DELETE FROM dbo.GiaoDich WHERE MoTa = N'[TEST] Giao dich SP';
===============================================================================
*/

-- DECLARE @TestAccountId INT = (SELECT TOP 1 MaTaiKhoan FROM dbo.TaiKhoan WHERE TrangThai = 'active' ORDER BY MaTaiKhoan);
-- EXEC dbo.SP_GiaoDich_TaoGiaoDich @MaTaiKhoan = @TestAccountId, @LoaiGiaoDich = 'credit', @SoTien = 1000, @MoTa = N'[TEST] Giao dich SP', @DanhMuc = N'Thu nhap', @PhuongThucThanhToan = N'Tien mat';
-- DELETE FROM dbo.GiaoDich WHERE MoTa = N'[TEST] Giao dich SP';

/*
===============================================================================
Create SP SP_GiaoDich_TinhSoDuBinhQuan
Purpose     : Job tinh so du binh quan thang theo TK chinh (dua tren giao dich)
Backend     : EXEC thu cong hoac sau migrate V27
===============================================================================
*/

IF OBJECT_ID('dbo.SP_GiaoDich_TinhSoDuBinhQuan', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_GiaoDich_TinhSoDuBinhQuan;
GO

CREATE PROCEDURE dbo.SP_GiaoDich_TinhSoDuBinhQuan
    @Thang  INT = NULL,
    @Nam    INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @Thang IS NULL SET @Thang = MONTH(SYSDATETIME());
    IF @Nam IS NULL SET @Nam = YEAR(SYSDATETIME());

    DECLARE @MonthStart     DATE = DATEFROMPARTS(@Nam, @Thang, 1);
    DECLARE @DaysInMonth    INT = DAY(EOMONTH(@MonthStart));
    DECLARE @ThangNam       VARCHAR(7) = RIGHT('0' + CAST(@Thang AS VARCHAR(2)), 2)
                                   + '/' + CAST(@Nam AS VARCHAR(4));

    DECLARE @MaKhachHang    INT;
    DECLARE @MaTaiKhoan     INT;
    DECLARE @CIF            VARCHAR(20);
    DECLARE @SoDuKhoiTao    DECIMAL(18, 2);
    DECLARE @SoDuDauThang   DECIMAL(18, 2);
    DECLARE @Day            INT;
    DECLARE @DayEnd         DATETIME2(0);
    DECLARE @SoDuCuoiNgay   DECIMAL(18, 2);
    DECLARE @TongSoDu       DECIMAL(18, 2);
    DECLARE @AvgBalance     DECIMAL(18, 2);

    DECLARE cur CURSOR LOCAL FAST_FORWARD FOR
        SELECT tk.MaKhachHang, tk.MaTaiKhoan, tk.CIF
        FROM dbo.TaiKhoan tk
        WHERE tk.LaTaiKhoanChinh = 1
          AND tk.TrangThai = 'active';

    OPEN cur;
    FETCH NEXT FROM cur INTO @MaKhachHang, @MaTaiKhoan, @CIF;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        SET @SoDuKhoiTao = NULL;

        SELECT @SoDuKhoiTao = ISNULL(v.SoDuKhoiTao, 0)
        FROM (VALUES
            (1,  37900000.00), (2,  24635000.00), (3, 166000000.00), (4,  85000000.00),
            (5,  52000000.00), (6,  12500000.00), (7,  45000000.00), (8,  30000000.00),
            (9,  28000000.00), (10, 18500000.00), (11, 10000000.00), (12,  9800000.00),
            (13, 32000000.00), (14, 15000000.00), (15, 210000000.00), (16, 120000000.00)
        ) AS v(MaTaiKhoan, SoDuKhoiTao)
        WHERE v.MaTaiKhoan = @MaTaiKhoan;

        IF @SoDuKhoiTao IS NULL
            SET @SoDuKhoiTao = 0;

        SELECT @SoDuDauThang = @SoDuKhoiTao + ISNULL(SUM(
            CASE WHEN gd.LoaiGiaoDich = 'credit' THEN gd.SoTien ELSE -gd.SoTien END
        ), 0)
        FROM dbo.GiaoDich gd
        WHERE gd.MaTaiKhoan = @MaTaiKhoan
          AND gd.NgayGiaoDich < @MonthStart;

        SET @Day = 1;
        SET @TongSoDu = 0;

        WHILE @Day <= @DaysInMonth
        BEGIN
            SET @DayEnd = CAST(DATEFROMPARTS(@Nam, @Thang, @Day) AS DATETIME2(0));
            SET @DayEnd = DATEADD(DAY, 1, @DayEnd);
            SET @DayEnd = DATEADD(SECOND, -1, @DayEnd);

            SELECT @SoDuCuoiNgay = @SoDuDauThang + ISNULL(SUM(
                CASE WHEN gd.LoaiGiaoDich = 'credit' THEN gd.SoTien ELSE -gd.SoTien END
            ), 0)
            FROM dbo.GiaoDich gd
            WHERE gd.MaTaiKhoan = @MaTaiKhoan
              AND gd.NgayGiaoDich >= @MonthStart
              AND gd.NgayGiaoDich <= @DayEnd;

            SET @TongSoDu = @TongSoDu + @SoDuCuoiNgay;
            SET @Day = @Day + 1;
        END;

        SET @AvgBalance = @TongSoDu / @DaysInMonth;

        MERGE dbo.SoDuBinhQuanThang AS target
        USING (
            SELECT @CIF AS CIF, @ThangNam AS ThangNam, @AvgBalance AS AvgBalance, @MaKhachHang AS MaKhachHang
        ) AS src
            ON target.CIF = src.CIF AND target.ThangNam = src.ThangNam
        WHEN MATCHED THEN
            UPDATE SET
                AvgBalance = src.AvgBalance,
                MaKhachHang = src.MaKhachHang,
                NgayTinh = SYSDATETIME()
        WHEN NOT MATCHED THEN
            INSERT (CIF, ThangNam, AvgBalance, MaKhachHang)
            VALUES (src.CIF, src.ThangNam, src.AvgBalance, src.MaKhachHang);

        FETCH NEXT FROM cur INTO @MaKhachHang, @MaTaiKhoan, @CIF;
    END;

    CLOSE cur;
    DEALLOCATE cur;
END;
GO

