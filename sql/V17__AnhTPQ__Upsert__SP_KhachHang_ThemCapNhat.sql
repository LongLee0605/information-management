-- =============================================================================
-- V17__AnhTPQ__Upsert__SP_KhachHang_ThemCapNhat.sql
-- SP thêm mới hoặc cập nhật thông tin khách hàng
-- =============================================================================

USE QLTT;
GO

IF OBJECT_ID('dbo.SP_KhachHang_ThemCapNhat', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_KhachHang_ThemCapNhat;
GO

CREATE PROCEDURE dbo.SP_KhachHang_ThemCapNhat
    @MaKhachHang    INT             = NULL,  -- NULL = thêm mới
    @HoTen          NVARCHAR(100),
    @CCCD           VARCHAR(12),
    @NgaySinh       DATE,
    @GioiTinh       VARCHAR(6),
    @DienThoai      VARCHAR(15)     = NULL,
    @Email          VARCHAR(100)    = NULL,
    @DiaChi         NVARCHAR(200)   = NULL,
    @NoiLamViec     NVARCHAR(200)   = NULL,
    @TinhTrangHonNhan NVARCHAR(50)  = NULL,
    @HocVan         NVARCHAR(100)   = NULL,
    @ThuNhapTBThang DECIMAL(18,2)   = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        -- Validate CCCD
        IF LEN(@CCCD) <> 12
            THROW 50010, N'CCCD phai co dung 12 ky tu so.', 1;

        -- Validate GioiTinh
        IF @GioiTinh NOT IN ('male', 'female')
            THROW 50011, N'GioiTinh chi chap nhan ''male'' hoac ''female''.', 1;

        -- Validate NgaySinh
        IF @NgaySinh >= CAST(GETDATE() AS DATE)
            THROW 50012, N'NgaySinh phai truoc hom nay.', 1;

        BEGIN TRANSACTION;

        IF @MaKhachHang IS NULL
        BEGIN
            -- Thêm mới
            IF EXISTS (SELECT 1 FROM dbo.KhachHang WHERE CCCD = @CCCD)
                THROW 50013, N'CCCD da ton tai trong he thong.', 1;

            INSERT INTO dbo.KhachHang (HoTen, CCCD, NgaySinh, GioiTinh, DienThoai, Email, DiaChi, NoiLamViec, TinhTrangHonNhan, HocVan, ThuNhapTBThang)
            VALUES (@HoTen, @CCCD, @NgaySinh, @GioiTinh, @DienThoai, @Email, @DiaChi, @NoiLamViec, @TinhTrangHonNhan, @HocVan, @ThuNhapTBThang);

            SET @MaKhachHang = SCOPE_IDENTITY();
        END
        ELSE
        BEGIN
            -- Cập nhật
            IF NOT EXISTS (SELECT 1 FROM dbo.KhachHang WHERE MaKhachHang = @MaKhachHang)
                THROW 50014, N'Khong tim thay KhachHang de cap nhat.', 1;

            UPDATE dbo.KhachHang
            SET HoTen = @HoTen, CCCD = @CCCD, NgaySinh = @NgaySinh, GioiTinh = @GioiTinh,
                DienThoai = @DienThoai, Email = @Email, DiaChi = @DiaChi,
                NoiLamViec = @NoiLamViec, TinhTrangHonNhan = @TinhTrangHonNhan,
                HocVan = @HocVan, ThuNhapTBThang = @ThuNhapTBThang
            WHERE MaKhachHang = @MaKhachHang;
        END;

        COMMIT TRANSACTION;

        SELECT * FROM dbo.KhachHang WHERE MaKhachHang = @MaKhachHang;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO
