# ⚡ Шпаргалка: Деплой Chess 6x6

## 🚀 Самый Быстрый Путь (Render.com)

### 1️⃣ GitHub (3 минуты)
```bash
cd chess_sandbox
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/chess-6x6.git
git push -u origin main
```

### 2️⃣ Backend на Render (3 минуты)
```
render.com → New + → Web Service
Name: chess-backend
Runtime: Java
Build: chmod +x gradlew && ./gradlew build -x test
Start: java -jar build/libs/*.jar
Env: SERVER_PORT=8080
```

### 3️⃣ Frontend на Render (3 минуты)
```
render.com → New + → Static Site
Name: chess-frontend
Build: npm install --legacy-peer-deps && npm run build
Publish: dist
Env: VITE_API_URL=https://YOUR-BACKEND-URL
     VITE_WS_URL=https://YOUR-BACKEND-URL/ws
```

### 4️⃣ Обновить CORS (1 минута)
```
Backend → Environment → Add
ALLOWED_ORIGINS=https://YOUR-FRONTEND-URL
```

## ✅ Готово! Откройте ваш frontend URL

---

## 🔄 Обновление
```bash
git add .
git commit -m "Update"
git push
# Render автоматически задеплоит!
```

---

## 🐛 Проблемы?

**Backend не работает:**
```bash
# Проверить
curl https://your-backend/api/health
# Должно вернуть: {"status":"ok"}
```

**Frontend белый экран:**
- Проверьте Console в браузере (F12)
- Проверьте VITE_API_URL правильный

**WebSocket не работает:**
- Используйте wss:// (не ws://)
- Проверьте CORS настроен

---

## 📱 UptimeRobot (предотвратить засыпание)

```
uptimerobot.com → Add Monitor
URL: https://your-backend/api/health
Interval: 5 minutes
```

---

## 💰 Стоимость: $0/месяц 🎉

**Лимиты free tier:**
- 750 часов/месяц (хватает на 1 backend + 1 frontend)
- 512MB RAM
- Засыпает после 15 мин неактивности

**Достаточно для:**
- ✅ MVP
- ✅ Демо
- ✅ Портфолио
- ✅ Обучение
- ✅ Личное использование

---

**Полная документация:** [QUICKSTART_DEPLOY.md](./QUICKSTART_DEPLOY.md)
