# Chess Frontend (React + Vite + TypeScript)

Frontend client for 6x6 chess game with real-time WebSocket communication.

## Tech Stack

- **Framework**: React 19.2
- **Build Tool**: Vite 7.2
- **Language**: TypeScript 5.9
- **WebSocket**: STOMP over SockJS
- **Styling**: CSS with modern features

## Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── Board.tsx        # Chess board (6x6 grid)
│   │   ├── Cell.tsx         # Individual cell
│   │   ├── Piece.tsx        # Chess piece (Unicode)
│   │   ├── GameInfo.tsx     # Game status display
│   │   └── MoveHistory.tsx  # Move history (future)
│   ├── hooks/               # Custom React hooks
│   │   ├── useWebSocket.ts  # WebSocket connection
│   │   ├── useGame.ts       # Game state management
│   │   └── useDragAndDrop.ts # Drag & Drop for pieces
│   ├── services/            # Business logic
│   │   ├── websocket.ts     # WebSocket client
│   │   └── validation.ts    # Client-side validation
│   ├── types/               # TypeScript types
│   │   ├── Piece.ts         # Piece types
│   │   ├── Position.ts      # Position types
│   │   ├── Move.ts          # Move types
│   │   └── GameState.ts     # Game state types
│   ├── utils/               # Utilities
│   │   └── pieceSymbols.ts  # Unicode chess symbols
│   ├── styles/              # CSS styles
│   │   └── Board.css        # Board styling + animations
│   ├── App.tsx              # Main app component
│   └── main.tsx             # App entry point
├── public/                  # Static assets
├── index.html               # HTML template
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies
```

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher

### Installation

```bash
npm install
```

### Running the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:8080
VITE_WS_URL=http://localhost:8080/ws
```

## WebSocket Connection

The app connects to the backend WebSocket server using STOMP over SockJS:

```typescript
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const socket = new SockJS('http://localhost:8080/ws');
const stompClient = new Client({
  webSocketFactory: () => socket,
  // ...
});
```

## Features

- **6x6 Chess Board**: Rendered using CSS Grid
- **Unicode Pieces**: ♔ ♕ ♖ ♗ ♘ ♙ (White) / ♚ ♛ ♜ ♝ ♞ ♟ (Black)
- **Real-time Updates**: WebSocket communication for instant move updates
- **Move Validation**: Client-side validation for quick feedback
- **Move Highlighting**: Visual indicators for valid moves
- **Drag & Drop**: Intuitive piece movement
- **Animations**: Smooth transitions for piece movements
- **Responsive Design**: Works on desktop and mobile

## Architecture

### State Management

The app uses React hooks for state management:

```typescript
interface GameState {
  board: Piece[][];
  currentPlayer: Color;
  selectedCell: Position | null;
  validMoves: Position[];
  gameStatus: 'active' | 'check' | 'checkmate' | 'stalemate';
}
```

### Component Hierarchy

```
App
├── Board
│   ├── Cell (x36 for 6x6)
│   │   └── Piece (if occupied)
│   └── GameInfo
└── MoveHistory (future)
```

### WebSocket Events

**Sending:**
- `MOVE` - Send player move

**Receiving:**
- `GAME_STATE` - Receive game state update
- `INVALID_MOVE` - Move was invalid
- `CHECK` / `CHECKMATE` / `STALEMATE` - Game status

## Styling

The app uses modern CSS features:

- CSS Grid for board layout
- CSS Transitions for smooth animations
- CSS Variables for theming
- Flexbox for component layout

### Chess Piece Symbols

```typescript
const PIECE_SYMBOLS = {
  'white-king': '♔', 'white-queen': '♕', 'white-rook': '♖',
  'white-bishop': '♗', 'white-knight': '♘', 'white-pawn': '♙',
  'black-king': '♚', 'black-queen': '♛', 'black-rook': '♜',
  'black-bishop': '♝', 'black-knight': '♞', 'black-pawn': '♟'
};
```

## Development

### Adding New Components

1. Create component in `src/components/`
2. Add TypeScript types in `src/types/`
3. Add styles in `src/styles/`
4. Import and use in parent component

### Code Style

- Use functional components with hooks
- Use TypeScript for type safety
- Follow ESLint rules
- Use CSS modules for component styles

## Future Enhancements

- Move history timeline
- Undo/Redo functionality
- Game timer
- Multiple game rooms
- Player profiles
- Game statistics
- Dark/Light theme toggle
- Mobile touch optimization
- Accessibility improvements
