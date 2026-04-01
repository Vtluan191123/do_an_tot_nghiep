# Hướng dẫn chạy DATN với Docker

## 📋 Yêu cầu

- **Docker**: phiên bản 20.10 trở lên
- **Docker Compose**: phiên bản 1.29 trở lên
- **RAM**: tối thiểu 2GB cho containers
- **Disk**: tối thiểu 2GB dung lượng trống

## 🚀 Bước 1: Chuẩn bị

### 1.1 Kiểm tra Docker đã cài đặt

```bash
docker --version
docker-compose --version
```

### 1.2 Clone hoặc tải project

```bash
cd D:\App\datn
```

## 🐳 Bước 2: Chạy ứng dụng

### **Cách 1: Chạy với Docker Compose (Khuyên dùng)**

Đây là cách dễ nhất, tự động khởi động cả backend và frontend.

```bash
# Vào thư mục gốc
cd D:\App\datn

# Build images và chạy containers
docker-compose up -d

# Xem logs
docker-compose logs -f

# Để dừng
docker-compose down
```

**Kết quả:**
- Frontend: http://localhost
- Backend API: http://localhost:8080

---

### **Cách 2: Build và chạy riêng lẻ**

#### Backend (Java Spring Boot)

```bash
# Build image
docker build -f datn_be/Dockerfile -t datn-backend .

# Chạy container
docker run -d -p 8080:8080 --name datn-backend datn-backend

# Xem logs
docker logs -f datn-backend

# Dừng
docker stop datn-backend
docker rm datn-backend
```

#### Frontend (Angular + Nginx)

```bash
# Build image
docker build -f datn_fe/Dockerfile -t datn-frontend .

# Chạy container
docker run -d -p 80:80 --name datn-frontend datn-frontend

# Xem logs
docker logs -f datn-frontend

# Dừng
docker stop datn-frontend
docker rm datn-frontend
```

---

## 📦 Cấu trúc các File Docker

### `datn_be/Dockerfile`
- **Base Image**: Maven 3.9 + Eclipse Temurin 17 (build stage)
- **Runtime**: Eclipse Temurin 17 Alpine JRE
- **Port**: 8080
- **Multi-stage build**: Giảm kích thước final image
- **Health Check**: Kiểm tra API health mỗi 30 giây

### `datn_fe/Dockerfile`
- **Base Image**: Node 18 Alpine (build stage)
- **Runtime**: Nginx Alpine
- **Port**: 80
- **Multi-stage build**: Tối ưu kích thước
- **Nginx Config**: Hỗ trợ Angular routing + Proxy API

### `datn_fe/nginx.conf`
- **Angular SPA**: Tự động redirect routes đến index.html
- **API Proxy**: /api/* → datnbe:8080
- **WebSocket**: Hỗ trợ ws:// connections
- **Gzip Compression**: Nén response để tăng tốc độ
- **Static Assets**: Cache 1 năm

### `docker-compose.yml`
- **Services**: backend + frontend
- **Network**: datn-network (backend ↔ frontend communication)
- **Health Checks**: Tự động kiểm tra sức khỏe containers
- **Restart Policy**: Tự động restart nếu crash

---

## ⚙️ Cấu hình môi trường

### Backend Environment Variables

Nếu cần tùy chỉnh, sửa `docker-compose.yml`:

```yaml
environment:
  - SPRING_PROFILES_ACTIVE=prod
  - JAVA_OPTS=-Xmx512m -Xms256m
  # Nếu sử dụng database
  # - SPRING_DATASOURCE_URL=jdbc:mysql://db:3306/datn_db
  # - SPRING_DATASOURCE_USERNAME=root
  # - SPRING_DATASOURCE_PASSWORD=root
```

### Frontend Environment Variables

Nếu cần API URL khác, tạo file `.env.prod`:

```bash
# src/.env.prod
NG_APP_API_URL=http://datnbe:8080/api
```

---

## 🔧 Các lệnh hữu ích

### Docker Compose

```bash
# Khởi động tất cả services
docker-compose up -d

# Dừng tất cả services
docker-compose down

# Xem logs
docker-compose logs

# Xem logs real-time của service cụ thể
docker-compose logs -f frontend
docker-compose logs -f backend

# Rebuild images
docker-compose up -d --build

# Xem trạng thái services
docker-compose ps

# Xóa containers, networks, volumes
docker-compose down -v
```

### Docker (độc lập)

```bash
# Liệt kê images
docker images

# Liệt kê containers
docker ps -a

# Xem logs container
docker logs -f container_name

# Vào terminal của container
docker exec -it container_name sh

# Xóa image
docker rmi image_name

# Xóa container
docker rm container_name
```

---

## 📱 Truy cập ứng dụng

| Thành phần | URL | Ghi chú |
|-----------|-----|--------|
| Frontend | http://localhost | Angular application |
| Backend API | http://localhost:8080 | Spring Boot API |
| Backend (từ Frontend) | http://datnbe:8080 | Bên trong Docker network |

---

## 🐛 Troubleshooting

### 1. Port 80 đã được sử dụng

```bash
# Tìm process chiếm port 80
netstat -ano | findstr :80

# Kill process
taskkill /PID <PID> /F

# Hoặc chạy frontend trên port khác
docker run -d -p 8000:80 datn-frontend
```

### 2. Port 8080 đã được sử dụng

```bash
# Tìm process chiếm port 8080
netstat -ano | findstr :8080

# Kill process
taskkill /PID <PID> /F

# Hoặc chạy backend trên port khác
docker run -d -p 9090:8080 datn-backend
```

### 3. Build thất bại

```bash
# Xóa cache và rebuild
docker-compose down
docker system prune -a
docker-compose up -d --build

# Hoặc build lại images
docker build --no-cache -f datn_be/Dockerfile -t datn-backend .
docker build --no-cache -f datn_fe/Dockerfile -t datn-frontend .
```

### 4. Container bị crash

```bash
# Xem logs chi tiết
docker logs datn-backend
docker logs datn-frontend

# Kiểm tra trạng thái
docker ps -a

# Health check status
docker inspect datn-backend | findstr -A 5 "Health"
```

### 5. Frontend không kết nối được backend

Kiểm tra:
- Backend container đang chạy: `docker ps`
- Nginx config có đúng proxy URL: `http://datnbe:8080`
- Kiểm tra logs backend: `docker logs datn-backend`

### 6. Node/npm modules error

```bash
# Xóa cache npm và rebuild
docker build --no-cache -f datn_fe/Dockerfile -t datn-frontend .
```

---

## 📊 Kiểm tra Health Status

```bash
# Backend health
curl http://localhost:8080/api/health

# Frontend health
curl http://localhost

# Hoặc
curl http://localhost:80
```

---

## 🔒 Bảo mật

1. **Không expose credentials** trong docker-compose.yml
2. **Sử dụng .env files** cho sensitive data
3. **Network isolation**: Containers chỉ communicate qua Docker network
4. **Health checks**: Tự động restart nếu service unhealthy
5. **Restart policy**: `unless-stopped` - tự động khởi động khi reboot OS

---

## 🎯 Production Deployment

Để deploy lên production:

1. **Build images đã lộ**: 
   ```bash
   docker-compose -f docker-compose.yml build
   ```

2. **Push lên registry** (Docker Hub, ECR, etc.):
   ```bash
   docker tag datn-backend myregistry/datn-backend:latest
   docker push myregistry/datn-backend:latest
   ```

3. **Deploy lên server**:
   ```bash
   docker pull myregistry/datn-backend:latest
   docker-compose up -d
   ```

---

## 📝 Ghi chú

- **Multi-stage builds**: Giảm kích thước images
- **Alpine Linux**: Base images nhỏ và bảo mật
- **Health checks**: Tự động phát hiện service không sức khỏe
- **Networking**: Containers communicate qua Docker network
- **Volume**: Có thể thêm persistent storage nếu cần database

---

## ❓ Cần giúp đỡ?

1. Kiểm tra logs: `docker-compose logs -f`
2. Kiểm tra trạng thái: `docker-compose ps`
3. Xem cấu hình: `docker inspect container_name`
4. Kiểm tra network: `docker network inspect datn_datn-network`

---

**Chúc bạn thành công! 🎉**

