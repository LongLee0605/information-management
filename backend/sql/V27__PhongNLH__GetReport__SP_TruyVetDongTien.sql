-- =============================================================================
-- V27__PhongNLH__GetReport__SP_TruyVetDongTien.sql
-- SP truy vết dòng tiền giữa các tài khoản/khách hàng
-- =============================================================================

USE QLTT;
GO

IF OBJECT_ID('dbo.SP_TruyVetDongTien', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_TruyVetDongTien;
GO

CREATE PROCEDURE dbo.SP_TruyVetDongTien
    @MaKhachHang    INT             = NULL,
    @MaTaiKhoan     INT             = NULL,
    @TuNgay         DATE            = NULL,
    @DenNgay        DATE            = NULL,
    @SoTienNguong   DECIMAL(18,2)   = NULL   -- chỉ lấy giao dịch >= ngưỡng này
AS
BEGIN
    SET NOCOUNT ON;

    IF @TuNgay  IS NULL SET @TuNgay  = CAST(DATEADD(MONTH, -3, GETDATE()) AS DATE);
    IF @DenNgay IS NULL SET @DenNgay = CAST(GETDATE() AS DATE);

    -- Giao dịch outbound (chi ra)
    SELECT
        'outbound'                  AS HuongDongTien,
        gd.MaGiaoDich,
        gd.NgayGiaoDich,
        gd.SoTien,
        gd.MoTa,
        gd.DanhMuc,
        gd.PhuongThucThanhToan,
        tk.SoTaiKhoan               AS TaiKhoanNguon,
        kh.HoTen                    AS KhachHangNguon,
        kh.MaKhachHang
    FROM dbo.GiaoDich gd
    INNER JOIN dbo.TaiKhoan  tk ON tk.MaTaiKhoan  = gd.MaTaiKhoan
    INNER JOIN dbo.KhachHang kh ON kh.MaKhachHang = tk.MaKhachHang
    WHERE gd.LoaiGiaoDich = 'debit'
      AND CAST(gd.NgayGiaoDich AS DATE) BETWEEN @TuNgay AND @DenNgay
      AND (@MaKhachHang IS NULL OR tk.MaKhachHang = @MaKhachHang)
      AND (@MaTaiKhoan  IS NULL OR gd.MaTaiKhoan  = @MaTaiKhoan)
      AND (@SoTienNguong IS NULL OR gd.SoTien >= @SoTienNguong)

    UNION ALL

    -- Giao dịch inbound (nhận vào)
    SELECT
        'inbound'                   AS HuongDongTien,
        gd.MaGiaoDich,
        gd.NgayGiaoDich,
        gd.SoTien,
        gd.MoTa,
        gd.DanhMuc,
        gd.PhuongThucThanhToan,
        tk.SoTaiKhoan               AS TaiKhoanNguon,
        kh.HoTen                    AS KhachHangNguon,
        kh.MaKhachHang
    FROM dbo.GiaoDich gd
    INNER JOIN dbo.TaiKhoan  tk ON tk.MaTaiKhoan  = gd.MaTaiKhoan
    INNER JOIN dbo.KhachHang kh ON kh.MaKhachHang = tk.MaKhachHang
    WHERE gd.LoaiGiaoDich = 'credit'
      AND CAST(gd.NgayGiaoDich AS DATE) BETWEEN @TuNgay AND @DenNgay
      AND (@MaKhachHang IS NULL OR tk.MaKhachHang = @MaKhachHang)
      AND (@MaTaiKhoan  IS NULL OR gd.MaTaiKhoan  = @MaTaiKhoan)
      AND (@SoTienNguong IS NULL OR gd.SoTien >= @SoTienNguong)

    ORDER BY NgayGiaoDich DESC;
END;
GO
