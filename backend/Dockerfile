# Multi-stage build для оптимизации размера образа

# Stage 1: Build
FROM eclipse-temurin:17-jdk-alpine AS builder

WORKDIR /app

# Копируем Gradle wrapper и зависимости
COPY gradlew .
COPY gradle gradle
COPY build.gradle.kts .
COPY settings.gradle.kts .
COPY gradle.properties .

# Скачиваем зависимости (кэшируется Docker)
RUN chmod +x gradlew
RUN ./gradlew dependencies --no-daemon || true

# Копируем исходный код
COPY src src

# Собираем проект
RUN ./gradlew clean build -x test --no-daemon

# Stage 2: Runtime
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Копируем только собранный JAR из builder stage
COPY --from=builder /app/build/libs/*.jar app.jar

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1

# Запуск приложения
ENTRYPOINT ["java", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-Xmx256m", \
  "-jar", \
  "app.jar"]
