# Thiết Kế Stored Procedures — MCS_APP_BANK
> Flyway V16 trở đi — chỉ mô tả, không chứa script SQL

---

## Quy ước chung

| Loại         | Tên file Flyway |
|---|---|
| Tìm kiếm     | V{x}__{Author}__Get__{Object}_{Action}.sql |
| Thêm/Cập nhật| V{x}__{Author}__Upsert__{Object}_{Action}.sql |
| Báo cáo      | V{x}__{Author}__GetReport__{Object}_{Action}.sql |

**Output chuẩn cho Upsert/Delete:**
```json
{ "ID": 1, "Message": "Thành công" }   -- thành công
{ "ID": 0, "Message": "CCCD đã tồn tại" } -- thất bại
```

---

## NHÓM KHÁCH HÀNG

### V16__NhanPT__Get__SP_KhachHang_TimKiem
- **SP:** `dbo.sp_KhachHang_TimKiem`
- **Sử dụng:** View `dbo.vw_KhachHang`
- **Input:**
  | Tham số | Kiểu | Mô tả |
  |---|---|---|
  | @CIF | VARCHAR(20) | NULL = bỏ qua |
  | @CCCD | VARCHAR(12) | NULL = bỏ qua |
  | @HoTen | NVARCHAR(100) | tìm LIKE %HoTen% |
  | @NamSinh | SMALLINT | NULL = bỏ qua |
  | @TrangThai | BIT | NULL = tất cả, 1=active |
  | @PageNumber | INT | DEFAULT 1 |
  | @PageSize | INT | DEFAULT 10 |
- **Output:** Danh sách từ `vw_KhachHang` + cột `TotalRow` (phân trang)
- **Validate:** Không cần (chỉ đọc)

---

### V17__AnhTPQ__Upsert__SP_KhachHang_ThemCapNhat
- **SP:** `dbo.SP_KhachHang_ThemCapNhat`
- **Input:**
  | Tham số | Kiểu | Bắt buộc | Mô tả |
  |---|---|---|---|
  | @MaKhachHang | INT | Không | NULL/0 = thêm mới, >0 = cập nhật |
  | @CCCD | VARCHAR(12) | Có | |
  | @HoTen | NVARCHAR(100) | Có | |
  | @NgaySinh | DATE | Có | (schema V5 — thay cho @NamSinh) |
  | @GioiTinh | VARCHAR(6) | Có | `male` / `female` |
  | @DienThoai | VARCHAR(15) | Không | |
  | @Email, @DiaChi, @NoiLamViec, … | | Không | |
- **Validate:**
  1. `@CCCD` đúng 12 chữ số
  2. `@HoTen` không rỗng
  3. `YEAR(@NgaySinh)` trong khoảng 1900–2010
  4. `@GioiTinh` IN (`male`, `female`)
  5. CCCD trùng (UPDATE bỏ qua chính record)
  6. INSERT: tự sinh CIF `264XXXXX` + tài khoản thanh toán chính (để V20 mở thêm TK)
- **Output:** `{ ID, Message, CIF }`
- **Lưu ý:** Trigger `TR_KhachHang_ValidateInsert` (V11) bổ sung validate

---

### V18__VietVH__Upsert__SP_KhachHang_Xoa
- **SP:** `dbo.sp_KhachHang_Xoa`  *(soft delete — set IsActive = 0)*
- **Input:** `@KhachHangID INT`
- **Validate:**
  1. KhachHangID tồn tại
  2. Không có tài khoản `active` — nếu có, từ chối xóa
- **Output:** `{ ID, Message }`

---

## NHÓM TÀI KHOẢN

### V6__LoiLCA__Create__Table_TaiKhoan
- **Bảng:** `dbo.TaiKhoan`
- **Cột chính:**
  | Cột | Kiểu | Mô tả |
  |---|---|---|
  | MaTaiKhoan | INT IDENTITY | PK |
  | MaKhachHang | INT | FK → KhachHang |
  | CIF | VARCHAR(20) | Mã CIF (cùng KH dùng chung CIF) |
  | SoTaiKhoan | VARCHAR(20) | Unique toàn hệ thống |
  | LoaiTaiKhoan | VARCHAR(20) | `payment` / `savings` / `debit` / `overdraft` |
  | SoDuHienTai | DECIMAL(18,2) | Số dư hiện tại |
  | SoDuDongBang | DECIMAL(18,2) | Số dư phong tỏa (view V9 alias `SoDuPhongToa`) |
  | TrangThai | VARCHAR(10) | `active` / `inactive` |
- **Ràng buộc:** `SoDuHienTai >= 0`, `SoDuDongBang >= 0`; số dư khả dụng = `SoDuHienTai − SoDuDongBang` (khi active)
- **Index:** MaKhachHang, CIF, (CIF, MaKhachHang)
- **Lưu ý:** Đóng băng số dư khi inactive do trigger V12 `TR_TaiKhoan_DongBangSoDu`

### V14__LoiLCA__Insert__SampleData_TaiKhoan
- **Mục đích:** 10 khách hàng mẫu; mỗi KH một CIF `264xxxxx` riêng
- **Idempotent:** Chỉ INSERT khi chưa có dữ liệu mẫu

### V19__LongLTD__Get__SP_TaiKhoan_TimKiem
- **SP:** `dbo.sp_TaiKhoan_TimKiem`
- **Sử dụng:** View `dbo.vw_TaiKhoan`
- **Input:**
  | Tham số | Kiểu |
  |---|---|
  | @CIF | VARCHAR(20) |
  | @SoTaiKhoan | VARCHAR(20) |
  | @LoaiTaiKhoan | NVARCHAR(20) | NULL = tất cả |
  | @TrangThai | VARCHAR(10) | NULL = tất cả |
  | @PageNumber | INT |
  | @PageSize | INT |
- **Output:** Danh sách từ `vw_TaiKhoan` + `TotalRow`

---

### V20__PhongNLH__Upsert__SP_TaiKhoan_MoTaiKhoan
- **SP:** `dbo.SP_TaiKhoan_MoTaiKhoan`
- **Input:**
  | Tham số | Kiểu | Bắt buộc |
  |---|---|---|
  | @CIF | VARCHAR(20) | Có |
  | @LoaiTaiKhoan | NVARCHAR(20) | Có — `payment`/`savings` hoặc `N'Thanh toán'`/`N'Tiết kiệm'` |
- **Validate:**
  1. CIF tồn tại trên ít nhất một tài khoản active
  2. LoaiTaiKhoan IN (`payment`, `savings` hoặc nhãn tiếng Việt tương ứng)
  3. Mỗi khách hàng tối đa 1 tài khoản/loại
- **Tự sinh số tài khoản:**
  - Tiết kiệm: `00206` + 11 số ngẫu nhiên (check unique)
  - Thanh toán: format `DienThoai` → `XXXX.XXX.XXX`, fallback số ngẫu nhiên
- **Output:** `{ ID, Message, SoTaiKhoan }`
- **Lưu ý:** Trigger tự ghi audit log; toggle khóa/mở dùng V21 `SP_TaiKhoan_CapNhatTrangThai`

---

### V21__HuyTND__Upsert__SP_TaiKhoan_CapNhatTrangThai
- **SP:** `dbo.sp_TaiKhoan_CapNhatTrangThai`
- **Input:** `@TaiKhoanID INT`, `@TrangThai VARCHAR(10)`
- **Validate:**
  1. TaiKhoanID tồn tại
  2. TrangThai IN ('active','inactive')
  3. Nếu inactive: kiểm tra SoDuPhongToa = 0
- **Output:** `{ ID, Message }`

---

## NHÓM GIAO DỊCH

### V22__TrangTTN__Get__SP_GiaoDich_TimKiem
- **SP:** `dbo.sp_GiaoDich_TimKiem`
- **Sử dụng:** View `dbo.VW_GiaoDich`
- **Input:**
  | Tham số | Kiểu |
  |---|---|
  | @CIF | VARCHAR(20) | tìm ở cả nguồn lẫn đích |
  | @SoTaiKhoan | VARCHAR(20) | tìm ở cả nguồn lẫn đích |
  | @TuNgay | DATETIME |
  | @DenNgay | DATETIME |
  | @HinhThuc | VARCHAR(10) | NULL = tất cả |
  | @IsGhiNo | BIT | NULL = tất cả |
  | @PageNumber | INT |
  | @PageSize | INT |
- **Output:** Danh sách từ `VW_GiaoDich` + `TotalRow`

---

### V23__LoiLCA__Upsert__SP_GiaoDich_TaoGiaoDich
- **SP:** `dbo.SP_GiaoDich_TaoGiaoDich`
- **Backend:** `POST /api/transactions` — map `accountId` → `@MaTaiKhoan`, `type` → `@LoaiGiaoDich`, `destinationAccountId` → `@MaTaiKhoanDich`
- **Input:**
  | Tham số | Kiểu | Bắt buộc | Mô tả |
  |---|---|---|---|
  | @MaTaiKhoan | INT | Có | Tài khoản ghi nhận giao dịch |
  | @LoaiGiaoDich | VARCHAR(10) | Có | `credit` / `debit` |
  | @SoTien | DECIMAL(18,2) | Có | > 0 |
  | @MoTa | NVARCHAR(500) | Không | |
  | @DanhMuc | NVARCHAR(100) | Không | Ví dụ: `Chuyển khoản` |
  | @PhuongThucThanhToan | NVARCHAR(50) | Không | Ví dụ: `Chuyển khoản`, `NAPAS` |
  | @MaTaiKhoanDich | INT | Không | Chỉ với `debit` — TK đích (truy vết dòng tiền F1) |
- **Validate (theo thứ tự):**
  1. `@LoaiGiaoDich` IN (`credit`, `debit`)
  2. `@SoTien` > 0
  3. `@MaTaiKhoan` tồn tại, `TrangThai = 'active'`
  4. Nếu có `@MaTaiKhoanDich`: chỉ `debit`; TK đích tồn tại, active, khác TK nguồn, **khác MaKhachHang**
  5. **Debit:** `SoDuHienTai − SoDuDongBang >= @SoTien`
- **Side-effect:** INSERT `GiaoDich`; cập nhật `SoDuHienTai` (+ credit / − debit)
- **Output:** `{ MaGiaoDich, NgayGiaoDich, LoaiGiaoDich, SoTien, MaTaiKhoanDich, SoDuSauGiaoDich }`
- **Không có UPDATE/DELETE** (giao dịch bất biến)
- **Lưu ý:** Chuyển khoản FE tạo 2 lần gọi — debit (có `MaTaiKhoanDich`) + credit (không có đích)

---

## NHÓM BÁO CÁO

### V24__AnhTPQ__GetReport__SP_BaoCao_TongQuan
- **SP:** `dbo.SP_BaoCao_TongQuan`
- **Input:** `@TuNgay DATETIME`, `@DenNgay DATETIME`, `@CIF VARCHAR(20)` (NULL = toàn hệ thống)
- **Output (1 row — stat cards):**
  ```json
  {
    "TongGiaoDich": 9,
    "TongGhiNo": 228300000,
    "TongGhiCo": 287700000,
    "NapasCount": 5,
    "NoiBoCount": 4
  }
  ```
  *`TongGhiNo` = debit, `TongGhiCo` = credit; `NoiBoCount` = giao dịch không qua NAPAS*

---

### V25__VietVH__GetReport__SP_BaoCao_BieuDoTheoThang
- **SP:** `dbo.sp_BaoCao_BieuDoTheoThang`
- **Mục đích:** Cung cấp dữ liệu cho LineChart (Recharts) Ghi Nợ / Ghi Có theo tháng
- **Input:** `@TuNgay DATETIME`, `@DenNgay DATETIME`
- **Output (1 row/tháng — khớp với `lineData` trong Overview.tsx):**
  ```json
  [
    { "date": "T7/25", "debit": 15000000, "credit": 50000000 },
    { "date": "T8/25", "debit": 0,        "credit": 0 },
    ...
  ]
  ```
  *Recharts `<Line dataKey="debit">` và `<Line dataKey="credit">` map trực tiếp.*

---

### V26__LongLTD__GetReport__SP_BaoCao_PieChart
- **SP:** `dbo.sp_BaoCao_PieChart`
- **Input:** `@TuNgay DATETIME`, `@DenNgay DATETIME`
- **Output (khớp với `pieData` trong Overview.tsx):**
  ```json
  [
    { "name": "NAPAS",   "value": 56 },
    { "name": "Nội Bộ", "value": 44 }
  ]
  ```
  *Value là phần trăm. Recharts `<Pie dataKey="value">` map trực tiếp.*

---

### V27__LongLTD__GetReport__SP_MoneyFlowTrace
- **SP:** `dbo.SP_TruyVetDongTien`
- **Schema:** thêm `GiaoDich.MaTaiKhoanDich` (FK → TaiKhoan) trong cùng script
- **Mục đích:** Truy vết đồ thị dòng tiền F0→F3 theo CIF/tài khoản gốc
- **Input:**
  | Tham số | Kiểu | Mô tả |
  |---|---|---|
  | @CIFGoc | VARCHAR(20) | CIF tài khoản F0 |
  | @SoTaiKhoan | VARCHAR(20) | Số TK F0 (hoặc CIF) |
  | @MaKhachHang | INT | Tùy chọn — lookup theo mã KH |
  | @MaTaiKhoan | INT | Tùy chọn — lookup theo mã TK |
  | @TuNgay | DATE | NULL = 12 tháng trước |
  | @DenNgay | DATE | NULL = hôm nay |
  | @MaxLevel | INT | DEFAULT 3, tối đa 5 |
  | @SoTienNguong | DECIMAL(18,2) | NULL = không lọc |
- **Kỹ thuật:** Recursive CTE; lọc `[TRUYVET] KH{n}-F{level}`; loại chuyển cho chính mình
- **Output:** Flat rows (CapDo, MaTaiKhoan, MaTaiKhoanNguon, CIF, HoTen, SoTaiKhoan, SoTien, …) — FE build cây nhiều nhánh
- **Validate:**
  1. CIFGoc / SoTaiKhoan / MaKhachHang / MaTaiKhoan — ít nhất một cách xác định F0
  2. TuNgay ≤ DenNgay (tự hoán đổi nếu ngược)
  3. MaxLevel 1–5

---

### V28__LongLTD__Insert__SampleData_Transactions_Extended
- **Mục đích:** Dữ liệu mẫu mở rộng sau V15
- **Phần 1 `[TRUYVET]`:** Chuỗi F1–F3 (2–4 người/cấp), tháng 4/2025, có `MaTaiKhoanDich`
- **Phần 2 `[DEMO-TXN]`:** ~50 giao dịch/KH, rải 2025-01-01 → GETDATE()

---

### V29__LongLTD__Upsert__SP_Account_SyncBalance
- **SP:** `dbo.SP_TaiKhoan_DongBoSoDu`
- **Mục đích:** Đồng bộ `SoDuHienTai` sau INSERT mẫu (V15/V28 không qua SP_GiaoDich_TaoGiaoDich)
- **Công thức:** `SoDuHienTai = SoDuKhoiTao (V14) + SUM(credit) − SUM(debit)`
- **Chạy:** Tự động `EXEC` cuối script migrate

---

## Phân công tổng hợp

| Version | Script | Người thực hiện |
|---|---|---|
| V1  | Create Database | LamLP |
| V2  | Create GroupRole | LamLP |
| V3  | Create User | LamLP |
| V4  | Grant Permissions | LamLP |
| V5  | Table KhachHang + AuditLog | NhanPT |
| V6  | Table TaiKhoan | LoiLCA |
| V7  | Table GiaoDich | HuyTND |
| V8  | View VW_KhachHang | AnhTPQ |
| V9  | View vw_TaiKhoan | LongLTD |
| V10 | View VW_GiaoDich | PhongNLH |
| V11 | Trigger KhachHang | TrangTTN |
| V12 | Trigger TaiKhoan | HuyTND |
| V13 | Insert KhachHang | NhanPT |
| V14 | Insert TaiKhoan | LoiLCA |
| V15 | Insert GiaoDich | TrangTTN |
| V16 | SP KhachHang TimKiem | NhanPT |
| V17 | SP KhachHang ThemCapNhat | AnhTPQ |
| V18 | SP KhachHang Xoa | VietVH |
| V19 | SP TaiKhoan TimKiem | LongLTD |
| V20 | SP TaiKhoan MoTaiKhoan | PhongNLH |
| V21 | SP TaiKhoan CapNhatTrangThai | HuyTND |
| V22 | SP GiaoDich TimKiem | TrangTTN |
| V23 | SP GiaoDich TaoGiaoDich | LoiLCA |
| V24 | SP BaoCao TongQuan | AnhTPQ |
| V25 | SP BaoCao BieuDoTheoThang | VietVH |
| V26 | SP BaoCao PieChart | LongLTD |
| V27 | Alter Transaction + SP MoneyFlowTrace | LongLTD |
| V28 | Insert Transactions Extended (TRUYVET + DEMO) | LongLTD |
| V29 | SP Account SyncBalance | LongLTD |
| V30 | SP MoneyFlowTrace (real transfers + limits) | LongLTD |
