/*
===============================================================================
Author      : 26410051 - Trần Nguyễn Đang Huy
File        : V21__HuyTND__Upsert__SP_TaiKhoan_CapNhatTrangThai.sql
Part        : 6.6 - SP_TaiKhoan_CapNhatTrangThai
Purpose     : SP cập nhật trạng thái tài khoản (validated UPDATE)

Yêu cầu đề bài:
- Phụ thuộc: TaiKhoan (V6) + trigger TR_TaiKhoan_DongBangSoDu (V12)
- Khi update sang inactive, trigger V12 tự đóng băng số dư
- Validate trạng thái active/inactive
===============================================================================
*/

USE QLTT;
GO

IF OBJECT_ID('dbo.SP_TaiKhoan_CapNhatTrangThai', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_TaiKhoan_CapNhatTrangThai;
GO

CREATE PROCEDURE dbo.SP_TaiKhoan_CapNhatTrangThai
    @MaTaiKhoan INT,
    @TrangThai  VARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        IF @TrangThai NOT IN ('active', 'inactive')
            THROW 50001, N'TrangThai khong hop le. Chi chap nhan ''active'' hoac ''inactive''.', 1;

        IF NOT EXISTS (SELECT 1 FROM dbo.TaiKhoan WHERE MaTaiKhoan = @MaTaiKhoan)
            THROW 50002, N'Khong tim thay TaiKhoan voi MaTaiKhoan da cho.', 1;

        BEGIN TRANSACTION;

            UPDATE dbo.TaiKhoan
            SET TrangThai = @TrangThai
            WHERE MaTaiKhoan = @MaTaiKhoan
              AND TrangThai <> @TrangThai;

        COMMIT TRANSACTION;

        SELECT MaTaiKhoan, SoTaiKhoan, TrangThai, SoDuHienTai, SoDuDongBang
        FROM dbo.TaiKhoan
        WHERE MaTaiKhoan = @MaTaiKhoan;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO

/*
===============================================================================
Test mẫu - chỉ chạy MANUAL.
- Uncomment block bên dưới để test.
- Happy case: cập nhật trạng thái tài khoản qua SP

Cleanup: EXEC dbo.SP_TaiKhoan_CapNhatTrangThai @MaTaiKhoan = @TestAccountId, @TrangThai = 'active';
===============================================================================
*/

-- DECLARE @TestAccountId INT = (SELECT TOP 1 MaTaiKhoan FROM dbo.TaiKhoan WHERE TrangThai = 'active' ORDER BY MaTaiKhoan);
-- EXEC dbo.SP_TaiKhoan_CapNhatTrangThai @MaTaiKhoan = @TestAccountId, @TrangThai = 'inactive';
-- EXEC dbo.SP_TaiKhoan_CapNhatTrangThai @MaTaiKhoan = @TestAccountId, @TrangThai = 'active';

