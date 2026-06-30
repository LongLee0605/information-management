/*
===============================================================================
Author      : 26410060 - Lê Phước Lâm
File        : V1__LamLP__Create__Database.sql
Part        : 1.1 - Tạo cấu trúc Database
Purpose     : Tạo database QLTT (Quản lý thông tin)

Yêu cầu đề bài:
- Tạo database QLTT (Quản lý thông tin)
===============================================================================
*/

USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'QLTT')
BEGIN
    CREATE DATABASE QLTT
    COLLATE Vietnamese_CI_AS;
END;
GO
