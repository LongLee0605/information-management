-- =============================================================================
-- V1__LamLP__Create__Database.sql
-- Tạo database QLTT (Quản lý thông tin)
-- =============================================================================

USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'QLTT')
BEGIN
    CREATE DATABASE QLTT
    COLLATE Vietnamese_CI_AS;
END;
GO
