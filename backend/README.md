# QLTT Backend — Express API + SQL Server

## Môi trường

| File | Lệnh | Mục đích |
|------|------|----------|
| `.env.development` | `npm run be` | SQL local Docker, CORS localhost |
| `.env.production` | `npm run be:prod` | SQL + API trên server |

Tạo file từ mẫu:

```bash
copy .env.development.example .env.development
copy .env.production.example .env.production
```

## Development (local)

```bash
cd backend
npm install
npm run be
```

- API: http://localhost:3001

## Production (server)

```bash
cd backend
npm install
npm run be:prod
```

Chỉnh `.env.production` trước khi chạy (DB, CORS cho URL frontend).

## Lệnh

| Lệnh | Môi trường |
|------|------------|
| `npm run be` | development |
| `npm run be:prod` | production |
| `npm run dev` | API only (development) |
| `npm run db:migrate` | development DB |
| `npm run db:migrate:prod` | production DB |
| `npm run check:api` | kiểm tra endpoints |
| `npm run verify:db` | đối chiếu SQL ↔ API |

## CORS (production)

Trong `.env.production`, thêm **đúng URL** trình duyệt mở frontend (origin):

```env
CORS_ORIGIN=http://157.10.198.41:5173,http://localhost:5173
```

Sau khi deploy code mới lên server API:

```bash
npm run be:prod
npm run test:cors:prod   # kiểm tra preflight
```

Log khởi động phải hiện: `[QLTT] API [production]` và danh sách CORS allowed.

## Kiểm tra môi trường

| Lệnh | Ý nghĩa |
|------|---------|
| `npm run test:cors` | CORS dev (localhost:3001) |
| `npm run test:cors:prod` | CORS theo `.env.production` |
| `npm run check:api:prod` | API + DB production |
