# 🚀 Cách Chạy Ứng Dụng Theo Môi Trường

## 🎯 Quick Reference

### Development (Dev)
```bash
npm start
# Hoặc
ng serve
```

### Production (Prod)
```bash
ng build --configuration production
# Hoặc build và serve
ng serve --configuration production
```

---

## 📋 Chi Tiết

### 1️⃣ **DEVELOPMENT Mode (Dev)**

#### Cách 1: Sử dụng `npm start`
```bash
cd datn_fe
npm start
```

**Kết quả:**
- ✅ Loads: `environment.ts`
- ✅ baseUrlUpload: `http://localhost:8080/uploads/`
- ✅ App runs on: `http://localhost:4200`
- ✅ Hot reload: Tự động refresh khi sửa code
- ✅ Source maps: Debug dễ dàng

#### Cách 2: Sử dụng `ng serve`
```bash
ng serve
```

**Hoặc với port khác:**
```bash
ng serve --port 4300
```

---

### 2️⃣ **PRODUCTION Mode (Prod)**

#### Cách 1: Build rồi serve
```bash
# Build production
ng build --configuration production

# Serve dist folder
npx http-server dist/dotn-fe/browser -p 8000
```

#### Cách 2: Serve trực tiếp (Dev)
```bash
ng serve --configuration production
```

**Kết quả:**
- ✅ Loads: `environment.prod.ts`
- ✅ baseUrlUpload: `https://159.223.56.71:8080/uploads/`
- ✅ Code được minify
- ✅ Production optimized

---

## 🔍 Verify Environment

### Check trong Browser Console

```javascript
// Open F12 → Console
import { environment } from './environments/environment';
console.log(environment);
```

**Development Output:**
```json
{
  "production": false,
  "apiUrl": "http://localhost:8080",
  "baseUrlUpload": "http://localhost:8080/uploads/"
}
```

**Production Output:**
```json
{
  "production": true,
  "apiUrl": "https://api.yourdomain.com",
  "baseUrlUpload": "https://159.223.56.71:8080/uploads/"
}
```

---

## 📊 Comparison

| Feature | Dev | Prod |
|---------|-----|------|
| Command | `npm start` | `ng build --configuration production` |
| baseUrlUpload | `http://localhost:8080/uploads/` | `https://159.223.56.71:8080/uploads/` |
| Code Size | Lớn (debug info) | Nhỏ (minified) |
| Speed | Chậm hơn | Nhanh hơn |
| Debug | Dễ dàng | Khó hơn |
| Hot Reload | ✅ Có | ❌ Không |
| Performance | Dev | Optimized |

---

## 🛠️ Full Workflow

### Development Workflow

```bash
# 1. Start dev server
npm start

# 2. Dev server runs on http://localhost:4200
# 3. Make changes to code
# 4. App automatically reloads
# 5. Check console for errors
# 6. BASE_URL_UPLOAD uses: http://localhost:8080/uploads/
```

### Production Workflow

```bash
# 1. Build for production
ng build --configuration production

# 2. Output in dist/dotn-fe/browser
# 3. Serve using web server (nginx, apache, etc)
# 4. BASE_URL_UPLOAD uses: https://159.223.56.71:8080/uploads/
# 5. Upload dist folder to server
```

---

## 🐳 With Docker

### Development Docker

```bash
# Build dev image
docker-compose -f docker-compose.dev.yml build

# Run dev services
docker-compose -f docker-compose.dev.yml up -d

# Access at http://localhost:4200
```

### Production Docker

```bash
# Build prod image
docker-compose -f docker-compose.prod.yml build

# Run prod services
docker-compose -f docker-compose.prod.yml up -d

# Access at http://localhost (or https://)
```

---

## ✅ Checklist When Running

### Before Running Dev
- [ ] Node.js installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Dependencies installed (`npm install`)
- [ ] Backend running on `http://localhost:8080`

### Before Building Prod
- [ ] Build succeeds without errors
- [ ] No console warnings
- [ ] dist folder created
- [ ] All assets copied
- [ ] Environment variables correct

---

## 🔧 Configuration

### Change Dev baseUrlUpload

Edit: `src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
  baseUrlUpload: 'http://localhost:8080/uploads/'  // ← Change here
};
```

### Change Prod baseUrlUpload

Edit: `src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.yourdomain.com',
  baseUrlUpload: 'https://159.223.56.71:8080/uploads/'  // ← Change here
};
```

---

## 🚀 Commands Summary

### Start Development
```bash
npm start                          # Easy way
ng serve                          # Or this
ng serve --port 4300             # Custom port
```

### Build Production
```bash
ng build --configuration production
ng build -c production            # Shorthand
```

### Serve Production
```bash
ng serve --configuration production
ng serve -c production            # Shorthand
npx http-server dist -p 8000     # Serve dist folder
```

### Clean & Rebuild
```bash
rm -rf dist node_modules
npm install
npm start                         # Dev
ng build -c production           # Prod
```

---

## 💡 Tips

✅ **For Development:**
- Use `npm start` (faster setup)
- Keep backend running on `http://localhost:8080`
- Open `http://localhost:4200`
- Check console for errors

✅ **For Production:**
- Run `ng build --configuration production`
- Test locally: `ng serve -c production`
- Upload `dist` folder to server
- Configure web server (nginx, apache)

✅ **Verify Environment:**
```bash
# Check which environment is loaded
# Console → import { environment } from './environments/environment';
# console.log(environment);
```

---

## 🎯 Example Workflow

### 1. Development Testing

```bash
# Terminal 1: Backend
cd datn_be
./mvnw spring-boot:run

# Terminal 2: Frontend
cd datn_fe
npm start

# Browser: http://localhost:4200
# baseUrlUpload: http://localhost:8080/uploads/
```

### 2. Production Build

```bash
# Build
ng build --configuration production

# Serve to test
npx http-server dist/dotn-fe/browser -p 8000

# Browser: http://localhost:8000
# baseUrlUpload: https://159.223.56.71:8080/uploads/
```

### 3. Docker Deployment

```bash
# Development
docker-compose -f docker-compose.dev.yml up -d

# Production
docker-compose -f docker-compose.prod.yml up -d
```

---

## ⚡ Performance

### Dev Build Time
- First build: 30-60 seconds
- Subsequent: <5 seconds (hot reload)

### Prod Build Time
- Usually: 60-120 seconds
- Bundle size: ~500KB → ~150KB (minified)

---

**Now you know how to run dev/prod! 🎉**

Choose:
- **Dev:** `npm start` for development
- **Prod:** `ng build --configuration production` for production

