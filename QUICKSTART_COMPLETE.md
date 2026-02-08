# Quick Start Guide - Chess 6x6

## Prerequisites

- **Java 17+** (for backend)
- **Node.js 18+** (for frontend)
- **npm or yarn** (for frontend dependencies)

## Running the Application

### 1. Start Backend Server

```bash
cd backend
./gradlew bootRun
```

Server will start at: `http://localhost:8080`

**Verify backend:**
```bash
curl http://localhost:8080/api/health
# Expected: {"status":"ok","service":"chess-backend"}
```

### 2. Start Frontend Application

```bash
cd frontend
npm install    # First time only
npm run dev
```

Application will open at: `http://localhost:5173`

## Playing the Game

1. **Start**: Open `http://localhost:5173` in your browser
2. **Select**: Click on any piece (of the current player's color)
3. **Move**: Valid moves will be highlighted in yellow
4. **Execute**: Click a highlighted square to move
5. **Special Moves**:
   - **Castling**: Click king, then click 2 squares left/right
   - **En Passant**: Will be available automatically when conditions are met
   - **Promotion**: When pawn reaches last rank, it auto-promotes to Queen (configurable in future)

## Game Rules (6x6 Board)

### Initial Setup
```
6  R N B Q K R   (Black)
5  P P P P P P
4  . . . . . .
3  . . . . . .
2  P P P P P P
1  R N B Q K R   (White)
   a b c d e f
```

### Piece Movements
- **King (K)**: One square in any direction
- **Queen (Q)**: Any number of squares diagonally or straight
- **Rook (R)**: Any number of squares horizontally or vertically
- **Bishop (B)**: Any number of squares diagonally
- **Knight (N)**: L-shape (2+1 squares, can jump over pieces)
- **Pawn (P)**: Forward 1 (or 2 from start), captures diagonally

### Win Conditions
- **Checkmate**: Opponent's king is in check with no legal moves
- **Stalemate**: Current player has no legal moves but king not in check (draw)

## API Endpoints

### REST
- `POST /api/games` - Create new game
- `GET /api/games/{id}` - Get game state
- `GET /api/health` - Health check

### WebSocket
- **Connect**: `ws://localhost:8080/ws`
- **Send move**: `/app/game/move`
- **Get legal moves**: `/app/game/legal-moves`
- **Receive updates**: `/topic/game/{gameId}`

## Troubleshooting

### Backend won't start
```bash
# Check Java version
java -version  # Should be 17+

# Clean and rebuild
cd backend
./gradlew clean build
```

### Frontend won't start
```bash
# Clear node_modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### WebSocket connection fails
- Ensure backend is running first
- Check browser console for errors
- Verify no firewall blocking port 8080

### No valid moves showing
- Wait for WebSocket connection (green "Connected" indicator)
- Click on your own pieces (current player's color)
- Ensure it's your turn

## Development

### Backend Development
```bash
cd backend
./gradlew bootRun  # Run with auto-reload
```

### Frontend Development
```bash
cd frontend
npm run dev  # Hot module replacement enabled
```

### Run Tests
```bash
# Backend tests
cd backend
./gradlew test

# Frontend tests (if added)
cd frontend
npm run test
```

## Build for Production

### Backend
```bash
cd backend
./gradlew build
java -jar build/libs/chess-backend-0.0.1-SNAPSHOT.jar
```

### Frontend
```bash
cd frontend
npm run build
# Files in dist/ ready to deploy
```

## Features Implemented

✅ All piece movements  
✅ Castling  
✅ En passant  
✅ Pawn promotion  
✅ Check detection  
✅ Checkmate detection  
✅ Stalemate detection  
✅ Real-time multiplayer via WebSocket  
✅ Beautiful animations  
✅ Responsive design  

## Need Help?

Check the detailed documentation:
- `IMPLEMENTATION_COMPLETE.md` - Full technical documentation
- `SUMMARY.md` - Implementation summary
- `backend/DOMAIN_MODEL_IMPLEMENTATION.md` - Domain model details

Enjoy playing Chess 6x6! ♔♕♖♗♘♙
