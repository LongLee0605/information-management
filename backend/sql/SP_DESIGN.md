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
- **SP:** `dbo.sp_KhachHang_ThemCapNhat`
- **Input:**
  | Tham số | Kiểu | Bắt buộc | Mô tả |
  |---|---|---|---|
  | @KhachHangID | INT | Không | 0/NULL = thêm mới, >0 = cập nhật |
  | @CCCD | VARCHAR(12) | Có | |
  | @HoTen | NVARCHAR(100) | Có | |
  | @NamSinh | SMALLINT | Có | |
  | @GioiTinh | NVARCHAR(5) | Có | 'Nam'/'Nữ' |
  | @DiaChi | NVARCHAR(300) | Không | |
  | @SoDienThoai | VARCHAR(15) | Không | |
- **Validate trước khi xử lý:**
  1. `@CCCD` không rỗng, đúng 12 ký số
  2. `@HoTen` không rỗng
  3. `@NamSinh` trong khoảng 1900–2010
  4. `@GioiTinh` IN ('Nam','Nữ')
  5. Kiểm tra CCCD trùng (bỏ qua chính record nếu UPDATE)
  6. Nếu thêm mới: tự sinh CIF theo format 264XXXXXX
- **Output:** `{ ID, Message }` — CIF mới nếu INSERT thành công
- **Lưu ý:** Trigger `trg_AuditLog_KhachHang` tự ghi log

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
- **SP:** `dbo.sp_TaiKhoan_MoTaiKhoan`
- **Input:**
  | Tham số | Kiểu | Bắt buộc |
  |---|---|---|
  | @CIF | VARCHAR(20) | Có |
  | @LoaiTaiKhoan | NVARCHAR(20) | Có |
- **Validate:**
  1. CIF tồn tại và IsActive = 1
  2. LoaiTaiKhoan IN (N'Thanh toán', N'Tiết kiệm')
  3. Mỗi khách hàng tối đa 1 tài khoản/loại
- **Tự sinh số tài khoản:**
  - Tiết kiệm: `00206` + 11 số ngẫu nhiên (check unique)
  - Thanh toán: lấy SoDienThoai của KhachHang, format `XXXX.XXX.XXX`
- **Output:** `{ ID: TaiKhoanID, Message, SoTaiKhoan }`
- **Lưu ý:** Trigger tự ghi audit log

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
- **Sử dụng:** View `dbo.vw_GiaoDich`
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
- **Output:** Danh sách từ `vw_GiaoDich` + `TotalRow`

---

### V23__LoiLCA__Upsert__SP_GiaoDich_TaoGiaoDich
- **SP:** `dbo.sp_GiaoDich_TaoGiaoDich`
- **Input:**
  | Tham số | Kiểu | Bắt buộc |
  |---|---|---|
  | @SoTKNguon | VARCHAR(20) | Có |
  | @SoTKDich | VARCHAR(20) | Có |
  | @SoTienGD | DECIMAL(18,0) | Có |
  | @MoTa | NVARCHAR(500) | Không |
  | @IsGhiNo | BIT | Có |
  | @HinhThuc | VARCHAR(10) | Có |
- **Validate (theo thứ tự):**
  1. SoTKNguon và SoTKDich tồn tại, `TrangThai = 'active'`
  2. SoTKNguon ≠ SoTKDich
  3. SoTienGD > 0
  4. **Kiểm tra số dư khả dụng:** `SoDuHienTai − SoDuPhongToa >= SoTienGD`
  5. HinhThuc IN ('NAPAS','Noi bo')
- **Tự sinh MaGiaoDich:** `FT` + `yyyyMMddHHmmss` + 4 số random
- **Output:** `{ ID: GiaoDichID, Message, MaGiaoDich }`
- **Không có UPDATE/DELETE** (giao dịch là bất biến)

---

## NHÓM BÁO CÁO

### V24__AnhTPQ__GetReport__SP_BaoCao_TongQuan
- **SP:** `dbo.sp_BaoCao_TongQuan`
- **Input:** `@TuNgay DATETIME`, `@DenNgay DATETIME`, `@CIF VARCHAR(20)` (NULL = toàn hệ thống)
- **Output (tương thích stat cards React):**
  ```json
  {
    "TongGiaoDich": 9,
    "TongGhiNo": 228300000,
    "TongGhiCo": 287700000,
    "NapasCount": 5,
    "NoiBoCount": 4
  }
  ```

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

### V27__PhongNLH__GetReport__SP_TruyVetDongTien
- **SP:** `dbo.sp_TruyVetDongTien`
- **Mục đích:** Truy vết đồ thị dòng tiền theo CIF gốc, trả ra cấu trúc cây dùng cho MoneyFlowChart
- **Input:**
  | Tham số | Kiểu |
  |---|---|
  | @CIFGoc | VARCHAR(20) |
  | @SoTaiKhoan | VARCHAR(20) | CIF hoặc SoTK, ưu tiên CIF |
  | @TuNgay | DATETIME |
  | @DenNgay | DATETIME |
  | @MaxLevel | INT | DEFAULT 2 |
- **Kỹ thuật:** Dùng **Recursive CTE** để duyệt cây giao dịch tối đa `@MaxLevel` cấp
- **Output (JSON — tương thích FlowNode trong MoneyFlowChart.tsx):**
  ```json
  [
    {
      "id": "root",
      "cif": "26410060",
      "name": "Lê Phước Lâm",
      "account": "0912.345.678",
      "level": 0,
      "amount": null,
      "txCount": null,
      "children": [
        {
          "id": "n_26410064",
          "cif": "26410064",
          "name": "Lê Công Anh Lợi",
          "account": "0987.654.321",
          "level": 1,
          "amount": 15000000,
          "txCount": 1,
          "period": "T7/25–T11/25",
          "children": [ ... ]
        }
      ]
    }
  ]
  ```
- **GraphQL Schema (Hot Chocolate / HotChocolate .NET hoặc graphql-dotnet):**
  ```graphql
  type FlowNode {
    id:       String!
    cif:      String!
    name:     String!
    account:  String!
    bank:     String
    level:    Int!
    amount:   Float
    txCount:  Int
    period:   String
    children: [FlowNode!]!
  }

  type Query {
    truyVetDongTien(
      cifGoc:      String
      soTaiKhoan:  String
      tuNgay:      String!
      denNgay:     String!
      maxLevel:    Int
    ): FlowNode
  }
  ```
- **Cách kết nối GraphQL → SP:** Resolver gọi `EXEC dbo.sp_TruyVetDongTien` → deserialize JSON → map sang `FlowNode` object → trả về GraphQL response
- **Validate:**
  1. CIFGoc hoặc SoTaiKhoan phải có ít nhất 1
  2. TuNgay ≤ DenNgay
  3. MaxLevel trong khoảng 1–5

---

## Phân công tổng hợp

| Version | Script | Người thực hiện |
|---|---|---|
| V1  | Create Database | LamLP |
| V2  | Create GroupRole | LamLP |
| V3  | Create User | LamLP |
| V4  | Grant Permissions | LamLP |
| V5  | Table KhachHang + AuditLog | NhanPT |
| V6  | Table TaiKhoan + AuditLog | LoiLCA |
| V7  | Table GiaoDich | HuyTND |
| V8  | View vw_KhachHang | AnhTPQ |
| V9  | View vw_TaiKhoan | LongLTD |
| V10 | View vw_GiaoDich | PhongNLH |
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
| V27 | SP TruyVetDongTien + GraphQL schema | PhongNLH |
