/*
===============================================================================
Author      : 26410005 - Trần Phúc Quyền Anh
File        : V17__AnhTPQ__Upsert__SP_KhachHang_ThemCapNhat.sql
Part        : 6.2 - SP_KhachHang_ThemCapNhat
Purpose     : SP thêm mới hoặc cập nhật thông tin khách hàng

Yêu cầu đề bài:
- MaKhachHang NULL/0 = thêm mới, >0 = cập nhật
- Validate CCCD, HoTen, NgaySinh, GioiTinh
- Tự sinh CIF và tài khoản thanh toán chính khi thêm mới
===============================================================================
*/

USE QLTT;
GO

IF OBJECT_ID('dbo.SP_KhachHang_ThemCapNhat', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_KhachHang_ThemCapNhat;
GO

CREATE PROCEDURE dbo.SP_KhachHang_ThemCapNhat
    @MaKhachHang        INT             = NULL,
    @HoTen              NVARCHAR(100),
    @CCCD               VARCHAR(12),
    @NgaySinh           DATE,
    @GioiTinh           VARCHAR(6),
    @DienThoai          VARCHAR(15)     = NULL,
    @Email              VARCHAR(100)    = NULL,
    @DiaChi             NVARCHAR(200)   = NULL,
    @NoiLamViec         NVARCHAR(200)   = NULL,
    @TinhTrangHonNhan   NVARCHAR(50)    = NULL,
    @HocVan             NVARCHAR(100)   = NULL,
    @ThuNhapTBThang     DECIMAL(18,2)   = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        IF @MaKhachHang = 0
            SET @MaKhachHang = NULL;

        IF NULLIF(LTRIM(RTRIM(@HoTen)), '') IS NULL
            THROW 50010, N'HoTen khong duoc rong.', 1;

        IF @CCCD NOT LIKE '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'
            THROW 50011, N'CCCD phai co dung 12 ky tu so.', 1;

        IF @GioiTinh NOT IN ('male', 'female')
            THROW 50012, N'GioiTinh chi chap nhan ''male'' hoac ''female''.', 1;

        IF @NgaySinh >= CAST(GETDATE() AS DATE)
            THROW 50013, N'NgaySinh phai truoc hom nay.', 1;

        IF YEAR(@NgaySinh) NOT BETWEEN 1900 AND YEAR(GETDATE())
            THROW 50014, N'Nam sinh phai tu 1900 den nam hien tai.', 1;

        DECLARE @NewCIF VARCHAR(20) = NULL;
        DECLARE @SoTaiKhoan VARCHAR(20);
        DECLARE @attempts INT = 0;
        DECLARE @digits VARCHAR(20);

        BEGIN TRANSACTION;

        IF @MaKhachHang IS NULL
        BEGIN
            IF EXISTS (SELECT 1 FROM dbo.KhachHang WHERE CCCD = @CCCD)
                THROW 50015, N'CCCD da ton tai trong he thong.', 1;

            INSERT INTO dbo.KhachHang (
                HoTen, CCCD, NgaySinh, GioiTinh, DienThoai, Email, DiaChi,
                NoiLamViec, TinhTrangHonNhan, HocVan, ThuNhapTBThang
            )
            VALUES (
                @HoTen, @CCCD, @NgaySinh, @GioiTinh, @DienThoai, @Email, @DiaChi,
                @NoiLamViec, @TinhTrangHonNhan, @HocVan, @ThuNhapTBThang
            );

            SET @MaKhachHang = SCOPE_IDENTITY();

            WHILE @attempts < 25
            BEGIN
                SET @NewCIF = '264' + RIGHT(
                    '00000' + CAST((@MaKhachHang * 13 + ABS(CHECKSUM(NEWID())) % 90000) AS VARCHAR(5)),
                    5
                );

                IF NOT EXISTS (SELECT 1 FROM dbo.TaiKhoan WHERE CIF = @NewCIF)
                    BREAK;

                SET @attempts = @attempts + 1;
            END;

            IF @NewCIF IS NULL OR EXISTS (SELECT 1 FROM dbo.TaiKhoan WHERE CIF = @NewCIF)
                THROW 50016, N'Khong the sinh CIF unique.', 1;

            SET @attempts = 0;
            SET @SoTaiKhoan = NULL;
            SET @digits = REPLACE(REPLACE(REPLACE(REPLACE(ISNULL(@DienThoai, ''), '.', ''), ' ', ''), '-', ''), '+', '');

            IF LEN(@digits) >= 10
            BEGIN
                SET @digits = RIGHT(@digits, 10);
                SET @SoTaiKhoan = STUFF(STUFF(@digits, 5, 0, '.'), 9, 0, '.');
            END

            WHILE @attempts < 25
            BEGIN
                IF @SoTaiKhoan IS NULL OR EXISTS (SELECT 1 FROM dbo.TaiKhoan WHERE SoTaiKhoan = @SoTaiKhoan)
                BEGIN
                    SET @SoTaiKhoan = '0' + RIGHT(
                        '0000000000' + CAST(ABS(CHECKSUM(NEWID())) % 10000000000 AS VARCHAR(10)),
                        10
                    );
                END
                ELSE
                BEGIN
                    BREAK;
                END

                SET @attempts = @attempts + 1;
            END

            IF @SoTaiKhoan IS NULL OR EXISTS (SELECT 1 FROM dbo.TaiKhoan WHERE SoTaiKhoan = @SoTaiKhoan)
                THROW 50017, N'Khong the sinh so tai khoan unique.', 1;

            INSERT INTO dbo.TaiKhoan (
                MaKhachHang,
                CIF,
                SoTaiKhoan,
                LoaiTaiKhoan,
                NhanLoaiTaiKhoan,
                SoDuHienTai,
                SoDuDongBang,
                TrangThai,
                NganHang,
                LaTaiKhoanChinh
            )
            VALUES (
                @MaKhachHang,
                @NewCIF,
                @SoTaiKhoan,
                'payment',
                N'Tài khoản thanh toán',
                0,
                0,
                'active',
                N'OCB',
                1
            );
        END
        ELSE
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM dbo.KhachHang WHERE MaKhachHang = @MaKhachHang)
                THROW 50018, N'Khong tim thay KhachHang de cap nhat.', 1;

            IF EXISTS (
                SELECT 1
                FROM dbo.KhachHang
                WHERE CCCD = @CCCD
                  AND MaKhachHang <> @MaKhachHang
            )
                THROW 50019, N'CCCD da ton tai trong he thong.', 1;

            UPDATE dbo.KhachHang
            SET
                HoTen = @HoTen,
                CCCD = @CCCD,
                NgaySinh = @NgaySinh,
                GioiTinh = @GioiTinh,
                DienThoai = @DienThoai,
                Email = @Email,
                DiaChi = @DiaChi,
                NoiLamViec = @NoiLamViec,
                TinhTrangHonNhan = @TinhTrangHonNhan,
                HocVan = @HocVan,
                ThuNhapTBThang = @ThuNhapTBThang
            WHERE MaKhachHang = @MaKhachHang;

            SELECT TOP 1 @NewCIF = tk.CIF
            FROM dbo.TaiKhoan tk
            WHERE tk.MaKhachHang = @MaKhachHang
            ORDER BY tk.LaTaiKhoanChinh DESC, tk.MaTaiKhoan;
        END

        COMMIT TRANSACTION;

        SELECT
            @MaKhachHang AS ID,
            N'Thanh cong' AS Message,
            @NewCIF AS CIF;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO

/*
===============================================================================
Test mẫu - chỉ chạy MANUAL.
- Uncomment block bên dưới để test.
- Happy case: thêm khách hàng mới qua SP

Cleanup: DELETE FROM dbo.TaiKhoan WHERE MaKhachHang IN (SELECT MaKhachHang FROM dbo.KhachHang WHERE CCCD = '079299999998'); DELETE FROM dbo.KhachHang WHERE CCCD = '079299999998';
===============================================================================
*/

-- EXEC dbo.SP_KhachHang_ThemCapNhat
--     @MaKhachHang = NULL,
--     @HoTen = N'[TEST] Khach Hang SP',
--     @CCCD = '079299999998',
--     @NgaySinh = '1995-06-01',
--     @GioiTinh = 'male';
--
-- DELETE FROM dbo.TaiKhoan WHERE MaKhachHang IN (SELECT MaKhachHang FROM dbo.KhachHang WHERE CCCD = '079299999998');
-- DELETE FROM dbo.KhachHang WHERE CCCD = '079299999998';

