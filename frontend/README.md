# QLTT Frontend — React + Vite

## Chạy nhanh

```bash
cd frontend
copy .env.example .env
npm install
npm run fe
```

- App: http://localhost:5173

**Chạy backend trước** (`cd backend && npm run be`).

## Cấu hình `.env`

```env
VITE_API_URL=http://localhost:3001
```

## Lệnh

| Lệnh | Mô tả |
|------|--------|
| `npm run fe` / `npm run dev` | Vite dev server |
| `npm run build` | Build production |
| `npm run lint` | ESLint |

Frontend chỉ gọi API — không có fallback dữ liệu local.
