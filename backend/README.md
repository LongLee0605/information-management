# QLTT Backend — Express API + SQL Server

## Hai môi trường tách biệt

| | Development (local) | Production (server) |
|---|---|---|
| **File env** | `.env.development` | `.env.production` |
| **Lệnh chạy** | `npm run be` | `npm run be:prod` |
| **DB** | Docker localhost | SQL server UIT |
| **CORS** | localhost:5173 | origin FE trên server |

**Không sửa lẫn file** — local chỉ dùng `.env.development`, server chỉ dùng `.env.production`.

`.env.development` đã có sẵn trong repo. Production tạo **một lần** trên server:

```bash
npm run setup:prod
# chỉnh .env.production (user/password SQL)
npm run be:prod
```

## Development (máy local)

```bash
cd backend
npm install
npm run be
```

- API: http://localhost:3001
- SQL: Docker tự bật

## Production (server uit-01)

```bash
cd backend
npm install
npm run setup:prod    # lần đầu
npm run be:prod
```

Kiểm tra: http://&lt;host&gt;:3001/api/ phải trả `"env":"production"`.

## Lệnh

| Lệnh | Môi trường |
|------|------------|
| `npm run be` | development |
| `npm run be:prod` | production |
| `npm run setup:prod` | tạo `.env.production` từ mẫu |
| `npm run db:migrate` | lần đầu — DB trống (development) |
| `npm run db:migrate:prod` | lần đầu — DB trống (production) |
| `npm run db:reset` | DROP `QLTT` + migrate full — **dùng khi sửa `sql/`** |
| `npm run db:reset:prod` | reset DB production |
| `npm run test:cors` | CORS dev |
| `npm run test:cors:prod` | CORS production |

Migration / reset: xem [docs/database-migration.md](../../docs/database-migration.md). Phạm vi đồ án: [docs/project-scope.md](../../docs/project-scope.md).
