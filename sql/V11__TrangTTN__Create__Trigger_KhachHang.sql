-- =============================================================================
-- V11__TrangTTN__Create__Trigger_KhachHang.sql
-- Trigger cho bảng KhachHang
-- Phụ thuộc: KhachHang (V5)
-- =============================================================================

USE QLTT;
GO

-- Trigger 1: Validate dữ liệu khi INSERT khách hàng mới
IF OBJECT_ID('dbo.TR_KhachHang_ValidateInsert', 'TR') IS NOT NULL
    DROP TRIGGER dbo.TR_KhachHang_ValidateInsert;
GO

CREATE TRIGGER dbo.TR_KhachHang_ValidateInsert
ON dbo.KhachHang
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    -- Chặn CCCD không đúng 12 chữ số
    IF EXISTS (
        SELECT 1 FROM inserted
        WHERE LEN(CCCD) <> 12 OR CCCD NOT LIKE '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'
    )
    BEGIN
        RAISERROR (N'CCCD phai co dung 12 chu so.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END;

    -- Chặn ngày sinh trong tương lai
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

-- Trigger 2: Validate khi UPDATE khách hàng
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
