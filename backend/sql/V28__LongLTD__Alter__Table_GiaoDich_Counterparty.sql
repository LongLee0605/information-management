USE QLTT;
GO

IF COL_LENGTH('dbo.GiaoDich', 'MaTaiKhoanDich') IS NULL
BEGIN
    ALTER TABLE dbo.GiaoDich
        ADD MaTaiKhoanDich INT NULL;

    ALTER TABLE dbo.GiaoDich
        ADD CONSTRAINT FK_GiaoDich_TaiKhoanDich
            FOREIGN KEY (MaTaiKhoanDich) REFERENCES dbo.TaiKhoan (MaTaiKhoan);
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_GiaoDich_MaTaiKhoanDich'
      AND object_id = OBJECT_ID(N'dbo.GiaoDich')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_GiaoDich_MaTaiKhoanDich
        ON dbo.GiaoDich (MaTaiKhoan, MaTaiKhoanDich)
        WHERE MaTaiKhoanDich IS NOT NULL;
END;
GO
