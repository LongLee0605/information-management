-- =============================================================================
-- V5__NhanPT__Create__Table_KhachHang.sql
-- Tạo bảng KhachHang
-- =============================================================================

USE QLTT;
GO

-- Drop in reverse dependency order to avoid FK constraint errors
IF OBJECT_ID('dbo.GiaoDich',  'U') IS NOT NULL DROP TABLE dbo.GiaoDich;
IF OBJECT_ID('dbo.TaiKhoan',  'U') IS NOT NULL DROP TABLE dbo.TaiKhoan;
IF OBJECT_ID('dbo.KhachHang', 'U') IS NOT NULL DROP TABLE dbo.KhachHang;
GO

CREATE TABLE dbo.KhachHang
(
    MaKhachHang     INT             IDENTITY(1,1)   NOT NULL,
    HoTen           NVARCHAR(100)                   NOT NULL,
    CCCD            VARCHAR(12)                     NOT NULL,
    NgaySinh        DATE                            NOT NULL,
    GioiTinh        VARCHAR(6)                      NOT NULL,
    DienThoai       VARCHAR(15)                     NULL,
    Email           VARCHAR(100)                    NULL,
    DiaChi          NVARCHAR(200)                   NULL,
    NoiLamViec      NVARCHAR(200)                   NULL,
    TinhTrangHonNhan NVARCHAR(50)                   NULL,
    HocVan          NVARCHAR(100)                   NULL,
    ThuNhapTBThang  DECIMAL(18,2)                   NULL,

    CONSTRAINT PK_KhachHang PRIMARY KEY CLUSTERED (MaKhachHang),
    CONSTRAINT UQ_KhachHang_CCCD UNIQUE (CCCD),
    CONSTRAINT CK_KhachHang_GioiTinh CHECK (GioiTinh IN ('male', 'female')),
    CONSTRAINT CK_KhachHang_ThuNhap CHECK (ThuNhapTBThang IS NULL OR ThuNhapTBThang >= 0)
);
GO

CREATE NONCLUSTERED INDEX IX_KhachHang_HoTen
    ON dbo.KhachHang (HoTen);
GO
