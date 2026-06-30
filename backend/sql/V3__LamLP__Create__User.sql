/*
===============================================================================
Author      : 26410060 - Lê Phước Lâm
File        : V3__LamLP__Create__User.sql
Part        : 1.3 - Tạo Login và User
Purpose     : Tạo login và user cho hệ thống

Yêu cầu đề bài:
- Tạo login qltt_admin, qltt_nhanvien, qltt_baocao
- Tạo user tương ứng trong database QLTT
===============================================================================
*/

USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.server_principals WHERE name = N'qltt_admin')
BEGIN
    CREATE LOGIN qltt_admin WITH PASSWORD = N'Admin@QLTT2026', DEFAULT_DATABASE = QLTT;
END;
GO

IF NOT EXISTS (SELECT name FROM sys.server_principals WHERE name = N'qltt_nhanvien')
BEGIN
    CREATE LOGIN qltt_nhanvien WITH PASSWORD = N'NhanVien@QLTT2026', DEFAULT_DATABASE = QLTT;
END;
GO

IF NOT EXISTS (SELECT name FROM sys.server_principals WHERE name = N'qltt_baocao')
BEGIN
    CREATE LOGIN qltt_baocao WITH PASSWORD = N'BaoCao@QLTT2026', DEFAULT_DATABASE = QLTT;
END;
GO

USE QLTT;
GO

IF NOT EXISTS (SELECT name FROM sys.database_principals WHERE name = N'qltt_admin')
    CREATE USER qltt_admin FOR LOGIN qltt_admin;
GO

IF NOT EXISTS (SELECT name FROM sys.database_principals WHERE name = N'qltt_nhanvien')
    CREATE USER qltt_nhanvien FOR LOGIN qltt_nhanvien;
GO

IF NOT EXISTS (SELECT name FROM sys.database_principals WHERE name = N'qltt_baocao')
    CREATE USER qltt_baocao FOR LOGIN qltt_baocao;
GO
