/*
===============================================================================
Author      : 26410082 - Phan Thanh Nhân
File        : V5__NhanPT__Create__Table_KhachHang.sql
Part        : 2.1 - Tạo bảng KhachHang và AuditLog
Purpose     : Tạo bảng KhachHang và AuditLog

Yêu cầu đề bài:
- Tạo bảng KhachHang với các ràng buộc PK, UQ, CHECK
- Tạo index IX_KhachHang_HoTen
- Tạo bảng AuditLog ghi nhận thao tác trên hệ thống
===============================================================================
*/

USE QLTT;
GO

IF OBJECT_ID('dbo.ChuyenKhoan', 'U') IS NOT NULL DROP TABLE dbo.ChuyenKhoan;
IF OBJECT_ID('dbo.GiaoDich',   'U') IS NOT NULL DROP TABLE dbo.GiaoDich;
IF OBJECT_ID('dbo.TaiKhoan',   'U') IS NOT NULL DROP TABLE dbo.TaiKhoan;
IF OBJECT_ID('dbo.AuditLog',   'U') IS NOT NULL DROP TABLE dbo.AuditLog;
IF OBJECT_ID('dbo.KhachHang',  'U') IS NOT NULL DROP TABLE dbo.KhachHang;
GO

/*
===============================================================================
Create table KhachHang
Purpose     : Lưu trữ thông tin khách hàng
===============================================================================
*/
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
    IsActive        BIT                             NOT NULL    DEFAULT 1,

    CONSTRAINT PK_KhachHang PRIMARY KEY CLUSTERED (MaKhachHang),
    CONSTRAINT UQ_KhachHang_CCCD UNIQUE (CCCD),
    CONSTRAINT CK_KhachHang_GioiTinh CHECK (GioiTinh IN ('male', 'female')),
    CONSTRAINT CK_KhachHang_ThuNhap CHECK (ThuNhapTBThang IS NULL OR ThuNhapTBThang >= 0)
);
GO

/*
===============================================================================
Create index IX_KhachHang_HoTen
Purpose     : Tăng hiệu suất tìm kiếm theo HoTen
===============================================================================
*/

CREATE NONCLUSTERED INDEX IX_KhachHang_HoTen
    ON dbo.KhachHang (HoTen);
GO

/*
===============================================================================
Create table AuditLog
Purpose     : Ghi nhận thao tác trên hệ thống (phụ thuộc KhachHang V5)
===============================================================================
*/

CREATE TABLE dbo.AuditLog
(
    MaAuditLog      INT             IDENTITY(1,1)   NOT NULL,
    TenBang         VARCHAR(50)                     NOT NULL,
    MaBanGhi        INT                             NOT NULL,
    HanhDong        VARCHAR(10)                     NOT NULL,
    NoiDung         NVARCHAR(500)                   NULL,
    NguoiThucHien   VARCHAR(100)                    NULL,
    ThoiGian        DATETIME2(0)                    NOT NULL
        CONSTRAINT DF_AuditLog_ThoiGian DEFAULT (SYSDATETIME()),

    CONSTRAINT PK_AuditLog PRIMARY KEY CLUSTERED (MaAuditLog),
    CONSTRAINT CK_AuditLog_HanhDong CHECK (HanhDong IN ('INSERT', 'UPDATE', 'DELETE'))
);
GO

CREATE NONCLUSTERED INDEX IX_AuditLog_TenBang_MaBanGhi
    ON dbo.AuditLog (TenBang, MaBanGhi);
GO

/*
===============================================================================
Create SP SP_KhachHang_LayTheoMa
Purpose     : Lấy chi tiết khách hàng theo MaKhachHang (GET/POST/PUT /api/customers/:id)
===============================================================================
*/

IF OBJECT_ID('dbo.SP_KhachHang_LayTheoMa', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_KhachHang_LayTheoMa;
GO

CREATE PROCEDURE dbo.SP_KhachHang_LayTheoMa
    @MaKhachHang INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        kh.MaKhachHang,
        kh.HoTen,
        kh.CCCD,
        kh.NgaySinh,
        kh.GioiTinh,
        kh.DienThoai,
        kh.Email,
        kh.DiaChi,
        kh.NoiLamViec,
        kh.TinhTrangHonNhan,
        kh.HocVan,
        kh.ThuNhapTBThang,
        kh.IsActive
    FROM dbo.KhachHang kh
    WHERE kh.MaKhachHang = @MaKhachHang;
END;
GO
