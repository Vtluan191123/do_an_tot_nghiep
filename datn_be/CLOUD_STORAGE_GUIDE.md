# API Upload Cloud Storage - Hướng Dẫn

## Mô tả

Dự án đã được cập nhật hỗ trợ upload file lên cloud storage (DigitalOcean Spaces) hoặc lưu trữ cục bộ.

## Các thay đổi chính

### 1. Dependencies (pom.xml)
- Thêm AWS SDK v2 để hỗ trợ S3-compatible storage (DigitalOcean Spaces)

### 2. Configuration
- **DigitalOceanSpacesConfig**: Cấu hình S3Client để kết nối DigitalOcean Spaces
- **CloudStorageService**: Interface cho cloud storage operations
- **DigitalOceanSpacesService**: Implement upload/delete files trên DigitalOcean Spaces

### 3. Service Updates
- **UploadFileServiceImpl**: Cập nhật để hỗ trợ cả local và cloud storage tùy theo cấu hình

### 4. Configuration Files
- **application.yml**: Default dùng local storage
- **application-dev.yml**: Cấu hình cloud storage (DigitalOcean Spaces)

## Cách sử dụng

### Bước 1: Cấu hình DigitalOcean Spaces

Trong `application-dev.yml` (hoặc file config của bạn):

```yaml
spring:
  digitalocean:
    spaces:
      access-key: YOUR_ACCESS_KEY          # Nhận từ DigitalOcean
      secret-key: YOUR_SECRET_KEY          # Nhận từ DigitalOcean
      region: sgp1                         # Region của Spaces
      endpoint: https://BUCKET.sgp1.cdn.digitaloceanspaces.com/
      bucket: your-bucket-name             # Tên bucket

storage:
  type: cloud                              # Chỉnh thành 'cloud' để dùng DigitalOcean
```

### Bước 2: Chọn Storage Type

**Để dùng Cloud (DigitalOcean Spaces):**
```yaml
storage:
  type: cloud
```

**Để dùng Local Storage:**
```yaml
storage:
  type: local
```

### Bước 3: API Usage

#### Upload Files

**Endpoint:** `POST /api/upload`

**Request:**
```
Form-data:
  files: [file1, file2, file3]
```

**Response (Success):**
```json
{
  "status": 200,
  "data": [
    "https://bucket.sgp1.cdn.digitaloceanspaces.com/uuid_filename1.jpg",
    "https://bucket.sgp1.cdn.digitaloceanspaces.com/uuid_filename2.pdf"
  ],
  "message": "Files uploaded successfully"
}
```

**Response (Error - khi dùng local):**
```json
{
  "status": 500,
  "data": [],
  "message": "Failed to upload files"
}
```

#### Delete Files

**Endpoint:** `DELETE /api/delete`

**Request:**
```
Query Params:
  files: [url1, url2, url3]
```

Hoặc nếu dùng local storage, truyền file names:
```
Query Params:
  files: [filename1, filename2]
```

**Response (Success):**
```json
{
  "status": 200,
  "data": true,
  "message": "Files deleted successfully"
}
```

## Features

✅ Upload file lên DigitalOcean Spaces  
✅ Delete file từ DigitalOcean Spaces  
✅ Fallback sang local storage nếu cần  
✅ Automatic file naming (UUID prefix)  
✅ Support multiple files at once  
✅ Logging for debugging  

## Lưu ý

1. **Secret Key**: Hãy lưu secret key vào environment variable thay vì hardcode trong file config
2. **Endpoint**: Đảm bảo endpoint của DigitalOcean Spaces đúng
3. **Bucket Name**: Phải khớp với bucket name trong DigitalOcean
4. **File Size**: Max 25MB per file, 50MB per request (có thể thay đổi trong `application.yml`)

## Troubleshooting

### Error: "Failed to connect to endpoint"
- Kiểm tra endpoint URL trong config
- Kiểm tra access key và secret key

### Error: "Access Denied"
- Kiểm tra access key và secret key
- Kiểm tra bucket name
- Kiểm tra quyền của bucket

### Files không được upload
- Kiểm tra storage type trong config
- Kiểm tra file size
- Xem logs để debug

## Environment Setup

Nếu sử dụng environment variables:

```bash
# .env hoặc trong system environment
DO_SPACES_ACCESS_KEY=YOUR_ACCESS_KEY
DO_SPACES_SECRET_KEY=YOUR_SECRET_KEY
```

Sau đó update application-dev.yml:
```yaml
spring:
  digitalocean:
    spaces:
      access-key: ${DO_SPACES_ACCESS_KEY}
      secret-key: ${DO_SPACES_SECRET_KEY}
```

