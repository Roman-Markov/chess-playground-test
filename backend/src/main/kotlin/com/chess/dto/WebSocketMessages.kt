package com.chess.dto

import com.chess.domain.*

/**
 * WebSocket message types
 */
enum class MessageType {
    // Client -> Server
    CREATE_GAME,
    JOIN_GAME,
    MAKE_MOVE,
    GET_LEGAL_MOVES,
    
    // Server -> Client
    GAME_CREATED,
    GAME_STATE,
    MOVE_MADE,
    INVALID_MOVE,
    LEGAL_MOVES,
    ERROR
}

/**
 * Base message structure
 */
data class WebSocketMessage(
    val type: MessageType,
    val payload: Any
)

/**
 * Client messages
 */
data class CreateGameMessage(
    val playerId: String
)

data class JoinGameMessage(
    val gameId: String,
    val playerId: String
)

data class MakeMoveMessage(
    val gameId: String,
    val from: PositionDto,
    val to: PositionDto,
    val promotion: String? = null
)

data class GetLegalMovesMessage(
    val gameId: String,
    val position: PositionDto
)

/**
 * Server messages
 */
data class GameCreatedMessage(
    val gameId: String,
    val gameState: GameStateDto
)

data class MoveMadeMessage(
    val gameId: String,
    val move: MoveDto,
    val gameState: GameStateDto
)

data class InvalidMoveMessage(
    val gameId: String,
    val reason: String,
    val from: PositionDto? = null,
    val to: PositionDto? = null
)

data class LegalMovesMessage(
    val gameId: String,
    val position: PositionDto,
    val legalMoves: List<PositionDto>
)

data class ErrorMessage(
    val message: String
)

/**
 * Data Transfer Objects
 */
data class PositionDto(
    val row: Int,
    val col: Int
) {
    fun toDomain() = Position(row, col)
    
    companion object {
        fun fromDomain(position: Position) = PositionDto(position.row, position.col)
    }
}

data class MoveDto(
    val from: PositionDto,
    val to: PositionDto,
    val piece: PieceDto,
    val capturedPiece: PieceDto? = null,
    val promotion: String? = null,
    val isCastling: Boolean = false,
    val isEnPassant: Boolean = false
) {
    companion object {
        fun fromDomain(move: Move) = MoveDto(
            from = PositionDto.fromDomain(move.from),
            to = PositionDto.fromDomain(move.to),
            piece = PieceDto(
                color = move.piece.color.name,
                type = move.piece.type.name
            ),
            capturedPiece = move.capturedPiece?.let {
                PieceDto(color = it.color.name, type = it.type.name)
            },
            promotion = move.promotion?.name,
            isCastling = move.isCastling,
            isEnPassant = move.isEnPassant
        )
    }
}

/**
 * Helper extensions
 */
fun Game.toDto(): GameStateDto {
    val boardArray = Array(6) { row ->
        Array(6) { col ->
            val piece = board.getPiece(Position(row, col))
            piece?.let { PieceDto(it.color.name, it.type.name) }
        }
    }
    
    return GameStateDto(
        gameId = id,
        board = boardArray,
        currentPlayer = currentPlayer,
        status = status,
        lastMove = getLastMove()
    )
}
