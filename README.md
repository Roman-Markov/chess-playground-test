# Chess Game 6x6

A modern chess game implementation with a 6x6 board, built with Spring Boot (Backend) and React + Vite (Frontend), featuring real-time WebSocket communication.

## Project Overview

This project implements a fully functional chess game with the following features:

- **6x6 Board**: Compact chess variant on a smaller board
- **All Chess Rules**: Including castling, en passant, pawn promotion, check/checkmate/stalemate
- **Real-time Multiplayer**: WebSocket-based communication for instant updates
- **Modern UI**: React-based frontend with Unicode chess pieces and smooth animations
- **Extensible Architecture**: Designed for easy addition of new features (AI, different board sizes, new pieces)

## Architecture

The project is split into two independent applications:

### Backend (`backend/`)

**Tech Stack:**
- Spring Boot 3.2.2
- Kotlin 1.9.22
- WebSocket (STOMP over SockJS)
- Gradle 8.5

**Key Features:**
- RESTful API for game management
- WebSocket server for real-time communication
- Complete chess rule implementation
- Move validation and game state management

### Frontend (`frontend/`)

**Tech Stack:**
- React 19.2
- Vite 7.2
- TypeScript 5.9
- WebSocket Client (STOMP + SockJS)

**Key Features:**
- Interactive 6x6 chess board
- Unicode chess piece rendering
- Drag & drop piece movement
- Real-time game updates
- Move validation and highlighting
- Smooth animations

## Project Structure

```
chess_sandbox/
├── backend/                 # Spring Boot backend
│   ├── src/
│   │   └── main/kotlin/com/chess/
│   │       ├── config/      # WebSocket & CORS config
│   │       ├── domain/      # Game models
│   │       ├── service/     # Business logic
│   │       ├── controller/  # REST & WebSocket controllers
│   │       └── dto/         # Data transfer objects
│   ├── build.gradle.kts
│   └── README.md
│
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # WebSocket & validation
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Utilities
│   │   └── styles/          # CSS styles
│   ├── package.json
│   └── README.md
│
└── README.md               # This file
```

## Getting Started

### Prerequisites

- **Java 17** or higher (for backend)
- **Node.js 20** or higher (for frontend)
- **npm 10** or higher (for frontend)

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Run the application:
   ```bash
   ./gradlew bootRun
   ```

3. The backend will start on `http://localhost:8080`

4. Test the health endpoint:
   ```bash
   curl http://localhost:8080/health
   ```

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. The frontend will start on `http://localhost:5173`

5. Open your browser and navigate to `http://localhost:5173`

## Development

### Backend Development

- **Building**: `./gradlew build`
- **Testing**: `./gradlew test`
- **Clean**: `./gradlew clean`

### Frontend Development

- **Dev Server**: `npm run dev`
- **Build**: `npm run build`
- **Preview**: `npm run preview`
- **Lint**: `npm run lint`

## Deployment

For deploying the application to production servers, see the comprehensive deployment documentation:

📁 **[docs/deployment/](./docs/deployment/)** - Complete deployment guides

**Quick Links:**
- 🚀 [Quick Start Deployment](./docs/deployment/QUICKSTART_DEPLOY.md) - Deploy in 10 minutes
- 📊 [Deployment Options](./docs/deployment/DEPLOYMENT_OPTIONS.md) - Compare hosting options
- 🔧 [Full Deployment Guide](./docs/deployment/DEPLOY.md) - Production-ready setup
- 📝 [Deployment Cheatsheet](./docs/deployment/CHEATSHEET.md) - Commands and troubleshooting

**Recommended for MVP (Free):**
- Backend: Render.com (Free Web Service)
- Frontend: Vercel (Free Hobby Plan)
- Cost: $0/month

## API Documentation

### REST Endpoints

- `GET /health` - Health check

### WebSocket

- **Endpoint**: `/ws`
- **Protocol**: STOMP over SockJS
- **Destinations**:
  - `/app/game` - Send game messages
  - `/topic/game` - Subscribe to game updates

## Chess Rules Implementation

### Standard Rules

- **King**: Moves 1 square in any direction
- **Queen**: Moves any distance diagonally, horizontally, or vertically
- **Rook**: Moves any distance horizontally or vertically
- **Bishop**: Moves any distance diagonally
- **Knight**: Moves in an "L" shape
- **Pawn**: Moves forward 1 square, captures diagonally

### Special Rules

- **Castling**: King and rook special move (when neither has moved)
- **En Passant**: Special pawn capture
- **Pawn Promotion**: Pawn reaching the end transforms to another piece
- **Check**: King is under attack
- **Checkmate**: King is under attack with no legal moves
- **Stalemate**: No legal moves available but not in check

## Extension Points

The architecture is designed for extensibility:

1. **New Pieces**: Extend `Piece` class with new movement rules
2. **Different Board Sizes**: Parameterize board dimensions
3. **AI Opponent**: Add minimax algorithm service
4. **Game History**: Already structured for undo/redo
5. **Timer**: Add time control for competitive play
6. **Multiplayer Lobby**: Extend WebSocket for room management
7. **Game Storage**: Add database layer for persistence
8. **Analytics**: Track moves and games for statistics

## Technology Choices

### Backend: Spring Boot + Kotlin

- **Spring Boot**: Industry-standard framework with excellent WebSocket support
- **Kotlin**: Modern language with null safety and concise syntax
- **Gradle**: Flexible build system

### Frontend: React + Vite

- **React**: Popular framework with excellent ecosystem
- **Vite**: Fast build tool with HMR
- **TypeScript**: Type safety prevents bugs
- **SockJS**: WebSocket with fallback support

## Contributing

When adding features:

1. Follow the existing architecture patterns
2. Add unit tests for new logic
3. Update relevant README files
4. Ensure TypeScript types are properly defined
5. Test WebSocket communication thoroughly

## License

This project is for educational purposes.

## Future Enhancements

- [ ] Move history timeline
- [ ] Undo/Redo functionality
- [ ] Game timer with time controls
- [ ] Multiple game rooms
- [ ] Player authentication
- [ ] Game storage and replay
- [ ] AI opponent with difficulty levels
- [ ] Mobile app (React Native)
- [ ] Dark/Light theme
- [ ] Accessibility improvements
- [ ] Game statistics and analytics
- [ ] Tournament mode
- [ ] Chess variants (Chess960, different board sizes)
