# 🎓 DATN - Web Integration AI Application

> **Đồ Án Tốt Nghiệp**: Ứng dụng tích hợp AI cho giáo dục trực tuyến

## 📌 Overview

DATN là một ứng dụng full-stack hiện đại kết hợp:
- **Backend**: Spring Boot 3.x (Java 17)
- **Frontend**: Angular 18.x
- **Database**: SQL Server + MongoDB
- **Real-time**: WebSocket
- **AI Integration**: Google Gemini API
- **Deployment**: Docker & Docker Compose

## 🏗️ Project Structure

```
datn/
├── datn_be/                 # Backend (Spring Boot)
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   └── resources/
│   │   │       ├── application.yml
│   │   │       ├── application-dev.yml
│   │   │       └── application-prod.yml
│   │   └── test/
│   ├── Dockerfile
│   └── pom.xml
│
├── datn_fe/                 # Frontend (Angular)
│   ├── src/
│   │   ├── app/
│   │   ├── assets/
│   │   └── index.html
│   ├── public/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── Environment Files
│   ├── .env.dev
│   ├── .env.prod
│   └── .env.example
│
├── Docker Compose
│   ├── docker-compose.dev.yml
│   ├── docker-compose.prod.yml
│   └── docker-compose.yml (deprecated)
│
└── Documentation
    ├── README.md (this file)
    ├── QUICK_START.md
    ├── ENV_SETUP_GUIDE.md
    ├── DOCKER_NETWORK_CONFIG.md
    └── SETUP_SUMMARY.md
```

## 🚀 Quick Start

### Prerequisites
- Docker >= 20.x
- Docker Compose >= 1.29.x
- Git (optional)

### Development Mode

**Windows:**
```bash
cd D:\App\datn
start.bat
# Select option 1 from menu
```

**Linux/Mac:**
```bash
cd /path/to/datn
chmod +x start.sh
./start.sh
# Select option 1 from menu
```

**Manual:**
```bash
docker-compose -f docker-compose.dev.yml --env-file .env.dev up -d --build
```

**Access:**
- Frontend: http://localhost:4200
- Backend: http://localhost:8080

### Production Mode

**Manual:**
```bash
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

**Access:**
- Frontend: http://localhost or https://your-domain.com
- Backend: http://localhost:8080

## 📋 Environment Configuration

### Development Variables (`.env.dev`)

```env
APP_ENV=dev
SPRING_PROFILES_ACTIVE=dev
DB_HOST=159.223.56.71
DB_PORT=1433
MONGODB_HOST=159.223.56.71
API_BASE_URL=http://localhost:8080
```

### Production Variables (`.env.prod`)

```env
APP_ENV=prod
SPRING_PROFILES_ACTIVE=prod
DB_HOST=your_production_db
MONGODB_HOST=your_production_mongo
API_BASE_URL=https://your-domain.com
```

> **Note:** See `.env.example` for all available variables

## 🐳 Docker Management

### Build Images
```bash
# Development
docker-compose -f docker-compose.dev.yml build

# Production
docker-compose -f docker-compose.prod.yml build
```

### Start Services
```bash
# Development
docker-compose -f docker-compose.dev.yml --env-file .env.dev up -d

# Production
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

### View Logs
```bash
# All services
docker-compose -f docker-compose.dev.yml logs -f

# Specific service
docker-compose -f docker-compose.dev.yml logs backend -f
docker-compose -f docker-compose.dev.yml logs frontend -f
```

### Stop Services
```bash
# Development
docker-compose -f docker-compose.dev.yml down

# Production
docker-compose -f docker-compose.prod.yml down
```

### Remove Everything
```bash
# Development
docker-compose -f docker-compose.dev.yml down -v --rmi all

# Production
docker-compose -f docker-compose.prod.yml down -v --rmi all
```

## 📚 Documentation

| Document | Content |
|----------|---------|
| **QUICK_START.md** | Quick reference guide |
| **ENV_SETUP_GUIDE.md** | Detailed setup instructions |
| **SETUP_SUMMARY.md** | Complete checklist & overview |
| **DOCKER_NETWORK_CONFIG.md** | Network & connectivity guide |
| **.env.example** | Environment variable template |

## 🔧 Technology Stack

### Backend
- **Framework**: Spring Boot 3.2.2
- **Language**: Java 17
- **Database**: 
  - SQL Server (Relational)
  - MongoDB (NoSQL)
- **ORM**: Hibernate/JPA
- **Security**: Spring Security + JWT
- **Real-time**: WebSocket (STOMP)
- **File Upload**: Multipart (25MB max)
- **AI Integration**: Google Gemini API

### Frontend
- **Framework**: Angular 18.x
- **Language**: TypeScript
- **UI Components**: Bootstrap 5, ng-bootstrap
- **State Management**: NgRx (optional)
- **Real-time**: STOMP/WebSocket
- **Video Calling**: LiveKit
- **HTTP Client**: HttpClient with Interceptors
- **Styling**: SCSS

### DevOps
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Web Server**: Nginx (with SSL support)
- **Build**: Maven (Backend), Angular CLI (Frontend)

## 🔐 Security Features

- JWT Authentication & Authorization
- HTTPS/SSL Support (Production)
- CORS Configuration
- Spring Security
- SQL Server with encryption
- MongoDB with authentication
- Secure file upload validation

## 💾 Database Schema

### SQL Server
- Tables for:
  - Users
  - Classes
  - Videos
  - Messages
  - WebSocket connections
  - File uploads
  - Gemini AI interactions

### MongoDB
- Collections for:
  - Chat history
  - Real-time messages
  - Session data

## ⚙️ Configuration Files

### Backend Profiles

**`application.yml`** - Base configuration
**`application-dev.yml`** - Development (external DB: 159.223.56.71)
**`application-prod.yml`** - Production (Docker container DB)

### Frontend Environment

**`environment.ts`** - Development environment
**`environment.prod.ts`** - Production environment
**`angular.json`** - Build configuration

## 🛠️ Common Tasks

### Update Database Configuration
1. Edit `.env.dev` or `.env.prod`
2. Update `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`
3. Restart services: `docker-compose down && docker-compose up -d`

### Add New API Endpoint (Backend)
1. Create Controller in `datn_be/src/main/java/com/dntn/datn_be/controller/`
2. Create Service in `datn_be/src/main/java/com/dntn/datn_be/service/`
3. Restart backend: `docker-compose restart backend`

### Add New Page (Frontend)
1. Create component: `ng generate component page/new-page`
2. Add route in `app.routes.ts`
3. Serve with `npm start` or rebuild with `npm run build`

### Enable Gemini AI
1. Get API key from [Google Cloud Console](https://console.cloud.google.com)
2. Add to `.env`: `GEMINI_API_KEY=your_api_key`
3. Restart services

## 🔍 Monitoring & Debugging

### View Container Status
```bash
docker ps
docker ps -a
```

### Check Container Health
```bash
docker inspect --format='{{json .State.Health}}' datn_be_dev
```

### View Environment Variables
```bash
docker exec datn_be_dev env
```

### Test Connectivity
```bash
# Test backend API
curl -I http://localhost:8080/api/health

# Test frontend
curl -I http://localhost:4200

# Test database connection (from backend container)
docker exec datn_be_dev curl http://159.223.56.71:1433
```

### View Real-time Logs
```bash
docker logs -f datn_be_dev
docker logs -f datn_fe_dev
```

## 🐛 Troubleshooting

### Port Conflict
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :8080
kill -9 <PID>
```

### Database Connection Failed
- Verify database credentials in `.env` file
- Check if database server is accessible
- Verify firewall rules

### Frontend Won't Connect to Backend
- Check `API_BASE_URL` in `.env`
- Verify backend service is running
- Check nginx configuration
- Review browser console for errors

### SSL Certificate Issues
- Ensure certificates exist: `/root/ssl/cert.pem` and `/root/ssl/key.pem`
- Verify certificate paths in `nginx.conf`
- Test with self-signed certificate:
  ```bash
  openssl req -x509 -newkey rsa:4096 -nodes \
    -out cert.pem -keyout key.pem -days 365
  ```

## 📊 Performance Tuning

### Backend (Spring Boot)
- Adjust JVM memory in `.env`: `JAVA_OPTS=-Xmx1024m -Xms512m`
- Enable query caching in `application-prod.yml`
- Use connection pooling

### Frontend (Angular)
- Enable production mode build
- Use Angular AOT compilation
- Implement lazy loading for routes
- Minimize bundle size

### Nginx
- Gzip compression enabled
- Static file caching configured
- HTTP/2 support for HTTPS

## 🚀 Deployment Checklist

- [ ] All environment variables configured
- [ ] Database credentials verified
- [ ] MongoDB connection tested
- [ ] SSL certificates ready (production)
- [ ] Gemini API key set (if needed)
- [ ] File upload directory created
- [ ] Docker images built successfully
- [ ] Containers start without errors
- [ ] Health checks passing
- [ ] API endpoints responding
- [ ] Frontend loads correctly
- [ ] WebSocket connections working
- [ ] Logs monitored

## 📞 Support & Help

1. **Quick Reference**: See `QUICK_START.md`
2. **Detailed Setup**: See `ENV_SETUP_GUIDE.md`
3. **Network Issues**: See `DOCKER_NETWORK_CONFIG.md`
4. **Troubleshooting**: Check logs and error messages
5. **Documentation**: Review source code comments

## 📝 Notes

- Always use `--env-file` flag when running docker-compose
- Don't commit `.env` files to version control
- Keep `.env.example` updated with new variables
- Monitor container logs regularly
- Regular database backups recommended
- Update dependencies periodically

## 🔄 Version Information

- **Java**: 17
- **Node.js**: 18.x (for build)
- **Angular**: 18.x
- **Spring Boot**: 3.2.2
- **Docker**: 20.x+
- **Docker Compose**: 1.29.x+

## 📄 License

[Your License Here]

## 👥 Team

[Team Members]

---

**Last Updated:** 2026-04-04  
**Status:** ✅ Production Ready

For detailed information, refer to the documentation files in the project root.

