-- =============================================================================
-- V6__LoiLCA__Create__Table_TaiKhoan.sql
-- Tạo bảng TaiKhoan (tài khoản ngân hàng)
-- Phụ thuộc: KhachHang (V5)
-- SoDuDongBang = số dư phong tỏa (view V9 alias SoDuPhongToa)
-- =============================================================================

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
