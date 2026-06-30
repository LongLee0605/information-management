/*
===============================================================================
Author      : 26410089 - Nguyễn Lê Hoài Phong
File        : V20__PhongNLH__Upsert__SP_TaiKhoan_MoTaiKhoan.sql
Part        : 6.5 - SP_TaiKhoan_MoTaiKhoan
Purpose     : SP mở tài khoản mới cho khách hàng theo CIF

Yêu cầu đề bài:
- Mở tài khoản payment hoặc savings theo CIF
- Mỗi khách hàng tối đa 1 tài khoản/loại
- Tự sinh số tài khoản unique
- Trigger TR_TaiKhoan_AuditLog ghi audit khi mở tài khoản (phụ thuộc AuditLog V5)
===============================================================================
*/

USE QLTT;
GO

/*
===============================================================================
Create procedure SP_TaiKhoan_MoTaiKhoan
Purpose     : SP mở tài khoản mới cho khách hàng theo CIF
===============================================================================
*/
IF OBJECT_ID('dbo.SP_TaiKhoan_MoTaiKhoa', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_TaiKhoan_MoTaiKhoa;
GO

IF OBJECT_ID('dbo.SP_TaiKhoan_MoTaiKhoan', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_TaiKhoan_MoTaiKhoan;
GO

CREATE PROCEDURE dbo.SP_TaiKhoan_MoTaiKhoan
    @CIF            VARCHAR(20),
    @LoaiTaiKhoan   NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        DECLARE @MaKhachHang        INT;
        DECLARE @LoaiNormalized     VARCHAR(20);
        DECLARE @NhanLoai           NVARCHAR(50);
        DECLARE @SoTaiKhoan         VARCHAR(20);
        DECLARE @NganHang           NVARCHAR(50);
        DECLARE @DienThoai          VARCHAR(15);
        DECLARE @LaTaiKhoanChinh    BIT;
        DECLARE @NewId              INT;
        DECLARE @attempts           INT;

        SET @LoaiNormalized = CASE
            WHEN @LoaiTaiKhoan IN (N'Thanh toán', N'Thanh toan', 'payment') THEN 'payment'
            WHEN @LoaiTaiKhoan IN (N'Tiết kiệm', N'Tiet kiem', 'savings') THEN 'savings'
            ELSE NULL
        END;

        IF @LoaiNormalized IS NULL
            THROW 50030, N'LoaiTaiKhoan chi chap nhan payment/savings hoac N''Thanh toan''/N''Tiet kiem''.', 1;

        IF NULLIF(LTRIM(RTRIM(@CIF)), '') IS NULL
            THROW 50031, N'CIF khong duoc rong.', 1;

        SELECT TOP 1
            @MaKhachHang = tk.MaKhachHang,
            @NganHang = tk.NganHang
        FROM dbo.TaiKhoan tk
        WHERE tk.CIF = @CIF
        ORDER BY tk.LaTaiKhoanChinh DESC, tk.MaTaiKhoan;

        IF @MaKhachHang IS NULL
            THROW 50032, N'Khong tim thay khach hang voi CIF da cho.', 1;

        IF NOT EXISTS (
            SELECT 1
            FROM dbo.TaiKhoan
            WHERE CIF = @CIF
              AND TrangThai = 'active'
        )
            THROW 50033, N'Khach hang khong co tai khoan active.', 1;

        IF EXISTS (
            SELECT 1
            FROM dbo.TaiKhoan
            WHERE MaKhachHang = @MaKhachHang
              AND LoaiTaiKhoan = @LoaiNormalized
        )
            THROW 50034, N'Moi khach hang chi duoc mo toi da 1 tai khoan/loai.', 1;

        SELECT @DienThoai = kh.DienThoai
        FROM dbo.KhachHang kh
        WHERE kh.MaKhachHang = @MaKhachHang;

        SET @NhanLoai = CASE @LoaiNormalized
            WHEN 'payment' THEN N'Tài khoản thanh toán'
            ELSE N'Tài khoản tiết kiệm'
        END;

        SET @LaTaiKhoanChinh = CASE
            WHEN NOT EXISTS (
                SELECT 1 FROM dbo.TaiKhoan WHERE MaKhachHang = @MaKhachHang
            ) THEN 1
            ELSE 0
        END;

        SET @attempts = 0;

        IF @LoaiNormalized = 'savings'
        BEGIN
            WHILE @attempts < 25
            BEGIN
                SET @SoTaiKhoan = '00206' + RIGHT(
                    '00000000000' + CAST(ABS(CHECKSUM(NEWID())) % 100000000000 AS VARCHAR(11)),
                    11
                );

                IF NOT EXISTS (SELECT 1 FROM dbo.TaiKhoan WHERE SoTaiKhoan = @SoTaiKhoan)
                    BREAK;

                SET @attempts = @attempts + 1;
            END;
        END
        ELSE
        BEGIN
            DECLARE @digits VARCHAR(20) = REPLACE(REPLACE(REPLACE(REPLACE(ISNULL(@DienThoai, ''), '.', ''), ' ', ''), '-', ''), '+', '');

            IF LEN(@digits) >= 10
            BEGIN
                SET @digits = RIGHT(@digits, 10);
                SET @SoTaiKhoan = STUFF(STUFF(@digits, 5, 0, '.'), 9, 0, '.');
            END
            ELSE
            BEGIN
                SET @SoTaiKhoan = NULL;
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
        END

        IF @SoTaiKhoan IS NULL OR EXISTS (SELECT 1 FROM dbo.TaiKhoan WHERE SoTaiKhoan = @SoTaiKhoan)
            THROW 50035, N'Khong the sinh so tai khoan unique.', 1;

        BEGIN TRANSACTION;

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
            @CIF,
            @SoTaiKhoan,
            @LoaiNormalized,
            @NhanLoai,
            0,
            0,
            'active',
            ISNULL(@NganHang, N'OCB'),
            @LaTaiKhoanChinh
        );

        SET @NewId = SCOPE_IDENTITY();

        COMMIT TRANSACTION;

        SELECT
            @NewId AS ID,
            N'Thanh cong' AS Message,
            @SoTaiKhoan AS SoTaiKhoan;
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
Create trigger TR_TaiKhoan_AuditLog
Purpose     : Ghi AuditLog khi INSERT tài khoản mới
===============================================================================
*/
IF OBJECT_ID('dbo.TR_TaiKhoan_AuditLog', 'TR') IS NOT NULL
    DROP TRIGGER dbo.TR_TaiKhoan_AuditLog;
GO

CREATE TRIGGER dbo.TR_TaiKhoan_AuditLog
ON dbo.TaiKhoan
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.AuditLog (TenBang, MaBanGhi, HanhDong, NoiDung, NguoiThucHien)
    SELECT
        'TaiKhoan',
        i.MaTaiKhoan,
        'INSERT',
        N'Mo tai khoan: ' + i.SoTaiKhoan + N' (' + i.LoaiTaiKhoan + N', CIF ' + i.CIF + N')',
        SUSER_SNAME()
    FROM inserted i;
END;
GO

/*
===============================================================================
Test mẫu - chỉ chạy MANUAL.
- Uncomment block bên dưới để test.
- Happy case: mở tài khoản savings cho CIF seed (nếu chưa có loại savings)

Cleanup: UPDATE dbo.TaiKhoan SET TrangThai = 'inactive' WHERE SoTaiKhoan = @NewSoTaiKhoan;
===============================================================================
*/

-- DECLARE @NewSoTaiKhoan VARCHAR(20);
-- EXEC dbo.SP_TaiKhoan_MoTaiKhoan @CIF = '26410052', @LoaiTaiKhoan = 'savings';
-- SET @NewSoTaiKhoan = (SELECT TOP 1 SoTaiKhoan FROM dbo.TaiKhoan WHERE CIF = '26410052' AND LoaiTaiKhoan = 'savings' ORDER BY MaTaiKhoan DESC);
-- UPDATE dbo.TaiKhoan SET TrangThai = 'inactive' WHERE SoTaiKhoan = @NewSoTaiKhoan;

