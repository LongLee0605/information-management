/*
===============================================================================
Author      : 26410060 - Lê Phước Lâm
File        : V4__LamLP__Grant__Permissions.sql
Part        : 1.4 - Phân quyền Role
Purpose     : Phân quyền cho các role

Yêu cầu đề bài:
- Gán user vào role tương ứng
- Cấp quyền CONTROL cho role_admin
- Cấp quyền SELECT, INSERT, UPDATE, EXECUTE cho role_nhanvien
- Cấp quyền SELECT, EXECUTE cho role_baocao
===============================================================================
*/

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
