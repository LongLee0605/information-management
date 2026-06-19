-- =============================================================================
-- V4__LamLP__Grant__Permissions.sql
-- Phân quyền cho các role
-- =============================================================================

USE QLTT;
GO

ALTER ROLE role_admin ADD MEMBER qltt_admin;
GO

GRANT CONTROL ON SCHEMA::dbo TO role_admin;
GO

ALTER ROLE role_nhanvien ADD MEMBER qltt_nhanvien;
GO

GRANT SELECT, INSERT, UPDATE, EXECUTE ON SCHEMA::dbo TO role_nhanvien;
GO

ALTER ROLE role_baocao ADD MEMBER qltt_baocao;
GO

GRANT SELECT, EXECUTE ON SCHEMA::dbo TO role_baocao;
GO
