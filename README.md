# QLTT — Quản lý thông tin tài chính

Monorepo backend (Express + SQL Server) và frontend (React + Vite).

```
information-management/
├── .env                 # Cấu hình chung (DB + API + Vite) — không commit
├── .env.example
├── package.json
├── node_modules/
├── backend/
│   ├── sql/             # Migration V1–V27
│   ├── server/
│   └── scripts/
└── frontend/
    └── src/
```

---

## Yêu cầu

- Node.js 20+
- Docker Desktop (chỉ khi dùng SQL local)
- Thông tin kết nối SQL Server do admin/giảng viên cung cấp

---

## Bắt đầu nhanh

```bash
npm install
npm run env:copy
# chỉnh .env theo môi trường của bạn
npm run dev
```

| URL | Mô tả |
|-----|--------|
| http://localhost:5173 | Frontend |
| http://localhost:3001/api/health | API health |

---

## Cấu hình `.env`

Tạo file từ mẫu:

```bash
npm run env:copy
```

Chỉnh **một file** tại thư mục gốc — dùng chung cho backend và frontend:

```env
# SQL Server
DB_HOST=<sql-host>
DB_PORT=1433
DB_NAME=QLTT
DB_USER=<sql-user>
DB_PASSWORD=<sql-password>
DB_ENCRYPT=false
DB_TRUST_SERVER_CERT=true

# API
API_PORT=3001
CORS_ORIGIN=http://localhost:5173

# Frontend
VITE_API_URL=http://localhost:3001
```

**Local (Docker):** đặt `DB_HOST=localhost` và mật khẩu khớp với Docker.

**Remote:** đặt `DB_HOST`, `DB_USER`, `DB_PASSWORD` theo thông tin server được cấp — **không ghi hostname/mật khẩu thật vào README hay commit lên Git**.

> Không cần `backend/.env` hay `frontend/.env` riêng.

---

## Lệnh CLI

| Lệnh | Mô tả |
|------|--------|
| `npm run env:copy` | Tạo `.env` từ `.env.example` |
| `npm run setup` | In hướng dẫn setup ngắn |
| `npm run dev` | Chạy backend + frontend |
| `npm run be` | Chỉ backend (Docker nếu local → migrate → API) |
| `npm run fe` | Chỉ frontend Vite |
| `npm run build` | Build production frontend |
| `npm run db:migrate` | Áp dụng toàn bộ SQL lên server trong `.env` |
| `npm run db:up` | Bật Docker SQL local |
| `npm run db:down` | Tắt Docker SQL |
| `npm run check:api` | Kiểm tra API endpoints |
| `npm run verify:db` | Đối chiếu SQL ↔ API |

`npm run dev` sẽ:
1. Khởi động Docker SQL (nếu `DB_HOST=localhost`)
2. Chạy migration V1–V27
3. Bật API `:3001` và Vite `:5173`

Khi `DB_HOST` trỏ server remote, Docker local được bỏ qua.

---

## Đẩy SQL lên server

Sửa file `.sql` trong source **không tự đổi** database trên server. Phải chạy migrate:

```bash
# 1. Cập nhật .env với thông tin server (host, user, password)
# 2. PowerShell: xóa biến môi trường override nếu có
Remove-Item Env:DB_HOST -ErrorAction SilentlyContinue
Remove-Item Env:DB_PASSWORD -ErrorAction SilentlyContinue

# 3. Migrate
npm run db:migrate

# 4. Kiểm tra (API phải đang chạy)
npm run verify:db
```

**Cảnh báo:** `db:migrate` chạy lại toàn bộ V1–V27 (drop/create + sample data). Chỉ dùng khi chấp nhận reset schema/dữ liệu.

`git push` chỉ đẩy source code — **không** đẩy database.

---

## API endpoints

| Endpoint | Mô tả |
|----------|--------|
| `GET /api/health` | Health + trạng thái DB |
| `GET /api/customers` | Khách hàng |
| `GET /api/accounts` | Tài khoản |
| `GET /api/transactions` | Giao dịch |
| `GET /api/reports/monthly-chart` | Biểu đồ theo tháng |
| `GET /api/reports/pie-chart` | Pie chart |
| `GET /api/reports/money-flow` | Truy vết dòng tiền |

---

## Xử lý sự cố

| Triệu chứng | Cách xử lý |
|-------------|------------|
| `Login failed for user` | Kiểm tra `DB_USER` / `DB_PASSWORD` trong `.env` |
| Migrate vào sai server | Xóa `Env:DB_*` override; kiểm tra `.env` gốc |
| Port 3001/5173 bị chiếm | `npm run be` tự kill API cũ; tắt Vite thủ công nếu cần |
| Frontend không có data | Chạy `npm run dev` (backend phải lên trước) |

---

## Bảo mật

- Không commit `.env`, mật khẩu, hostname nội bộ, file `.bak`
- Chỉ chia sẻ thông tin SQL qua kênh riêng tư (admin/giảng viên)
- `npm install` chỉ cần chạy một lần tại thư mục gốc
