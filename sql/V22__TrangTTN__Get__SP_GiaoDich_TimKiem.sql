-- =============================================================================
-- V22__TrangTTN__Get__SP_GiaoDich_TimKiem.sql
-- SP tìm kiếm giao dịch theo nhiều tiêu chí
-- =============================================================================

USE QLTT;
GO

IF OBJECT_ID('dbo.SP_GiaoDich_TimKiem', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_GiaoDich_TimKiem;
GO

CREATE PROCEDURE dbo.SP_GiaoDich_TimKiem
    @MaTaiKhoan         INT             = NULL,
    @MaKhachHang        INT             = NULL,
    @LoaiGiaoDich       VARCHAR(10)     = NULL,
    @TuNgay             DATETIME2(0)    = NULL,
    @DenNgay            DATETIME2(0)    = NULL,
    @DanhMuc            NVARCHAR(100)   = NULL,
    @SoTienToiThieu     DECIMAL(18,2)   = NULL,
    @SoTienToiDa        DECIMAL(18,2)   = NULL,
    @PageNumber         INT             = 1,
    @PageSize           INT             = 20
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        gd.MaGiaoDich,
        gd.NgayGiaoDich,
        gd.LoaiGiaoDich,
        gd.SoTien,
        gd.MoTa,
        gd.DanhMuc,
        gd.PhuongThucThanhToan,
        tk.MaTaiKhoan,
        tk.SoTaiKhoan,
        tk.NganHang,
        kh.MaKhachHang,
        kh.HoTen,
        COUNT(*) OVER () AS TongSoKetQua
    FROM dbo.GiaoDich gd
    INNER JOIN dbo.TaiKhoan  tk ON tk.MaTaiKhoan  = gd.MaTaiKhoan
    INNER JOIN dbo.KhachHang kh ON kh.MaKhachHang = tk.MaKhachHang
    WHERE
        (@MaTaiKhoan     IS NULL OR gd.MaTaiKhoan  = @MaTaiKhoan)
        AND (@MaKhachHang IS NULL OR tk.MaKhachHang = @MaKhachHang)
        AND (@LoaiGiaoDich IS NULL OR gd.LoaiGiaoDich = @LoaiGiaoDich)
        AND (@TuNgay      IS NULL OR gd.NgayGiaoDich >= @TuNgay)
        AND (@DenNgay     IS NULL OR gd.NgayGiaoDich <= @DenNgay)
        AND (@DanhMuc     IS NULL OR gd.DanhMuc LIKE N'%' + @DanhMuc + N'%')
        AND (@SoTienToiThieu IS NULL OR gd.SoTien >= @SoTienToiThieu)
        AND (@SoTienToiDa    IS NULL OR gd.SoTien <= @SoTienToiDa)
    ORDER BY gd.NgayGiaoDich DESC
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END;
GO
