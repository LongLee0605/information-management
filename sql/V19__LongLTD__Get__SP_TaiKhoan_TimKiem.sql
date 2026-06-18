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
    @MaKhachHang    INT             = NULL,
    @SoTaiKhoan     VARCHAR(20)     = NULL,
    @LoaiTaiKhoan   VARCHAR(20)     = NULL,
    @TrangThai      VARCHAR(10)     = NULL,
    @NganHang       NVARCHAR(50)    = NULL,
    @PageNumber     INT             = 1,
    @PageSize       INT             = 20
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        tk.MaTaiKhoan,
        tk.SoTaiKhoan,
        tk.LoaiTaiKhoan,
        tk.NhanLoaiTaiKhoan,
        tk.SoDuHienTai,
        tk.SoDuDongBang,
        tk.SoDuHienTai - tk.SoDuDongBang AS SoDuKhaDung,
        tk.TrangThai,
        tk.NganHang,
        tk.LaTaiKhoanChinh,
        kh.MaKhachHang,
        kh.HoTen,
        kh.DienThoai,
        COUNT(*) OVER () AS TongSoKetQua
    FROM dbo.TaiKhoan tk
    INNER JOIN dbo.KhachHang kh ON kh.MaKhachHang = tk.MaKhachHang
    WHERE
        (@MaKhachHang   IS NULL OR tk.MaKhachHang  = @MaKhachHang)
        AND (@SoTaiKhoan IS NULL OR tk.SoTaiKhoan   = @SoTaiKhoan)
        AND (@LoaiTaiKhoan IS NULL OR tk.LoaiTaiKhoan = @LoaiTaiKhoan)
        AND (@TrangThai  IS NULL OR tk.TrangThai    = @TrangThai)
        AND (@NganHang   IS NULL OR tk.NganHang     LIKE N'%' + @NganHang + N'%')
    ORDER BY kh.HoTen, tk.LaTaiKhoanChinh DESC
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END;
GO
