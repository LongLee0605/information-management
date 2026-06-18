-- =============================================================================
-- V18__VietVH__Upsert__SP_KhachHang_Xoa.sql
-- SP xóa mềm khách hàng (đóng băng tất cả tài khoản liên quan)
-- =============================================================================

USE QLTT;
GO

IF OBJECT_ID('dbo.SP_KhachHang_Xoa', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_KhachHang_Xoa;
GO

CREATE PROCEDURE dbo.SP_KhachHang_Xoa
    @MaKhachHang    INT,
    @XacNhan        BIT = 0   -- phải truyền 1 để xác nhận xóa
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        -- Kiểm tra tồn tại
        IF NOT EXISTS (SELECT 1 FROM dbo.KhachHang WHERE MaKhachHang = @MaKhachHang)
            THROW 50020, N'Khong tim thay KhachHang.', 1;

        -- Bắt buộc xác nhận
        IF @XacNhan <> 1
            THROW 50021, N'Phai truyen @XacNhan = 1 de xac nhan xoa.', 1;

        -- Kiểm tra còn tài khoản active có số dư
        IF EXISTS (
            SELECT 1 FROM dbo.TaiKhoan
            WHERE MaKhachHang = @MaKhachHang
              AND TrangThai = 'active'
              AND SoDuHienTai > 0
        )
            THROW 50022, N'Khach hang con tai khoan co so du. Vui long tat toan truoc khi xoa.', 1;

        BEGIN TRANSACTION;

        -- Đóng băng tất cả tài khoản của khách hàng
        UPDATE dbo.TaiKhoan
        SET TrangThai = 'inactive'
        WHERE MaKhachHang = @MaKhachHang
          AND TrangThai = 'active';

        -- Xóa khách hàng
        DELETE FROM dbo.KhachHang WHERE MaKhachHang = @MaKhachHang;

        COMMIT TRANSACTION;

        SELECT @MaKhachHang AS MaKhachHangDaXoa, N'Xoa thanh cong' AS KetQua;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO
