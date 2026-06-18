-- =============================================================================
-- V13__NhanPT__Insert__SampleData_KhachHang.sql
-- Chèn dữ liệu mẫu vào bảng KhachHang
-- Dựa theo mock data trong src/data/users.json
-- =============================================================================

USE QLTT;
GO

SET IDENTITY_INSERT dbo.KhachHang OFF;
GO

INSERT INTO dbo.KhachHang (HoTen, CCCD, NgaySinh, GioiTinh, DienThoai, Email, DiaChi, NoiLamViec, TinhTrangHonNhan, HocVan, ThuNhapTBThang)
VALUES
    (N'Lê Phước Lâm',          '079193012345', '1993-02-01', 'male',   '0901234567', 'lephuoclam@gmail.com',          N'123 Lê Lợi, Quận 1, TP. Hồ Chí Minh',         N'Trường THPT Lê Quý Đôn, Quận 3',      N'Đã kết hôn',   N'Đại học Sư phạm',           18500000),
    (N'Lê Công Anh Lợi',       '079199067891', '1999-07-06', 'male',   '0912345678', 'leconganhloi@hospital.vn',      N'45 Giải Phóng, Hai Bà Trưng, Hà Nội',          N'Bệnh viện Bạch Mai',                  N'Đã kết hôn',   N'Bác sĩ chuyên khoa II',      45000000),
    (N'Phan Thanh Nhân',        '079195034567', '1995-04-03', 'male',   '0923456789', 'phanthanhnhan.dev@gmail.com',   N'789 Cách Mạng Tháng Tám, Quận 10, TP.HCM',    N'Công ty TNHH Phần Mềm ABC',           N'Độc thân',     N'Kỹ sư CNTT',                 32000000),
    (N'Trần Thị Ngọc Trang',    '079202056789', '2002-11-15', 'female', '0934567890', 'trantngoctrang@email.com',      N'12 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',      N'Sinh viên Đại học UIT',               N'Độc thân',     N'Sinh viên',                  5000000),
    (N'Nguyễn Lê Hoài Phong',   '079198045678', '1998-09-22', 'male',   '0945678901', 'nguyenlhoaiphong@techcorp.vn',  N'56 Đinh Tiên Hoàng, Bình Thạnh, TP.HCM',      N'TechCorp Vietnam',                    N'Độc thân',     N'Kỹ sư phần mềm',             28000000),
    (N'Võ Hoàng Việt',          '079197034901', '1997-03-10', 'male',   '0956789012', 'vohoangviet@startup.io',        N'234 Lý Tự Trọng, Quận 1, TP. Hồ Chí Minh',    N'Startup XYZ',                         N'Độc thân',     N'Cử nhân Kinh tế',            22000000),
    (N'Trần Nguyễn Đăng Huy',   '079200078901', '2000-08-14', 'male',   '0967890123', 'trannguyendanghuy@gmail.com',   N'89 Phan Văn Trị, Gò Vấp, TP. Hồ Chí Minh',   N'Freelance Developer',                 N'Độc thân',     N'Sinh viên CNTT',             15000000),
    (N'Trần Phúc Quyền Anh',    '079201089012', '2001-05-20', 'male',   '0978901234', 'tranphucquyenanh@gmail.com',    N'167 Bùi Viện, Quận 1, TP. Hồ Chí Minh',       N'Sinh viên Đại học UIT',               N'Độc thân',     N'Sinh viên',                  6000000),
    (N'Lê Trần Đăng Long',      '079200067890', '2000-06-05', 'male',   '0989012345', 'letrandanglong@gmail.com',      N'321 Võ Văn Tần, Quận 3, TP. Hồ Chí Minh',     N'Lập trình viên tự do',                N'Độc thân',     N'Kỹ sư CNTT',                 20000000),
    (N'Nguyễn Quốc Dũng',       '079196023456', '1996-12-28', 'male',   '0990123456', 'nguyenquocdung@company.vn',     N'78 Trần Hưng Đạo, Quận 5, TP. Hồ Chí Minh',   N'Công ty Tài chính VN',               N'Đã kết hôn',   N'Thạc sĩ Tài chính',          55000000);
GO
