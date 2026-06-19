# QLTT — Hướng dẫn chạy dự án từ đầu

Ứng dụng quản lý thông tin khách hàng / tài khoản / giao dịch ngân hàng.

| Thành phần | Công nghệ | Port mặc định |
|------------|-----------|---------------|
| Database | SQL Server 2025 (Docker) | `1433` |
| Backend API | Node.js + Express | `3001` |
| Frontend | React + Vite | `5173` |

---

## 1. Yêu cầu trước khi cài

Cài đặt trên máy Windows (hoặc tương đương):

1. **[Node.js](https://nodejs.org/)** LTS (khuyến nghị v20+)
2. **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** — bật và chạy nền (icon Docker màu xanh)
3. **Git** (nếu clone repo)
4. **(Tùy chọn)** [SQL Server Management Studio (SSMS)](https://learn.microsoft.com/sql/ssms/download-sql-server-management-studio-ssms) hoặc Azure Data Studio — để xem/sửa database bằng GUI

Kiểm tra nhanh:

```powershell
node -v
npm -v
docker -v
docker ps
```

---

## 2. Cấu trúc thư mục

```text
information-management/
├── backend/          # API + SQL migrations + Docker SQL Server
│   ├── sql/          # Flyway-style scripts V1–V26
│   ├── server/       # Express routes
│   └── docker-compose.yml
├── frontend/         # React UI
└── README.md         # File này
```

---

## 3. Clone & cài dependency

```powershell
cd information-management

cd backend
npm install

cd ..\frontend
npm install
```

---

## 4. Cấu hình môi trường Backend

### 4.1. Tạo file env (lần đầu)

```powershell
cd backend
copy .env.development.example .env.development
```

File `backend/.env.development` mẫu:

```env
DB_HOST=localhost
DB_PORT=1433
DB_NAME=QLTT
DB_USER=sa
DB_PASSWORD=YourStrong!Passw0rd
DB_ENCRYPT=false
DB_TRUST_SERVER_CERT=true

API_PORT=3001
CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
```

> **Quan trọng:** `DB_PASSWORD` trong `.env.development` phải **trùng** mật khẩu SA của container Docker (biến `MSSQL_SA_PASSWORD` trong `docker-compose.yml`).

Đổi mật khẩu nếu muốn — nhưng phải đổi **cùng một giá trị** ở cả `.env.development` và khi kết nối SSMS.

### 4.2. Cấu hình môi trường Frontend

```powershell
cd frontend
copy .env.production.example .env.production   # chỉ khi deploy server
```

Dev dùng sẵn `frontend/.env.development`:

```env
VITE_API_URL=http://localhost:3001
VITE_PORT=5173
```

---

## 5. Chạy SQL Server bằng Docker

### Cách A — Khuyến nghị: để backend tự bật Docker

Lệnh `npm run be` (bước 6) sẽ **tự**:

- Kiểm tra container `qltt-sqlserver`
- Tạo/khởi động nếu chưa chạy
- Đợi SQL Server sẵn sàng
- Chạy migration
- Khởi động API

### Cách B — Chạy Docker thủ công (trước khi mở SSMS)

```powershell
cd backend
docker compose --env-file .env.development up -d sqlserver
```

Kiểm tra container:

```powershell
docker ps
```

Phải thấy container `qltt-sqlserver` đang `Up`, port `0.0.0.0:1433->1433/tcp`.

Xem log nếu lỗi:

```powershell
npm run db:logs
```

Dừng SQL Server:

```powershell
npm run db:down
```

---

## 6. Kết nối SQL Server bằng SSMS (host)

Mở **SQL Server Management Studio** → **Connect to Server**:

| Trường | Giá trị |
|--------|---------|
| **Server type** | Database Engine |
| **Server name** | `localhost,1433` hoặc `127.0.0.1,1433` |
| **Authentication** | SQL Server Authentication |
| **Login** | `sa` |
| **Password** | Giống `DB_PASSWORD` trong `.env.development` (mặc định `YourStrong!Passw0rd`) |

Tab **Connection Properties** (nếu có): bật **Trust server certificate** hoặc tương đương.

Sau khi kết nối:

- Database **`QLTT`** xuất hiện sau khi chạy migration (bước 7)
- Có thể xem bảng: `KhachHang`, `TaiKhoan`, `GiaoDich`, …
- Stored procedures: `SP_KhachHang_TimKiem`, `SP_GiaoDich_TaoGiaoDich`, …

### Azure Data Studio (thay SSMS)

- Connection type: **Microsoft SQL Server**
- Server: `localhost,1433`
- User: `sa` / password như trên
- Encrypt: **False** (hoặc Trust server certificate)

---

## 7. Chạy Backend (API + migration)

Mở terminal tại `backend/`:

```powershell
cd backend
npm run be
```

Script sẽ lần lượt:

1. Đọc `backend/.env.development`
2. Bật Docker SQL Server (nếu `DB_HOST=localhost`)
3. Đợi SQL sẵn sàng
4. Chạy migration (`sql/V1` … `V26`) — chỉ apply script **mới** (bảng `__schema_migrations`)
5. Khởi động API tại **http://localhost:3001**

Giữ terminal này mở. Kiểm tra:

- Trình duyệt: http://localhost:3001/api/health → `{"status":"ok",...}`
- Hoặc:

```powershell
npm run check:api
```

### Chạy migration riêng (không khởi động API)

```powershell
npm run db:migrate
```

### Chỉ chạy API (Docker + DB đã sẵn sàng)

```powershell
npm run dev
```

---

## 8. Chạy Frontend

Mở **terminal mới** (backend vẫn đang chạy):

```powershell
cd frontend
npm run fe
```

- App: **http://localhost:5173**
- Vite proxy `/api` → `http://localhost:3001` (không cần cấu hình CORS khi dev trên cùng máy)

Mở trình duyệt → vào http://localhost:5173.

---

## 9. Quy trình đầy đủ (tóm tắt)

```text
[1] Docker Desktop đang chạy
         ↓
[2] backend/.env.development (copy từ .example)
         ↓
[3] cd backend && npm install && npm run be
         ↓   (Docker SQL + migrate + API :3001)
[4] (Tùy chọn) SSMS → localhost,1433 / sa / password
         ↓
[5] cd frontend && npm install && npm run fe
         ↓
[6] Mở http://localhost:5173
```

---

## 10. Cho thiết bị khác trong cùng Wi‑Fi/LAN

1. Lấy IP máy: `ipconfig` → IPv4 (vd. `192.168.1.105`)
2. Backend + frontend vẫn chạy như trên
3. Thiết bị khác mở: `http://192.168.1.105:5173`
4. Mở firewall Windows cho port **5173** và **3001**
5. Nếu lỗi CORS, thêm vào `backend/.env.development`:

   ```env
   CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173,http://192.168.1.105:5173
   ```

> Khác mạng (4G, nhà khác): cần VPN (Tailscale) hoặc tunnel (ngrok) — không truy cập trực tiếp IP `192.168.x.x`.

---

## 11. Lệnh hữu ích

### Backend (`cd backend`)

| Lệnh | Mô tả |
|------|--------|
| `npm run be` | Docker + migrate + API (development) |
| `npm run dev` | Chỉ API (DB đã chạy) |
| `npm run db:migrate` | Chạy migration |
| `npm run db:up` | Chỉ bật Docker SQL |
| `npm run db:down` | Dừng Docker stack |
| `npm run db:logs` | Xem log SQL Server |
| `npm run check:api` | Test 17 endpoint |
| `npm run verify:db` | So sánh API vs database |

### Frontend (`cd frontend`)

| Lệnh | Mô tả |
|------|--------|
| `npm run fe` | Dev server :5173 |
| `npm run build` | Build production |
| `npm run start` | Preview build (:1111) |
| `npm run lint` | ESLint |

---

## 12. Xử lý lỗi thường gặp

### Docker: `Cannot connect to Docker daemon`

- Mở **Docker Desktop** và đợi khởi động xong.

### `Login failed for user 'sa'`

- Sai mật khẩu: kiểm tra `DB_PASSWORD` trong `.env.development`
- Container tạo trước với password khác → xóa volume và tạo lại:

  ```powershell
  cd backend
  docker compose --env-file .env.development down -v
  docker compose --env-file .env.development up -d sqlserver
  ```

  Cảnh báo: **mất toàn bộ dữ liệu** trong DB local.

### `SQL Server chưa sẵn sàng`

- Đợi thêm 30–60 giây sau lần `docker up` đầu tiên
- Xem log: `npm run db:logs`

### Frontend: không tải được dữ liệu / API offline

- Backend phải chạy trước: http://localhost:3001/api/health
- Chạy lại `npm run be`

### SSMS: không kết nối được

- Container phải `Up`: `docker ps`
- Server name đúng: `localhost,1433` (có dấu phẩy)
- Authentication: **SQL Server Authentication**, không dùng Windows Auth

### Port 3001 hoặc 5173 đã bị chiếm

- Đổi `API_PORT` trong `.env.development` hoặc `VITE_PORT` trong `.env.development` (frontend)
- Hoặc tắt process đang dùng port đó

---

## 13. Tài liệu thêm

- `backend/sql/SP_DESIGN.md` — mô tả stored procedures & migrations
- `backend/README.md` — chi tiết backend / production
- `frontend/README.md` — chi tiết frontend / production

---

## 14. Production (server thật)

Không dùng Docker local. Trên server:

```powershell
# Backend
cd backend
npm run setup:prod
# chỉnh .env.production (DB_HOST, user, password thật)
npm run be:prod

# Frontend
cd frontend
npm run setup:prod
npm run build
npm run start
```

Chi tiết xem `backend/README.md` và `frontend/README.md`.
