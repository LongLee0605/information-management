-- =============================================================================
-- V12__HuyTND__Create__Trigger_TaiKhoan.sql
-- Trigger cho bảng TaiKhoan
-- Phụ thuộc: TaiKhoan (V6)
-- =============================================================================

USE QLTT;
GO

-- Trigger 1: AFTER UPDATE - Đóng băng số dư khi chuyển sang 'inactive'
IF OBJECT_ID('dbo.TR_TaiKhoan_DongBangSoDu', 'TR') IS NOT NULL
    DROP TRIGGER dbo.TR_TaiKhoan_DongBangSoDu;
GO

CREATE TRIGGER dbo.TR_TaiKhoan_DongBangSoDu
ON dbo.TaiKhoan
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Skip sớm nếu cột TrangThai không bị tác động
    IF NOT UPDATE(TrangThai)
        RETURN;

    -- SET-BASED: xử lý tất cả dòng vừa chuyển sang 'inactive' trong một câu lệnh
    -- Guard d.TrangThai <> 'inactive': chỉ xử lý lần chuyển thật sự, không re-freeze
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

-- Trigger 2: AFTER INSERT - Validate tài khoản mới (chặn số dư âm)
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
