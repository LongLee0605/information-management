/*
===============================================================================
Author      : 26410051 - Trần Nguyễn Đang Huy
File        : V12__HuyTND__Create__Trigger_TaiKhoan.sql
Part        : 4.2 - Trigger TaiKhoan
Purpose     : Trigger cho bảng TaiKhoan

Yêu cầu đề bài:
- Phụ thuộc: TaiKhoan (V6)
- TR_TaiKhoan_DongBangSoDu: đóng băng số dư khi chuyển trạng thái inactive
- TR_TaiKhoan_ValidateInsert: không cho tạo tài khoản với số dư âm
===============================================================================
*/

USE QLTT;
GO

IF OBJECT_ID('dbo.TR_TaiKhoan_DongBangSoDu', 'TR') IS NOT NULL
    DROP TRIGGER dbo.TR_TaiKhoan_DongBangSoDu;
GO

CREATE TRIGGER dbo.TR_TaiKhoan_DongBangSoDu
ON dbo.TaiKhoan
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT UPDATE(TrangThai)
        RETURN;

    UPDATE tk
    SET tk.SoDuDongBang = i.SoDuHienTai,
        tk.SoDuHienTai  = 0
    FROM dbo.TaiKhoan tk
    INNER JOIN inserted i ON tk.MaTaiKhoan = i.MaTaiKhoan
    INNER JOIN deleted  d ON d.MaTaiKhoan  = i.MaTaiKhoan
    WHERE i.TrangThai = 'inactive'
      AND d.TrangThai <> 'inactive';
END;
GO

IF OBJECT_ID('dbo.TR_TaiKhoan_ValidateInsert', 'TR') IS NOT NULL
    DROP TRIGGER dbo.TR_TaiKhoan_ValidateInsert;
GO

CREATE TRIGGER dbo.TR_TaiKhoan_ValidateInsert
ON dbo.TaiKhoan
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1 FROM inserted
        WHERE SoDuHienTai < 0 OR SoDuDongBang < 0
    )
    BEGIN
        RAISERROR (N'Khong the tao tai khoan voi so du am.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END;
END;
GO

/*
===============================================================================
Test mẫu - chỉ chạy MANUAL.
- Uncomment block bên dưới để test.
- Happy case: cập nhật trạng thái tài khoản active -> inactive (đóng băng số dư)

Cleanup: UPDATE dbo.TaiKhoan SET TrangThai = 'active', SoDuHienTai = @SavedBalance, SoDuDongBang = 0 WHERE MaTaiKhoan = @TestAccountId;
===============================================================================
*/

-- DECLARE @TestAccountId INT = (SELECT TOP 1 MaTaiKhoan FROM dbo.TaiKhoan WHERE TrangThai = 'active' ORDER BY MaTaiKhoan);
-- DECLARE @SavedBalance DECIMAL(18, 2) = (SELECT SoDuHienTai FROM dbo.TaiKhoan WHERE MaTaiKhoan = @TestAccountId);
--
-- UPDATE dbo.TaiKhoan SET TrangThai = 'inactive' WHERE MaTaiKhoan = @TestAccountId;
-- SELECT MaTaiKhoan, TrangThai, SoDuHienTai, SoDuDongBang FROM dbo.TaiKhoan WHERE MaTaiKhoan = @TestAccountId;
--
-- UPDATE dbo.TaiKhoan SET TrangThai = 'active', SoDuHienTai = @SavedBalance, SoDuDongBang = 0 WHERE MaTaiKhoan = @TestAccountId;
