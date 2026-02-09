# 🚀 Деплой Chess 6x6 на Render.com (БЕСПЛАТНО)

## 📋 Предварительные требования

1. **GitHub аккаунт** (бесплатный)
2. **Render.com аккаунт** (бесплатный)

---

## 🎯 Вариант 1: Render.com Blueprint (Автоматический деплой)

### Шаг 1: Загрузить код на GitHub

```bash
# Инициализировать Git (если еще не сделано)
cd /path/to/chess_sandbox
git init
git add .
git commit -m "Initial commit: Chess 6x6 game"

# Создать репозиторий на GitHub.com через веб-интерфейс
# Затем:
git remote add origin https://github.com/YOUR_USERNAME/chess-6x6.git
git branch -M main
git push -u origin main
```

### Шаг 2: Деплой на Render.com

1. Откройте [render.com](https://render.com)
2. Зарегистрируйтесь через GitHub
3. Нажмите **"New +"** → **"Blueprint"**
4. Выберите ваш GitHub репозиторий `chess-6x6`
5. Render автоматически найдет `render.yaml` и создаст сервисы
6. Нажмите **"Apply"**

**Готово!** Через 5-10 минут получите URL типа:
- Backend: `https://chess-backend.onrender.com`
- Frontend: `https://chess-frontend.onrender.com`

---

## 🎯 Вариант 2: Ручной деплой (больше контроля)

### Backend (Spring Boot)

1. Render.com → **"New +"** → **"Web Service"**
2. Подключить GitHub репозиторий
3. Настройки:
   - **Name:** `chess-backend`
   - **Region:** Frankfurt
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** Java
   - **Build Command:** `./gradlew clean build -x test`
   - **Start Command:** `java -jar build/libs/*.jar`
   - **Instance Type:** Free
4. **Environment Variables:**
   ```
   SERVER_PORT=8080
   SPRING_PROFILES_ACTIVE=production
   ```
5. **Deploy**

### Frontend (React + Vite)

1. Render.com → **"New +"** → **"Static Site"**
2. Подключить тот же GitHub репозиторий
3. Настройки:
   - **Name:** `chess-frontend`
   - **Region:** Frankfurt
   - **Branch:** `main`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install --legacy-peer-deps && npm run build`
   - **Publish Directory:** `dist`
4. **Deploy**

### Связать Frontend и Backend

После деплоя обновите `.env` в frontend:

```env
VITE_API_URL=https://chess-backend.onrender.com
VITE_WS_URL=https://chess-backend.onrender.com/ws
```

И в `vite.config.ts` замените прокси на прямые URL к backend.

---

## 🎯 Вариант 3: Vercel (Frontend) + Render (Backend)

### Backend на Render (как выше)

### Frontend на Vercel

1. [vercel.com](https://vercel.com) → Signup с GitHub
2. **"New Project"**
3. Import `chess-6x6` репозиторий
4. Настройки:
   - **Framework:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. **Environment Variables:**
   ```
   VITE_API_URL=https://chess-backend.onrender.com
   VITE_WS_URL=https://chess-backend.onrender.com/ws
   ```
6. **Deploy**

**Плюсы Vercel для frontend:**
- ⚡ Мгновенная загрузка (не засыпает)
- 🌍 CDN по всему миру
- 🔄 Автодеплой при push в GitHub

---

## ⚠️ Важные Моменты для Бесплатного Tier

### 1. **Холодный старт (Render backend)**

Backend засыпает после 15 минут неактивности. Первый запрос после сна займет ~30 секунд.

**Решение:**
- Добавить loading индикатор
- Использовать сервис пингования (UptimeRobot - бесплатный)

### 2. **CORS настройки**

Обновите `backend/src/main/resources/application.properties`:

```properties
spring.web.cors.allowed-origins=https://chess-frontend.onrender.com,https://your-vercel-app.vercel.app
```

### 3. **WebSocket соединение**

Render поддерживает WebSocket на бесплатном tier ✅

---

## 📊 Мониторинг (Бесплатно)

### UptimeRobot

1. [uptimerobot.com](https://uptimerobot.com) - бесплатная регистрация
2. Добавить монитор:
   - **URL:** `https://chess-backend.onrender.com/api/health`
   - **Interval:** 5 минут
3. Настроить алерты (email/Telegram)

**Бонус:** Постоянные пинги предотвращают засыпание backend!

---

## 🔄 Автоматические Обновления

После настройки просто делайте:

```bash
git add .
git commit -m "Update game logic"
git push origin main
```

Render автоматически пересоберет и задеплоит! 🎉

---

## 💰 Стоимость

- **Render.com Free Tier:** $0/месяц
- **Vercel Hobby:** $0/месяц
- **GitHub:** $0/месяц
- **UptimeRobot:** $0/месяц
- **Домен (опционально):** $10-15/год

**Итого: $0/месяц** ✅

---

## 🐛 Troubleshooting

### Проблема: Backend не запускается

**Проверьте логи:**
```
Render Dashboard → chess-backend → Logs
```

**Частые причины:**
- Java version mismatch (нужна Java 17)
- Ошибка в application.properties
- Порт не 8080

### Проблема: Frontend не подключается к Backend

**Проверьте:**
1. Backend работает: `curl https://chess-backend.onrender.com/api/health`
2. CORS настроен правильно
3. Environment variables в frontend содержат правильные URL

### Проблема: WebSocket не работает

**Проверьте:**
1. URL использует `wss://` (не `ws://`)
2. Backend конфигурация WebSocket корректна
3. Нет блокировки firewall/proxy

---

## 📚 Полезные ссылки

- [Render.com Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Spring Boot на Render](https://render.com/docs/deploy-spring-boot)
- [Vite на Vercel](https://vercel.com/docs/frameworks/vite)

---

## 🎉 Готово!

Теперь у вас есть **полностью бесплатный** production-ready деплой шахмат!

URL будет вида:
- `https://chess-frontend.onrender.com`
- Или `https://chess-6x6.vercel.app`

Можете делиться с друзьями и играть онлайн! ♟️🎮
