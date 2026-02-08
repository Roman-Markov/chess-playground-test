# Chess Backend (Spring Boot + Kotlin)

Backend server for 6x6 chess game with WebSocket support.

## Tech Stack

- **Framework**: Spring Boot 3.2.2
- **Language**: Kotlin 1.9.22
- **Build Tool**: Gradle
- **WebSocket**: STOMP over SockJS
- **Java Version**: 17

## Project Structure

```
backend/
├── src/main/kotlin/com/chess/
│   ├── config/           # WebSocket, CORS configuration
│   ├── domain/           # Domain models (Board, Piece, Move, Game)
│   ├── service/          # Business logic
│   ├── controller/       # REST + WebSocket controllers
│   └── dto/              # Data Transfer Objects
├── src/main/resources/
│   └── application.yml   # Application configuration
└── build.gradle.kts      # Build configuration
```

## Getting Started

### Prerequisites

- JDK 17 or higher
- Gradle 8.x (wrapper included)

### Running the Application

```bash
./gradlew bootRun
```

The server will start on `http://localhost:8080`

### Building

```bash
./gradlew build
```

### Testing

```bash
./gradlew test
```

## API Endpoints

### REST API

- `GET /health` - Health check endpoint

### WebSocket

- **Endpoint**: `/ws` (with SockJS fallback)
- **Application prefix**: `/app`
- **Broker prefix**: `/topic`

Example connection:
```javascript
const socket = new SockJS('http://localhost:8080/ws');
const stompClient = Stomp.over(socket);
```

## Development

### Architecture

The backend follows a layered architecture:

1. **Domain Layer**: Core business entities and logic
2. **Service Layer**: Game logic, validation, state management
3. **Controller Layer**: HTTP and WebSocket endpoints
4. **DTO Layer**: Data transfer objects for API communication

### Key Features

- Real-time game updates via WebSocket
- Move validation
- Check/Checkmate/Stalemate detection
- Special moves (Castling, En Passant, Pawn Promotion)
- CORS enabled for frontend integration
