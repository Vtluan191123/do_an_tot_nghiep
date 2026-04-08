# Stage 1: Build
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /app

# Copy pom.xml
COPY datn_be/pom.xml .

# Download dependencies
RUN mvn dependency:go-offline

# Copy source code
COPY datn_be/src ./src

# Build argument for environment
ARG PROFILE=dev

# Build ứng dụng
RUN mvn clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Build argument for environment (copied from build stage)
ARG PROFILE=dev

# Environment variables
ENV SPRING_PROFILES_ACTIVE=${PROFILE}
ENV JAVA_OPTS=${JAVA_OPTS:-"-Xmx512m -Xms256m"}

# Copy JAR từ build stage
COPY --from=builder /app/target/*.jar app.jar

# Create upload directory
RUN mkdir -p /var/www/uploads && chmod 755 /var/www/uploads

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/api/health || exit 1

# Run ứng dụng
ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -Dspring.profiles.active=${SPRING_PROFILES_ACTIVE} -jar app.jar"]

