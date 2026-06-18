# QLTT Frontend — React + Vite

## Hai môi trường tách biệt

| | Development (local) | Production (server) |
|---|---|---|
| **File env** | `.env.development` | `.env.production` |
| **Lệnh chạy** | `npm run fe` | `npm run build` + `npm run start` |
| **Port** | 5173 | 1111 |
| **Gọi API** | Vite proxy → localhost:3001 | Gọi thẳng URL API |

**Không sửa lẫn file** — local chỉ dùng `.env.development`, server chỉ dùng `.env.production`.

`.env.development` đã có sẵn trong repo. Production tạo **một lần** trên server:

```bash
npm run setup:prod
# chỉnh .env.production nếu cần
npm run build
npm run start
```

## Development (máy local)

```bash
cd frontend
npm install
npm run fe
```

- App: http://localhost:5173
- Proxy `/api` → backend local (không CORS)
- **Chạy backend trước:** `cd backend && npm run be`

## Production (server uit-01)

```bash
cd frontend
npm install
npm run setup:prod    # lần đầu
npm run build
npm run start
```

- App: http://uit-01.qasystem.com.vn:1111
- API: http://uit-01.qasystem.com.vn:3001

> Đổi `.env.production` phải **build lại** (`npm run build`).

## Lệnh

| Lệnh | Môi trường |
|------|------------|
| `npm run fe` | development |
| `npm run build` | production build |
| `npm run start` | production serve |
| `npm run setup:prod` | tạo `.env.production` từ mẫu |
| `npm run lint` | ESLint |
