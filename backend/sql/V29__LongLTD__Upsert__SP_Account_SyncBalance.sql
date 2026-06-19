-- =============================================================================
-- V29__LongLTD__Upsert__SP_Account_SyncBalance.sql
-- SP: dbo.SP_TaiKhoan_DongBoSoDu — đồng bộ SoDuHienTai sau dữ liệu mẫu
-- =============================================================================

USE QLTT;
GO

IF OBJECT_ID('dbo.SP_TaiKhoan_DongBoSoDu', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_TaiKhoan_DongBoSoDu;
GO

CREATE PROCEDURE dbo.SP_TaiKhoan_DongBoSoDu
AS
BEGIN
    SET NOCOUNT ON;

    ;WITH SoDuKhoiTao AS (
        SELECT * FROM (VALUES
            (1,  37900000.00),
            (2,  24635000.00),
            (3,   5685000.00),
            (4, 166000000.00),
            (5,  85000000.00),
            (6,  52000000.00),
            (7,   8500000.00),
            (8,  12500000.00),
            (9,  45000000.00),
            (10, 30000000.00),
            (11, 28000000.00),
            (12, 18500000.00),
            (13, 10000000.00),
            (14,  9800000.00),
            (15, 32000000.00),
            (16, 15000000.00),
            (17, 210000000.00),
            (18, 120000000.00)
        ) AS v(MaTaiKhoan, SoDuKhoiTao)
    ),
    BienDong AS (
        SELECT
            gd.MaTaiKhoan,
            SUM(CASE WHEN gd.LoaiGiaoDich = 'credit' THEN gd.SoTien ELSE -gd.SoTien END) AS TongBienDong
        FROM dbo.GiaoDich gd
        GROUP BY gd.MaTaiKhoan
    ),
    TinhSoDu AS (
        SELECT
            tk.MaTaiKhoan,
            k.SoDuKhoiTao + ISNULL(bd.TongBienDong, 0) AS SoDuMoi
        FROM dbo.TaiKhoan tk
        INNER JOIN SoDuKhoiTao k ON k.MaTaiKhoan = tk.MaTaiKhoan
        LEFT JOIN BienDong bd ON bd.MaTaiKhoan = tk.MaTaiKhoan
    )
    UPDATE tk
    SET
        tk.SoDuHienTai = ts.SoDuMoi,
        tk.SoDuDongBang = CASE
            WHEN tk.TrangThai = 'inactive' THEN ts.SoDuMoi
            WHEN tk.SoDuDongBang > ts.SoDuMoi THEN ts.SoDuMoi
            ELSE tk.SoDuDongBang
        END
    FROM dbo.TaiKhoan tk
    INNER JOIN TinhSoDu ts ON ts.MaTaiKhoan = tk.MaTaiKhoan;
END;
GO

EXEC dbo.SP_TaiKhoan_DongBoSoDu;
GO
