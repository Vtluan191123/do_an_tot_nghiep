# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY datn_fe/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY datn_fe/src ./src
COPY datn_fe/public ./public
COPY datn_fe/tsconfig*.json ./
COPY datn_fe/angular.json ./
COPY datn_fe/server.ts ./

# Build ứng dụng
RUN npm run build

# Stage 2: Runtime (Nginx)
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY datn_fe/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app vào nginx
COPY --from=builder /app/dist/dotn-fe/browser /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80 || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

