# Nhóm 10 — QLTT (Quản lý thông tin tài chính)

## Kiến trúc

```
information-management/
├── src/                   # React 19 + TypeScript (Vite)
├── server/                # Express API (Node.js)
│   ├── index.js           # Entry point, pool middleware, CORS
│   ├── db.js              # SQL Server connection singleton
│   └── routes/
│       ├── khachHang.js   → /api/customers
│       ├── taiKhoan.js    → /api/accounts
│       ├── giaoDich.js    → /api/transactions
│       └── baoCao.js      → /api/reports
├── sql/                   # SQL Server migrations (V1–V27)
└── scripts/migrate.js     # Migration runner
```

---

## Thiết lập môi trường

### 1. Cài dependencies

```bash
npm install
```

### 2. Tạo file `.env`

Sao chép từ template và điền thông tin kết nối:

```bash
cp .env.example .env
```

Chỉnh sửa `.env`:

```env
DB_HOST=uit-01.qasystem.com.vn
DB_PORT=1433
DB_NAME=QLTT
DB_USER=<username>
DB_PASSWORD=<password>

API_PORT=3001
```

> ⚠️ Không commit file `.env` lên git.

### 3. Chạy migration database

```bash
npm run db:migrate
```

Lệnh này chạy tuần tự V1 → V27, tạo toàn bộ database, bảng, view, trigger, stored procedure và dữ liệu mẫu.

### 4. Khởi động dev server (FE + BE cùng lúc)

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Health check: http://localhost:3001/api/health

---

## SQL Migrations (V1–V27)

| File | Tác giả | Nội dung |
|------|---------|----------|
| V1 | LamLP | Tạo database QLTT |
| V2 | LamLP | Tạo group roles |
| V3 | LamLP | Tạo SQL Server logins |
| V4 | LamLP | Grant permissions |
| V5 | NhanPT | Bảng KhachHang |
| V6 | LoiLCA | Bảng TaiKhoan |
| V7 | **HuyTND** | Bảng GiaoDich |
| V8 | AnhTPQ | View VW_KhachHang |
| V9 | LongLTD | View VW_TaiKhoan |
| V10 | PhongNLH | View VW_GiaoDich |
| V11 | TrangTTN | Trigger validate KhachHang |
| V12 | **HuyTND** | Trigger TaiKhoan (freeze + validate) |
| V13 | NhanPT | Sample data KhachHang |
| V14 | LoiLCA | Sample data TaiKhoan |
| V15 | TrangTTN | Sample data GiaoDich |
| V16 | NhanPT | SP_KhachHang_TimKiem |
| V17 | AnhTPQ | SP_KhachHang_ThemCapNhat |
| V18 | VietVH | SP_KhachHang_Xoa |
| V19 | LongLTD | SP_TaiKhoan_TimKiem |
| V20 | PhongNLH | SP_TaiKhoan_MoTaiKhoa |
| V21 | **HuyTND** | SP_TaiKhoan_CapNhatTrangThai |
| V22 | TrangTTN | SP_GiaoDich_TimKiem |
| V23 | LoiLCA | SP_GiaoDich_TaoGiaoDich |
| V24 | AnhTPQ | SP_BaoCao_TongQuan |
| V25 | VietVH | SP_BaoCao_BieuDoTheoThang |
| V26 | LongLTD | SP_BaoCao_PieChart |
| V27 | PhongNLH | SP_TruyVetDongTien |

---

## API Endpoints

### Customers — `/api/customers`
| Method | Path | SP |
|--------|------|----|
| GET | `/api/customers` | SP_KhachHang_TimKiem |
| GET | `/api/customers/:id` | — |
| POST | `/api/customers` | SP_KhachHang_ThemCapNhat |
| PUT | `/api/customers/:id` | SP_KhachHang_ThemCapNhat |
| DELETE | `/api/customers/:id` | SP_KhachHang_Xoa |

### Accounts — `/api/accounts`
| Method | Path | SP |
|--------|------|----|
| GET | `/api/accounts` | SP_TaiKhoan_TimKiem |
| GET | `/api/accounts/:id` | — |
| PATCH | `/api/accounts/:id/status` | SP_TaiKhoan_CapNhatTrangThai |
| PATCH | `/api/accounts/:id/toggle` | SP_TaiKhoan_MoTaiKhoa |

### Transactions — `/api/transactions`
| Method | Path | SP |
|--------|------|----|
| GET | `/api/transactions` | SP_GiaoDich_TimKiem |
| GET | `/api/transactions/:id` | — |
| POST | `/api/transactions` | SP_GiaoDich_TaoGiaoDich |

### Reports — `/api/reports`
| Method | Path | SP |
|--------|------|----|
| GET | `/api/reports/overview` | SP_BaoCao_TongQuan |
| GET | `/api/reports/monthly-chart` | SP_BaoCao_BieuDoTheoThang |
| GET | `/api/reports/pie-chart` | SP_BaoCao_PieChart |
| GET | `/api/reports/money-flow` | SP_TruyVetDongTien |

---

## Tồn đọng (TODO)

### 🔴 Blocked — cần thông tin từ team
- [ ] **DB credentials**: Cần `DB_USER` + `DB_PASSWORD` để chạy `npm run db:migrate`

### 🟡 Cần làm
- [ ] **Kết nối Frontend → API**: `src/services/` hiện đang đọc mock JSON (`src/data/*.json`). Cần refactor để gọi `http://localhost:3001/api/*`. Assign: **LongLTD** (theo task sheet)
- [ ] **ERD diagram**: Chưa có assignee
- [ ] **Báo cáo PDF**: Tài liệu đồ án
- [ ] **Slides trình bày**
- [ ] **Video demo**

### ✅ Đã hoàn thành
- [x] Toàn bộ 27 SQL migration scripts (V1–V27)
- [x] Migration runner (`npm run db:migrate`)
- [x] Express API server với 4 router modules
- [x] Connection pool singleton (middleware pattern)
- [x] CORS cho Vite dev server
- [x] `npm run dev` — chạy FE + BE song song
