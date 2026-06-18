-- =============================================================================
-- V19__LongLTD__Get__SP_TaiKhoan_TimKiem.sql
-- SP tìm kiếm tài khoản theo nhiều tiêu chí
-- =============================================================================

USE QLTT;
GO

IF OBJECT_ID('dbo.SP_TaiKhoan_TimKiem', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_TaiKhoan_TimKiem;
GO

CREATE PROCEDURE dbo.SP_TaiKhoan_TimKiem
    @MaKhachHang    INT             = NULL, -- giữ tương thích API hiện tại
    @CIF            VARCHAR(20)     = NULL, -- theo SP_DESIGN
    @SoTaiKhoan     VARCHAR(20)     = NULL,
    @LoaiTaiKhoan   VARCHAR(20)     = NULL,
    @TrangThai      VARCHAR(10)     = NULL,
    @NganHang       NVARCHAR(50)    = NULL,
    @PageNumber     INT             = 1,
    @PageSize       INT             = 20
AS
BEGIN
    SET NOCOUNT ON;

    IF @PageNumber IS NULL OR @PageNumber < 1 SET @PageNumber = 1;
    IF @PageSize   IS NULL OR @PageSize   < 1 SET @PageSize   = 20;
    IF @PageSize > 500 SET @PageSize = 500;

    SELECT
        v.MaTaiKhoan,
        v.SoTaiKhoan,
        v.LoaiTaiKhoan,
        v.NhanLoaiTaiKhoan,
        v.SoDuHienTai,
        v.SoDuDongBang,
        v.SoDuPhongToa,
        v.SoDuKhaDung,
        v.TrangThai,
        v.NganHang,
        v.LaTaiKhoanChinh,
        v.MaKhachHang,
        v.HoTen,
        v.DienThoai,
        v.CIF,
        COUNT(*) OVER () AS TongSoKetQua
    FROM dbo.VW_TaiKhoan v
    WHERE
        (@MaKhachHang IS NULL OR v.MaKhachHang = @MaKhachHang)
        AND (@CIF IS NULL OR v.CIF = @CIF)
        AND (@SoTaiKhoan IS NULL OR v.SoTaiKhoan = @SoTaiKhoan)
        AND (@LoaiTaiKhoan IS NULL OR v.LoaiTaiKhoan = @LoaiTaiKhoan)
        AND (@TrangThai IS NULL OR v.TrangThai = @TrangThai)
        AND (@NganHang IS NULL OR v.NganHang LIKE N'%' + @NganHang + N'%')
    ORDER BY v.HoTen, v.LaTaiKhoanChinh DESC, v.MaTaiKhoan
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END;
GO
