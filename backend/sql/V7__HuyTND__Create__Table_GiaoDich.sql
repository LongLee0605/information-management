/*
===============================================================================
Author      : 26410051 - Trần Nguyễn Đang Huy
File        : V7__HuyTND__Create__Table_GiaoDich.sql
Part        : 2.3 - Tạo bảng GiaoDich
Purpose     : Tạo bảng GiaoDich (lịch sử giao dịch)

Yêu cầu đề bài:
- Phụ thuộc: TaiKhoan (V6)
- Tạo bảng GiaoDich với FK, CHECK và index IX_GiaoDich_MaTaiKhoan_Ngay
===============================================================================
*/

USE QLTT;
GO

IF OBJECT_ID('dbo.GiaoDich', 'U') IS NOT NULL
    DROP TABLE dbo.GiaoDich;
GO

CREATE TABLE dbo.GiaoDich
(
    MaGiaoDich          INT             IDENTITY(1,1)   NOT NULL,
    MaTaiKhoan          INT                             NOT NULL,
    NgayGiaoDich        DATETIME2(0)                    NOT NULL
        CONSTRAINT DF_GiaoDich_NgayGiaoDich DEFAULT (SYSDATETIME()),
    LoaiGiaoDich        VARCHAR(10)                     NOT NULL,
    SoTien              DECIMAL(18,2)                   NOT NULL,
    MoTa                NVARCHAR(500)                   NULL,
    DanhMuc             NVARCHAR(100)                   NULL,
    PhuongThucThanhToan NVARCHAR(50)                    NULL,

    CONSTRAINT PK_GiaoDich PRIMARY KEY CLUSTERED (MaGiaoDich),

    CONSTRAINT FK_GiaoDich_TaiKhoan
        FOREIGN KEY (MaTaiKhoan) REFERENCES dbo.TaiKhoan (MaTaiKhoan)
        ON DELETE NO ACTION ON UPDATE NO ACTION,

    CONSTRAINT CK_GiaoDich_LoaiGiaoDich
        CHECK (LoaiGiaoDich IN ('credit', 'debit')),

    CONSTRAINT CK_GiaoDich_SoTien
        CHECK (SoTien > 0),

    CONSTRAINT CK_GiaoDich_PhuongThuc
        CHECK (PhuongThucThanhToan IS NULL OR PhuongThucThanhToan IN
            (N'NAPAS', N'Deposit', N'Wire Transfer', N'Chuyển khoản', N'Tiền mặt'))
);
GO

CREATE NONCLUSTERED INDEX IX_GiaoDich_MaTaiKhoan_Ngay
    ON dbo.GiaoDich (MaTaiKhoan, NgayGiaoDich DESC);
GO
