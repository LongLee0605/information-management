/*
===============================================================================
Author      : 26410060 - Lê Phước Lâm
File        : V2__LamLP__Create__GroupRole.sql
Part        : 1.2 - Tạo Database Role
Purpose     : Tạo các role nhóm người dùng trong database

Yêu cầu đề bài:
- Tạo role_admin, role_nhanvien, role_baocao trong database QLTT
===============================================================================
*/

USE QLTT;
GO

IF NOT EXISTS (SELECT name FROM sys.database_principals WHERE name = N'role_admin' AND type = 'R')
    CREATE ROLE role_admin;
GO

IF NOT EXISTS (SELECT name FROM sys.database_principals WHERE name = N'role_nhanvien' AND type = 'R')
    CREATE ROLE role_nhanvien;
GO

IF NOT EXISTS (SELECT name FROM sys.database_principals WHERE name = N'role_baocao' AND type = 'R')
    CREATE ROLE role_baocao;
GO
