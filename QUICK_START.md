# 🚀 Quick Start - Environment Variables Setup

## Tập Tin Đã Tạo

### Environment Files
- **`.env.dev`** - Environment variables cho development
- **`.env.prod`** - Environment variables cho production
- **`.env.example`** - Template (làm ví dụ)

### Docker Compose Files
- **`docker-compose.dev.yml`** - Chạy dev
- **`docker-compose.prod.yml`** - Chạy production

### Documentation
- **`ENV_SETUP_GUIDE.md`** - Hướng dẫn chi tiết

### Updated Dockerfiles
- **`datn_be/Dockerfile`** - Backend với ARG PROFILE
- **`datn_fe/Dockerfile`** - Frontend với ARG PROFILE

---

## 🎯 Cách Sử Dụng

### Chạy Development
```bash
cd D:\App\datn

# Lần đầu (build images)
docker-compose -f docker-compose.dev.yml --env-file .env.dev up -d --build

# Hoặc chỉ start services
docker-compose -f docker-compose.dev.yml --env-file .env.dev up -d
```

**Truy cập:**
- Frontend: http://localhost:4200
- Backend: http://localhost:8080

### Chạy Production
```bash
cd D:\App\datn

# Build và start services
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

**Truy cập:**
- Frontend: http://localhost:80 (or your domain)
- Backend: http://localhost:8080

### Dừng Services
```bash
# Dev
docker-compose -f docker-compose.dev.yml down

# Prod
docker-compose -f docker-compose.prod.yml down
```

### Xem Logs
```bash
# Dev
docker-compose -f docker-compose.dev.yml logs -f

# Backend logs
docker-compose -f docker-compose.dev.yml logs backend -f

# Frontend logs
docker-compose -f docker-compose.dev.yml logs frontend -f
```

---

## ⚙️ Tùy Chỉnh Environment Variables

### Sửa cấu hình Development
Mở file `.env.dev` và cập nhật:
```env
DB_HOST=your_db_host
DB_PORT=1433
DB_USER=your_user
DB_PASSWORD=your_password
MONGODB_HOST=your_mongo_host
API_BASE_URL=http://your_api_url:8080
```

### Sửa cấu hình Production
Mở file `.env.prod` và cập nhật:
```env
DB_HOST=your_prod_db_host
MONGODB_HOST=your_prod_mongo_host
API_BASE_URL=https://your_domain.com
SSL_CERT_PATH=/root/ssl
```

---

## 📋 Environment Variables Chính

### Database
- `DB_HOST` - SQL Server host
- `DB_PORT` - SQL Server port (default: 1433)
- `DB_NAME` - Database name
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password

### MongoDB
- `MONGODB_HOST` - MongoDB host
- `MONGODB_PORT` - MongoDB port (default: 27017)
- `MONGODB_NAME` - Database name

### Backend
- `SPRING_PROFILES_ACTIVE` - Spring profile (dev/prod)
- `JAVA_OPTS` - JVM memory settings
- `SERVER_PORT` - Server port (default: 8080)

### Frontend
- `API_BASE_URL` - Backend API URL
- `FRONTEND_PORT` - Frontend port (4200 for dev, 80 for prod)

### Gemini AI
- `GEMINI_API_KEY` - Google Gemini API key
- `GEMINI_PRIMARY_MODEL` - Primary model
- `GEMINI_FALLBACK_MODEL` - Fallback model

---

## 🐳 Docker Images Size

- Backend Image: ~400MB
- Frontend Image: ~100MB

---

## ✅ Kiểm Tra Health

```bash
# Check backend health
curl http://localhost:8080/api/health

# Check frontend
curl http://localhost:4200

# Check container status
docker ps
```

---

## ❌ Troubleshooting

### Container fail to start
```bash
docker logs datn_be_dev
docker logs datn_fe_dev
```

### Port already in use
```bash
# Thay đổi port trong .env file
# Hoặc kill process
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### Database connection failed
- Kiểm tra DB_HOST, DB_PORT, username, password
- Đảm bảo database server accessible

### Frontend không load
- Kiểm tra API_BASE_URL trong .env
- Đảm bảo backend service đang chạy
- Kiểm tra nginx config

---

## 📚 Reference
- Full guide: `ENV_SETUP_GUIDE.md`
- Backend Spring config: `datn_be/src/main/resources/application-{dev,prod}.yml`
- Frontend config: `datn_fe/angular.json`

---

**Last Updated:** 2026-04-04

