-- =============================================================================
-- V16__NhanPT__Get__SP_KhachHang_TimKiem.sql
-- SP tìm kiếm khách hàng theo nhiều tiêu chí
-- =============================================================================

USE QLTT;
GO

IF OBJECT_ID('dbo.SP_KhachHang_TimKiem', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_KhachHang_TimKiem;
GO

CREATE PROCEDURE dbo.SP_KhachHang_TimKiem
    @HoTen      NVARCHAR(100)   = NULL,
    @CCCD       VARCHAR(12)     = NULL,
    @DienThoai  VARCHAR(15)     = NULL,
    @GioiTinh   VARCHAR(6)      = NULL,
    @PageNumber INT             = 1,
    @PageSize   INT             = 20
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        kh.MaKhachHang,
        kh.HoTen,
        kh.CCCD,
        kh.NgaySinh,
        kh.GioiTinh,
        kh.DienThoai,
        kh.Email,
        kh.DiaChi,
        kh.ThuNhapTBThang,
        COUNT(*) OVER () AS TongSoKetQua
    FROM dbo.KhachHang kh
    WHERE
        (@HoTen     IS NULL OR kh.HoTen     LIKE N'%' + @HoTen + N'%')
        AND (@CCCD      IS NULL OR kh.CCCD      = @CCCD)
        AND (@DienThoai IS NULL OR kh.DienThoai = @DienThoai)
        AND (@GioiTinh  IS NULL OR kh.GioiTinh  = @GioiTinh)
    ORDER BY kh.HoTen
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END;
GO
