# Multi-stage build для React + Vite приложения

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package files
COPY package.json package-lock.json* ./

# Устанавливаем зависимости
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# Копируем исходники
COPY . .

# Собираем production build
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Копируем собранные файлы
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем Nginx конфигурацию
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Запуск Nginx
CMD ["nginx", "-g", "daemon off;"]
