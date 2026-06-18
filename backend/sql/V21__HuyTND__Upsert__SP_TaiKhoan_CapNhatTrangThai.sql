-- =============================================================================
-- V21__HuyTND__Upsert__SP_TaiKhoan_CapNhatTrangThai.sql
-- SP cập nhật trạng thái tài khoản (validated UPDATE)
-- Phụ thuộc: TaiKhoan (V6) + trigger TR_TaiKhoan_DongBangSoDu (V12)
-- Ghi chú: khi update sang 'inactive', trigger V12 tự đóng băng số dư
-- =============================================================================

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
        -- 1) Validate giá trị TrangThai
        IF @TrangThai NOT IN ('active', 'inactive')
            THROW 50001, N'TrangThai khong hop le. Chi chap nhan ''active'' hoac ''inactive''.', 1;

        -- 2) Kiểm tra tài khoản tồn tại
        IF NOT EXISTS (SELECT 1 FROM dbo.TaiKhoan WHERE MaTaiKhoan = @MaTaiKhoan)
            THROW 50002, N'Khong tim thay TaiKhoan voi MaTaiKhoan da cho.', 1;

        -- 3) UPDATE trong transaction
        -- Điều kiện AND TrangThai <> @TrangThai: idempotent, tránh trigger chạy vô ích
        -- Khi chuyển sang 'inactive': trigger TR_TaiKhoan_DongBangSoDu tự kích hoạt
        BEGIN TRANSACTION;

            UPDATE dbo.TaiKhoan
            SET TrangThai = @TrangThai
            WHERE MaTaiKhoan = @MaTaiKhoan
              AND TrangThai <> @TrangThai;

        COMMIT TRANSACTION;

        -- 4) Trả kết quả để caller xác nhận (bao gồm SoDuDongBang sau khi trigger chạy)
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
