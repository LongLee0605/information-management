-- =============================================================================
-- V2__LamLP__Create__GroupRole.sql
-- Tạo các role nhóm người dùng trong database
-- =============================================================================

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
