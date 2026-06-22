/*
===============================================================================
Author      : 26410156 - Võ Hoàng Việt
File        : V18__VietVH__Upsert__SP_KhachHang_Xoa.sql
Part        : 6.3 - SP_KhachHang_Xoa
Purpose     : SP xóa mềm khách hàng (đóng băng tất cả tài khoản liên quan)

Yêu cầu đề bài:
- Yêu cầu @XacNhan = 1 để xác nhận xóa
- Không xóa nếu khách hàng còn tài khoản active có số dư
- Xóa giao dịch, tài khoản và khách hàng liên quan
===============================================================================
*/

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
        IF NOT EXISTS (SELECT 1 FROM dbo.KhachHang WHERE MaKhachHang = @MaKhachHang)
            THROW 50020, N'Khong tim thay KhachHang.', 1;

        IF @XacNhan <> 1
            THROW 50021, N'Phai truyen @XacNhan = 1 de xac nhan xoa.', 1;

        IF EXISTS (
            SELECT 1 FROM dbo.TaiKhoan
            WHERE MaKhachHang = @MaKhachHang
              AND TrangThai = 'active'
              AND SoDuHienTai > 0
        )
            THROW 50022, N'Khach hang con tai khoan co so du. Vui long tat toan truoc khi xoa.', 1;

        BEGIN TRANSACTION;

        IF COL_LENGTH('dbo.GiaoDich', 'MaTaiKhoanDich') IS NOT NULL
        BEGIN
            EXEC sp_executesql
                N'UPDATE gd
                  SET gd.MaTaiKhoanDich = NULL
                  FROM dbo.GiaoDich gd
                  INNER JOIN dbo.TaiKhoan tk ON tk.MaTaiKhoan = gd.MaTaiKhoanDich
                  WHERE tk.MaKhachHang = @MaKhachHang
                    AND gd.MaTaiKhoanDich IS NOT NULL;',
                N'@MaKhachHang INT',
                @MaKhachHang = @MaKhachHang;
        END;

        DELETE gd
        FROM dbo.GiaoDich gd
        INNER JOIN dbo.TaiKhoan tk ON tk.MaTaiKhoan = gd.MaTaiKhoan
        WHERE tk.MaKhachHang = @MaKhachHang;

        DELETE FROM dbo.TaiKhoan
        WHERE MaKhachHang = @MaKhachHang;

        DELETE FROM dbo.KhachHang
        WHERE MaKhachHang = @MaKhachHang;

        COMMIT TRANSACTION;

        SELECT @MaKhachHang AS MaKhachHangDaXoa, N'Xoa thanh cong' AS KetQua;
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
- Happy case: xóa khách hàng test không có tài khoản active có số dư

Cleanup: tạo lại dữ liệu test thủ công nếu cần (không restore tự động)
===============================================================================
*/

-- EXEC dbo.SP_KhachHang_ThemCapNhat @MaKhachHang = NULL, @HoTen = N'[TEST] Xoa KH', @CCCD = '079299999997', @NgaySinh = '1990-01-01', @GioiTinh = 'female';
-- DECLARE @TestId INT = (SELECT MaKhachHang FROM dbo.KhachHang WHERE CCCD = '079299999997');
-- UPDATE dbo.TaiKhoan SET TrangThai = 'inactive', SoDuHienTai = 0 WHERE MaKhachHang = @TestId;
-- EXEC dbo.SP_KhachHang_Xoa @MaKhachHang = @TestId, @XacNhan = 1;

