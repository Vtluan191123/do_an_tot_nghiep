# Hướng Dẫn Chạy Ứng Dụng DATN với Environment Variables

## 📋 Mục Lục
- [Cơ Bản](#cơ-bản)
- [Development Setup](#development-setup)
- [Production Setup](#production-setup)
- [Environment Variables](#environment-variables)
- [Chạy với Docker](#chạy-với-docker)
- [Troubleshooting](#troubleshooting)

---

## Cơ Bản

Dự án này sử dụng các environment variables để quản lý cấu hình cho hai môi trường: **Development** và **Production**.

### Cấu Trúc Thư Mục
```
datn/
├── .env.dev                 # Environment variables cho dev
├── .env.prod                # Environment variables cho prod
├── .env.example             # Template cho environment variables
├── docker-compose.dev.yml   # Docker Compose cho dev
├── docker-compose.prod.yml  # Docker Compose cho prod
├── docker-compose.yml       # (cũ - không dùng nữa)
├── datn_be/                 # Backend Spring Boot
└── datn_fe/                 # Frontend Angular
```

---

## Development Setup

### 1. **Clone hoặc Chuẩn Bị Project**
```bash
cd D:\App\datn
```

### 2. **Setup Environment Variables cho Dev**
File `.env.dev` đã được tạo sẵn. Kiểm tra nếu cần cập nhật thông tin:

```env
# Ví dụ các thông số dev
DB_HOST=159.223.56.71
DB_PORT=1433
SPRING_PROFILES_ACTIVE=dev
FRONTEND_PORT=4200
API_BASE_URL=http://localhost:8080
```

### 3. **Chạy Development Mode**

**Cách 1: Sử dụng Docker Compose**
```bash
# Load environment từ .env.dev
docker-compose -f docker-compose.dev.yml --env-file .env.dev up -d

# Hoặc build lại images
docker-compose -f docker-compose.dev.yml --env-file .env.dev up -d --build
```

**Cách 2: Chạy trực tiếp trên máy local**

Backend:
```bash
cd datn_be
./mvnw spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
```

Frontend:
```bash
cd datn_fe
npm install
npm start
```

### 4. **Kiểm Tra Dev Server**
- Backend: http://localhost:8080
- Frontend: http://localhost:4200

---

## Production Setup

### 1. **Chuẩn Bị Production Environment**

Cập nhật file `.env.prod` với thông tin server production:

```env
# Production Database
DB_HOST=your_prod_db_host
DB_PORT=1433
DB_USER=sa
DB_PASSWORD=your_secure_password

# MongoDB
MONGODB_HOST=your_prod_mongo_host
MONGODB_PORT=27017

# API
API_BASE_URL=https://your_domain.com

# SSL
SSL_CERT_PATH=/root/ssl

# Java Memory
JAVA_OPTS=-Xmx1024m -Xms512m
```

### 2. **Upload SSL Certificates** (Nếu sử dụng HTTPS)
```bash
# Tạo thư mục SSL trên server
mkdir -p /root/ssl

# Upload certificates
# - /root/ssl/cert.pem
# - /root/ssl/key.pem
```

### 3. **Chạy Production Mode**
```bash
# Load environment từ .env.prod
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

# Hoặc rebuild images
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

### 4. **Kiểm Tra Production Logs**
```bash
# Backend logs
docker logs datn_be_prod -f

# Frontend logs
docker logs datn_fe_prod -f
```

---

## Environment Variables

### Development Variables (`.env.dev`)

| Variable | Mô Tả | Ví Dụ |
|----------|-------|-------|
| `APP_ENV` | Môi trường | `dev` |
| `DB_HOST` | SQL Server host | `159.223.56.71` |
| `DB_PORT` | SQL Server port | `1433` |
| `MONGODB_HOST` | MongoDB host | `159.223.56.71` |
| `SPRING_PROFILES_ACTIVE` | Spring profile | `dev` |
| `JAVA_OPTS` | Java memory settings | `-Xmx512m -Xms256m` |
| `GEMINI_API_KEY` | Google Gemini API key | `your_api_key` |
| `API_BASE_URL` | Frontend API base URL | `http://localhost:8080` |

### Production Variables (`.env.prod`)

| Variable | Mô Tả | Ví Dụ |
|----------|-------|-------|
| `APP_ENV` | Môi trường | `prod` |
| `DB_HOST` | SQL Server host (Docker) | `sqlserver` |
| `MONGODB_HOST` | MongoDB host (Docker) | `mongo` |
| `SPRING_PROFILES_ACTIVE` | Spring profile | `prod` |
| `JAVA_OPTS` | Java memory settings | `-Xmx1024m -Xms512m` |
| `API_BASE_URL` | Production domain | `https://your_domain.com` |
| `SSL_CERT_PATH` | SSL certificate path | `/root/ssl` |

---

## Chạy với Docker

### Build Images
```bash
# Dev
docker-compose -f docker-compose.dev.yml build

# Prod
docker-compose -f docker-compose.prod.yml build
```

### Start Services
```bash
# Dev (với tự động load .env.dev)
docker-compose -f docker-compose.dev.yml --env-file .env.dev up -d

# Prod (với tự động load .env.prod)
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

### View Logs
```bash
# Tất cả services
docker-compose -f docker-compose.dev.yml logs -f

# Riêng backend
docker-compose -f docker-compose.dev.yml logs backend -f

# Riêng frontend
docker-compose -f docker-compose.dev.yml logs frontend -f
```

### Stop Services
```bash
# Dev
docker-compose -f docker-compose.dev.yml down

# Prod
docker-compose -f docker-compose.prod.yml down
```

### Remove Images & Volumes
```bash
# Xóa containers, images, networks
docker-compose -f docker-compose.dev.yml down -v

# Xóa images
docker-compose -f docker-compose.dev.yml down --rmi all
```

---

## Dockerfile

### Backend Dockerfile (datn_be/Dockerfile)
```dockerfile
# Build stage
FROM maven:3.9.0-eclipse-temurin-17 AS builder
WORKDIR /app
COPY datn_be .
ARG PROFILE=dev
RUN mvn clean package -DskipTests -Dspring-boot.run.arguments="--spring.profiles.active=${PROFILE}"

# Runtime stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Frontend Dockerfile (datn_fe/Dockerfile)
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY datn_fe .
RUN npm install
ARG PROFILE=dev
RUN npm run build

# Nginx runtime
FROM nginx:alpine
COPY --from=builder /app/dist/dotn-fe/browser /usr/share/nginx/html
COPY datn_fe/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
```

---

## Nginx Configuration

File `datn_fe/nginx.conf` được cấu hình để:
- Serve static files từ Angular build
- Proxy API requests tới backend
- Support HTTPS/SSL certificates
- Gzip compression

### Cấu Hình SSL (Production)
```nginx
server {
    listen 443 ssl http2;
    server_name your_domain.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    # ... rest of config
}
```

---

## Troubleshooting

### 1. **Container không start**
```bash
# Kiểm tra logs
docker logs datn_be_dev
docker logs datn_fe_dev

# Kiểm tra env variables
docker inspect datn_be_dev | grep -i env
```

### 2. **Database connection failed**
```bash
# Kiểm tra DB_HOST, DB_PORT, DB_USER, DB_PASSWORD
# Đảm bảo database server đang chạy
# Kiểm tra firewall rules
```

### 3. **Port already in use**
```bash
# Thay đổi port trong .env file
# Hoặc kill process đang sử dụng port

# Linux/Mac
lsof -i :8080
kill -9 <PID>

# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### 4. **Build Docker image failed**
```bash
# Xóa build cache
docker-compose -f docker-compose.dev.yml build --no-cache

# Hoặc
docker builder prune -a
```

### 5. **Gemini API không hoạt động**
- Cập nhật `GEMINI_API_KEY` trong `.env` file
- Kiểm tra `GEMINI_BASE_URL` và `GEMINI_PRIMARY_MODEL`

### 6. **Frontend không kết nối Backend**
- Kiểm tra `API_BASE_URL` trong `.env` file
- Đảm bảo backend service đang chạy
- Kiểm tra CORS settings trong backend

---

## Quick Commands

```bash
# Dev - Start all services
docker-compose -f docker-compose.dev.yml --env-file .env.dev up -d --build

# Dev - Stop services
docker-compose -f docker-compose.dev.yml down

# Prod - Start all services
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d --build

# Prod - Stop services
docker-compose -f docker-compose.prod.yml down

# View all running containers
docker ps

# Execute command in container
docker exec -it datn_be_dev /bin/bash
docker exec -it datn_fe_dev /bin/sh
```

---

## Notes
- Luôn sử dụng `--env-file` flag khi chạy docker-compose để load environment variables
- Không commit `.env.dev` hoặc `.env.prod` vào git nếu chứa sensitive data
- Sử dụng `.env.example` làm template cho team
- Kiểm tra logs thường xuyên để debug issues

---

**Last Updated:** 2026-04-04

