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

# Copy environment files
COPY datn_fe/src/environments ./src/environments

# Build argument for environment (dev or prod)
ARG PROFILE=dev

# Build ứng dụng với configuration tương ứng
RUN if [ "${PROFILE}" = "prod" ] ; then \
      npm run build -- --configuration production ; \
    else \
      npm run build ; \
    fi

# Stage 2: Runtime (Nginx)
FROM nginx:alpine

# Build argument for environment
ARG PROFILE=dev

# Set environment variable
ENV APP_ENV=${PROFILE}

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY datn_fe/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app vào nginx
COPY --from=builder /app/dist/dotn-fe/browser /usr/share/nginx/html

# Create directories for SSL certificates (production)
RUN mkdir -p /etc/nginx/ssl && chmod 700 /etc/nginx/ssl

# Expose port
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80 || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80 || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

