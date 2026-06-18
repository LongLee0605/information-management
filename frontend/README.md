# QLTT Frontend — React + Vite

## Môi trường

| File | Lệnh | `VITE_API_URL` |
|------|------|----------------|
| `.env.development` | `npm run fe` | `http://localhost:3001` (proxy) |
| `.env.production` | `npm run build` / `npm run start` | URL API public |

```bash
copy .env.production.example .env.production
```

## Development (local)

```bash
cd frontend
npm install
npm run fe
```

- App: http://localhost:5173
- Gọi `/api` qua Vite proxy → tránh CORS
- **Chạy backend trước:** `cd backend && npm run be`

## Production (deploy)

Trên máy build, chỉnh `.env.production`:

```env
VITE_API_URL=http://<api-host>:3001
```

```bash
cd frontend
npm run build
npm run start
```

- Serve `dist/` tại http://0.0.0.0:5173
- Browser gọi thẳng API → backend phải bật CORS cho origin FE

> Đổi `VITE_API_URL` phải **build lại** (`npm run build`).

Console trình duyệt (production) phải hiện: `[QLTT] FE production · API → http://...`

## Kiểm tra

```bash
npm run build    # bắt buộc có VITE_API_URL trong .env.production
npm run start
```

Mở DevTools → Network: request phải tới `VITE_API_URL`, không phải `localhost`.

## Lệnh

| Lệnh | Môi trường |
|------|------------|
| `npm run fe` | development |
| `npm run build` | production build |
| `npm run start` | production preview/serve |
| `npm run lint` | ESLint |
