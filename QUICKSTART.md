# Quick Start Guide

Get the chess game up and running in 5 minutes!

## Prerequisites Check

Before starting, ensure you have:

```bash
# Check Java version (need 17+)
java -version

# Check Node.js version (need 20+)
node --version

# Check npm version (need 10+)
npm --version
```

If any of these are missing, install them first.

## Step 1: Start the Backend

Open a terminal and run:

```bash
cd backend
./gradlew bootRun
```

Wait for the message: `Started ChessApplication in X seconds`

The backend is now running on `http://localhost:8080`

## Step 2: Start the Frontend

Open a **new** terminal and run:

```bash
cd frontend
npm install    # First time only
npm run dev
```

The frontend will start on `http://localhost:5173`

## Step 3: Play!

Open your browser and navigate to:

```
http://localhost:5173
```

You should see the chess board interface.

## Troubleshooting

### Backend won't start

**Problem**: `JAVA_HOME is not set`
**Solution**: Install Java 17 or set JAVA_HOME environment variable

**Problem**: Port 8080 already in use
**Solution**: Stop the process using port 8080 or change the port in `backend/src/main/resources/application.yml`

### Frontend won't start

**Problem**: `npm: command not found`
**Solution**: Install Node.js from https://nodejs.org/

**Problem**: Port 5173 already in use
**Solution**: The Vite dev server will automatically try the next available port

### WebSocket connection fails

**Problem**: Frontend can't connect to backend
**Solution**: 
1. Make sure backend is running (check `http://localhost:8080/health`)
2. Check CORS settings in `backend/src/main/kotlin/com/chess/config/CorsConfig.kt`
3. Check WebSocket URL in frontend `.env` file

## Development Workflow

### Backend Development

```bash
cd backend

# Run with auto-reload (using Spring DevTools)
./gradlew bootRun

# Build
./gradlew build

# Run tests
./gradlew test

# Clean build
./gradlew clean build
```

### Frontend Development

```bash
cd frontend

# Start dev server with HMR
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Next Steps

- Read the main [README.md](README.md) for architecture details
- Check [backend/README.md](backend/README.md) for backend API documentation
- Check [frontend/README.md](frontend/README.md) for frontend component structure
- Start implementing features from the plan!

## Useful Commands

```bash
# Backend: Check if it's running
curl http://localhost:8080/health

# Frontend: Check WebSocket connection
# Open browser console and look for WebSocket messages

# Stop all servers
# Press Ctrl+C in each terminal
```

## Directory Structure Quick Reference

```
chess_sandbox/
├── backend/          # Spring Boot server (port 8080)
│   ├── src/main/kotlin/com/chess/
│   │   ├── config/       # Configuration
│   │   ├── domain/       # Game models
│   │   ├── service/      # Business logic
│   │   ├── controller/   # REST & WebSocket
│   │   └── dto/          # Data transfer objects
│   └── build.gradle.kts
│
└── frontend/         # React app (port 5173)
    ├── src/
    │   ├── components/   # React components
    │   ├── hooks/        # Custom hooks
    │   ├── services/     # WebSocket client
    │   ├── types/        # TypeScript types
    │   └── utils/        # Utilities
    └── package.json
```

Happy coding! 🎮♟️
