# QLTT Backend — Express API + SQL Server

## Chạy nhanh

```bash
cd backend
copy .env.example .env
npm install
npm run be
```

- API: http://localhost:3001
- Health: http://localhost:3001/api/health

`npm run be`: Docker SQL (nếu `DB_HOST=localhost`) → migrate V1–V27 → API.

## Cấu hình `.env`

```env
DB_HOST=<sql-host>
DB_PORT=1433
DB_NAME=QLTT
DB_USER=<sql-user>
DB_PASSWORD=<sql-password>
DB_ENCRYPT=false
DB_TRUST_SERVER_CERT=true
API_PORT=3001
CORS_ORIGIN=http://localhost:5173
```

## Lệnh

| Lệnh | Mô tả |
|------|--------|
| `npm run be` | Docker + migrate + API |
| `npm run dev` | Chỉ API (DB đã sẵn sàng) |
| `npm run db:migrate` | Áp dụng SQL lên server trong `.env` |
| `npm run db:up` | Bật Docker SQL local |
| `npm run db:down` | Tắt Docker SQL |
| `npm run check:api` | Kiểm tra endpoints |
| `npm run verify:db` | Đối chiếu SQL ↔ API |

## Đẩy SQL lên server

```bash
npm run db:migrate
npm run verify:db
```

**Cảnh báo:** `db:migrate` chạy lại toàn bộ V1–V27 (drop/create + sample data).

## API endpoints

| Endpoint | Mô tả |
|----------|--------|
| `GET /api/health` | Health + DB |
| `GET /api/customers` | Khách hàng |
| `GET /api/accounts` | Tài khoản |
| `GET /api/transactions` | Giao dịch |
| `GET /api/reports/*` | Báo cáo |

Thiết kế SP: `sql/SP_DESIGN.md`
