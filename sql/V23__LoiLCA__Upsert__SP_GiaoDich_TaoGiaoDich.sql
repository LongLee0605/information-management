-- =============================================================================
-- V23__LoiLCA__Upsert__SP_GiaoDich_TaoGiaoDich.sql
-- SP tạo giao dịch mới và cập nhật số dư tài khoản
-- =============================================================================

USE QLTT;
GO

IF OBJECT_ID('dbo.SP_GiaoDich_TaoGiaoDich', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_GiaoDich_TaoGiaoDich;
GO

CREATE PROCEDURE dbo.SP_GiaoDich_TaoGiaoDich
    @MaTaiKhoan         INT,
    @LoaiGiaoDich       VARCHAR(10),
    @SoTien             DECIMAL(18,2),
    @MoTa               NVARCHAR(500)   = NULL,
    @DanhMuc            NVARCHAR(100)   = NULL,
    @PhuongThucThanhToan NVARCHAR(50)   = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        -- Validate
        IF @LoaiGiaoDich NOT IN ('credit', 'debit')
            THROW 50040, N'LoaiGiaoDich chi chap nhan ''credit'' hoac ''debit''.', 1;

        IF @SoTien <= 0
            THROW 50041, N'SoTien phai lon hon 0.', 1;

        DECLARE @TrangThai  VARCHAR(10);
        DECLARE @SoDuHienTai DECIMAL(18,2);
        DECLARE @SoDuDongBang DECIMAL(18,2);

        SELECT @TrangThai = TrangThai, @SoDuHienTai = SoDuHienTai, @SoDuDongBang = SoDuDongBang
        FROM dbo.TaiKhoan WHERE MaTaiKhoan = @MaTaiKhoan;

        IF @TrangThai IS NULL
            THROW 50042, N'Khong tim thay TaiKhoan.', 1;

        IF @TrangThai = 'inactive'
            THROW 50043, N'Tai khoan dang bi khoa, khong the thuc hien giao dich.', 1;

        -- Kiểm tra số dư khả dụng khi debit
        IF @LoaiGiaoDich = 'debit'
        BEGIN
            DECLARE @SoDuKhaDung DECIMAL(18,2) = @SoDuHienTai - @SoDuDongBang;
            IF @SoDuKhaDung < @SoTien
                THROW 50044, N'So du kha dung khong du de thuc hien giao dich.', 1;
        END;

        BEGIN TRANSACTION;

        -- Ghi giao dịch
        INSERT INTO dbo.GiaoDich (MaTaiKhoan, LoaiGiaoDich, SoTien, MoTa, DanhMuc, PhuongThucThanhToan)
        VALUES (@MaTaiKhoan, @LoaiGiaoDich, @SoTien, @MoTa, @DanhMuc, @PhuongThucThanhToan);

        DECLARE @MaGiaoDich INT = SCOPE_IDENTITY();

        -- Cập nhật số dư
        UPDATE dbo.TaiKhoan
        SET SoDuHienTai = CASE @LoaiGiaoDich
            WHEN 'credit' THEN SoDuHienTai + @SoTien
            WHEN 'debit'  THEN SoDuHienTai - @SoTien
            END
        WHERE MaTaiKhoan = @MaTaiKhoan;

        COMMIT TRANSACTION;

        SELECT gd.MaGiaoDich, gd.NgayGiaoDich, gd.LoaiGiaoDich, gd.SoTien,
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
