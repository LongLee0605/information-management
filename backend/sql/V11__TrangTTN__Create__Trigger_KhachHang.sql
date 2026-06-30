/*
===============================================================================
Author      : 26410138 - Trần Thị Ngọc Trang
File        : V11__TrangTTN__Create__Trigger_KhachHang.sql
Part        : 4.1 - Trigger validate KhachHang
Purpose     : Trigger cho bảng KhachHang

Yêu cầu đề bài:
- Phụ thuộc: KhachHang (V5)
- TR_KhachHang_ValidateInsert: kiểm tra CCCD 12 chữ số và ngày sinh hợp lệ
- TR_KhachHang_ValidateUpdate: kiểm tra CCCD khi cập nhật
===============================================================================
*/

USE QLTT;
GO

IF OBJECT_ID('dbo.TR_KhachHang_ValidateInsert', 'TR') IS NOT NULL
    DROP TRIGGER dbo.TR_KhachHang_ValidateInsert;
GO

CREATE TRIGGER dbo.TR_KhachHang_ValidateInsert
ON dbo.KhachHang
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1 FROM inserted
        WHERE LEN(CCCD) <> 12 OR CCCD NOT LIKE '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'
    )
    BEGIN
        RAISERROR (N'CCCD phai co dung 12 chu so.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END;

    IF EXISTS (
        SELECT 1 FROM inserted
        WHERE NgaySinh >= CAST(GETDATE() AS DATE)
    )
    BEGIN
        RAISERROR (N'Ngay sinh khong hop le (phai truoc hom nay).', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END;
END;
GO

IF OBJECT_ID('dbo.TR_KhachHang_ValidateUpdate', 'TR') IS NOT NULL
    DROP TRIGGER dbo.TR_KhachHang_ValidateUpdate;
GO

CREATE TRIGGER dbo.TR_KhachHang_ValidateUpdate
ON dbo.KhachHang
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT UPDATE(CCCD) AND NOT UPDATE(NgaySinh)
        RETURN;

    IF EXISTS (
        SELECT 1 FROM inserted
        WHERE LEN(CCCD) <> 12 OR CCCD NOT LIKE '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'
    )
    BEGIN
        RAISERROR (N'CCCD phai co dung 12 chu so.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END;
END;
GO

/*
===============================================================================
Test mẫu - chỉ chạy MANUAL.
- Uncomment block bên dưới để test.
- Happy case: INSERT khách hàng với CCCD 12 chữ số và ngày sinh hợp lệ

Cleanup: DELETE FROM dbo.KhachHang WHERE CCCD = '079299999999';
===============================================================================
*/

-- BEGIN TRANSACTION;
--
-- INSERT INTO dbo.KhachHang (HoTen, CCCD, NgaySinh, GioiTinh)
-- VALUES (N'[TEST] Trigger KhachHang', '079299999999', '1995-01-15', 'male');
--
-- SELECT MaKhachHang, HoTen, CCCD FROM dbo.KhachHang WHERE CCCD = '079299999999';
--
-- DELETE FROM dbo.KhachHang WHERE CCCD = '079299999999';
--
-- COMMIT TRANSACTION;
