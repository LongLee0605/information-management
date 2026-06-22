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
            DECLARE @SoDuKhaDung DECIMAL(18,2) = @SoDuHienTai - @SoDuDongBang;
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

