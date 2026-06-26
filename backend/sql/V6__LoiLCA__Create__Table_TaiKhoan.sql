/*
===============================================================================
Author      : 26410064 - Lê Công Anh Lợi
File        : V6__LoiLCA__Create__Table_TaiKhoan.sql
Part        : 2.2 - Tạo bảng TaiKhoan
Purpose     : Tạo bảng TaiKhoan (tài khoản ngân hàng)

Yêu cầu đề bài:
- Phụ thuộc: KhachHang (V5)
- SoDuDongBang = số dư phong tỏa (view V9 alias SoDuPhongToa)
- Tạo bảng TaiKhoan với FK, CHECK và các index liên quan
===============================================================================
*/

USE QLTT;
GO

IF OBJECT_ID('dbo.TaiKhoan', 'U') IS NOT NULL
    DROP TABLE dbo.TaiKhoan;
GO

CREATE TABLE dbo.TaiKhoan
(
    MaTaiKhoan          INT             IDENTITY(1,1)   NOT NULL,
    MaKhachHang         INT                             NOT NULL,
    CIF                 VARCHAR(20)                     NOT NULL,
    SoTaiKhoan          VARCHAR(20)                     NOT NULL,
    LoaiTaiKhoan        VARCHAR(20)                     NOT NULL,
    NhanLoaiTaiKhoan    NVARCHAR(50)                    NULL,
    SoDuHienTai         DECIMAL(18,2)                   NOT NULL    DEFAULT 0,
    SoDuDongBang        DECIMAL(18,2)                   NOT NULL    DEFAULT 0,
    TrangThai           VARCHAR(10)                     NOT NULL    DEFAULT 'active',
    NganHang            NVARCHAR(50)                    NOT NULL,
    LaTaiKhoanChinh     BIT                             NOT NULL    DEFAULT 0,

    CONSTRAINT PK_TaiKhoan PRIMARY KEY CLUSTERED (MaTaiKhoan),
    CONSTRAINT UQ_TaiKhoan_SoTaiKhoan UNIQUE (SoTaiKhoan),
    CONSTRAINT FK_TaiKhoan_KhachHang
        FOREIGN KEY (MaKhachHang) REFERENCES dbo.KhachHang (MaKhachHang)
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT CK_TaiKhoan_LoaiTaiKhoan
        CHECK (LoaiTaiKhoan IN ('payment', 'savings')),
    CONSTRAINT CK_TaiKhoan_TrangThai
        CHECK (TrangThai IN ('active', 'inactive')),
    CONSTRAINT CK_TaiKhoan_SoDu
        CHECK (SoDuHienTai >= 0 AND SoDuDongBang >= 0)
);
GO

CREATE NONCLUSTERED INDEX IX_TaiKhoan_MaKhachHang
    ON dbo.TaiKhoan (MaKhachHang);
GO

CREATE NONCLUSTERED INDEX IX_TaiKhoan_CIF
    ON dbo.TaiKhoan (CIF);
GO

CREATE NONCLUSTERED INDEX IX_TaiKhoan_CIF_MaKhachHang
    ON dbo.TaiKhoan (CIF, MaKhachHang);
GO

/*
===============================================================================
Create SP SP_TaiKhoan_LayCIFTheoKhachHang
Purpose     : Tra CIF theo MaKhachHang khi mở tài khoản mới (POST /api/accounts)
===============================================================================
*/

IF OBJECT_ID('dbo.SP_TaiKhoan_LayCIFTheoKhachHang', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_TaiKhoan_LayCIFTheoKhachHang;
GO

CREATE PROCEDURE dbo.SP_TaiKhoan_LayCIFTheoKhachHang
    @MaKhachHang INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP 1
        tk.CIF
    FROM dbo.TaiKhoan tk
    WHERE tk.MaKhachHang = @MaKhachHang
    ORDER BY tk.LaTaiKhoanChinh DESC, tk.MaTaiKhoan;
END;
GO

/*
===============================================================================
Create SP SP_TaiKhoan_TimTheoSoHoacCIF
Purpose     : Tra MaTaiKhoan, MaKhachHang theo số TK hoặc CIF (GET /api/reports/money-flow)
===============================================================================
*/

IF OBJECT_ID('dbo.SP_TaiKhoan_TimTheoSoHoacCIF', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_TaiKhoan_TimTheoSoHoacCIF;
GO

CREATE PROCEDURE dbo.SP_TaiKhoan_TimTheoSoHoacCIF
    @Lookup VARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP 1
        tk.MaTaiKhoan,
        tk.MaKhachHang
    FROM dbo.TaiKhoan tk
    WHERE tk.SoTaiKhoan = @Lookup
       OR tk.CIF = @Lookup
    ORDER BY tk.LaTaiKhoanChinh DESC, tk.MaTaiKhoan;
END;
GO
