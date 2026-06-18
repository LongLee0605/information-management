-- =============================================================================
-- V20__PhongNLH__Upsert__SP_TaiKhoan_MoTaiKhoa.sql
-- SP mở/khóa tài khoản (toggle active/inactive)
-- =============================================================================

USE QLTT;
GO

IF OBJECT_ID('dbo.SP_TaiKhoan_MoTaiKhoa', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_TaiKhoan_MoTaiKhoa;
GO

CREATE PROCEDURE dbo.SP_TaiKhoan_MoTaiKhoa
    @MaTaiKhoan     INT,
    @HanhDong       VARCHAR(10)   -- 'mo' hoặc 'khoa'
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        IF @HanhDong NOT IN ('mo', 'khoa')
            THROW 50030, N'HanhDong chi chap nhan ''mo'' hoac ''khoa''.', 1;

        IF NOT EXISTS (SELECT 1 FROM dbo.TaiKhoan WHERE MaTaiKhoan = @MaTaiKhoan)
            THROW 50031, N'Khong tim thay TaiKhoan.', 1;

        DECLARE @TrangThaiMoi VARCHAR(10) = CASE @HanhDong WHEN 'mo' THEN 'active' ELSE 'inactive' END;

        BEGIN TRANSACTION;

        UPDATE dbo.TaiKhoan
        SET TrangThai = @TrangThaiMoi
        WHERE MaTaiKhoan = @MaTaiKhoan
          AND TrangThai <> @TrangThaiMoi;

        COMMIT TRANSACTION;

        SELECT MaTaiKhoan, SoTaiKhoan, TrangThai, SoDuHienTai, SoDuDongBang
        FROM dbo.TaiKhoan
        WHERE MaTaiKhoan = @MaTaiKhoan;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO
