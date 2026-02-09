package com.chess.domain

import java.time.Instant
import java.util.UUID

/**
 * Game status
 */
enum class GameStatus {
    ACTIVE,
    CHECK,
    CHECKMATE,
    STALEMATE,
    DRAW
}

/**
 * Represents a chess game state
 */
data class Game(
    val id: String = UUID.randomUUID().toString(),
    val board: Board = Board(),
    val currentPlayer: PieceColor = PieceColor.WHITE,
    val status: GameStatus = GameStatus.ACTIVE,
    val moveHistory: List<Move> = emptyList(),
    val whiteKingMoved: Boolean = false,
    val blackKingMoved: Boolean = false,
    val whiteKingsideRookMoved: Boolean = false,
    val whiteQueensideRookMoved: Boolean = false,
    val blackKingsideRookMoved: Boolean = false,
    val blackQueensideRookMoved: Boolean = false,
    val createdAt: Instant = Instant.now(),
    val lastMoveAt: Instant? = null
) {
    /**
     * Get the last move made in the game
     */
    fun getLastMove(): Move? = moveHistory.lastOrNull()

    /**
     * Check if a specific rook has moved (for castling validation)
     */
    fun hasRookMoved(color: PieceColor, isKingside: Boolean): Boolean {
        return when {
            color == PieceColor.WHITE && isKingside -> whiteKingsideRookMoved
            color == PieceColor.WHITE && !isKingside -> whiteQueensideRookMoved
            color == PieceColor.BLACK && isKingside -> blackKingsideRookMoved
            else -> blackQueensideRookMoved
        }
    }

    /**
     * Check if the king has moved (for castling validation)
     */
    fun hasKingMoved(color: PieceColor): Boolean {
        return when (color) {
            PieceColor.WHITE -> whiteKingMoved
            PieceColor.BLACK -> blackKingMoved
        }
    }

    /**
     * Create a new game state after a move
     */
    fun afterMove(
        move: Move,
        newStatus: GameStatus = GameStatus.ACTIVE
    ): Game {
        // Update king moved flag
        var newWhiteKingMoved = whiteKingMoved
        var newBlackKingMoved = blackKingMoved
        if (move.piece.type == PieceType.KING) {
            if (move.piece.color == PieceColor.WHITE) {
                newWhiteKingMoved = true
            } else {
                newBlackKingMoved = true
            }
        }

        // Update rook moved flags
        var newWhiteKingsideRookMoved = whiteKingsideRookMoved
        var newWhiteQueensideRookMoved = whiteQueensideRookMoved
        var newBlackKingsideRookMoved = blackKingsideRookMoved
        var newBlackQueensideRookMoved = blackQueensideRookMoved

        if (move.piece.type == PieceType.ROOK) {
            when {
                move.piece.color == PieceColor.WHITE && move.from == Position(0, 5) -> 
                    newWhiteKingsideRookMoved = true
                move.piece.color == PieceColor.WHITE && move.from == Position(0, 0) -> 
                    newWhiteQueensideRookMoved = true
                move.piece.color == PieceColor.BLACK && move.from == Position(5, 5) -> 
                    newBlackKingsideRookMoved = true
                move.piece.color == PieceColor.BLACK && move.from == Position(5, 0) -> 
                    newBlackQueensideRookMoved = true
            }
        }

        // Apply the move to the board
        val newBoard = board.copy()
        newBoard.movePiece(move.from, move.to)

        // Handle pawn promotion
        if (move.promotion != null) {
            val newPiece = when (move.promotion) {
                PieceType.QUEEN -> com.chess.domain.pieces.Queen(move.piece.color)
                PieceType.ROOK -> com.chess.domain.pieces.Rook(move.piece.color)
                PieceType.BISHOP -> com.chess.domain.pieces.Bishop(move.piece.color)
                PieceType.KNIGHT -> com.chess.domain.pieces.Knight(move.piece.color)
                else -> throw IllegalArgumentException("Invalid promotion piece: ${move.promotion}")
            }
            newBoard.setPiece(move.to, newPiece)
        }

        // Handle en passant capture
        if (move.isEnPassant) {
            val capturedPawnRow = if (move.piece.color == PieceColor.WHITE) move.to.row - 1 else move.to.row + 1
            newBoard.setPiece(Position(capturedPawnRow, move.to.col), null)
        }

        // Handle castling
        if (move.isCastling) {
            val rookFromCol = if (move.to.col > move.from.col) 5 else 0
            val rookToCol = if (move.to.col > move.from.col) move.to.col - 1 else move.to.col + 1
            val row = move.from.row
            newBoard.movePiece(Position(row, rookFromCol), Position(row, rookToCol))
        }

        return copy(
            board = newBoard,
            currentPlayer = currentPlayer.opposite(),
            status = newStatus,
            moveHistory = moveHistory + move,
            whiteKingMoved = newWhiteKingMoved,
            blackKingMoved = newBlackKingMoved,
            whiteKingsideRookMoved = newWhiteKingsideRookMoved,
            whiteQueensideRookMoved = newWhiteQueensideRookMoved,
            blackKingsideRookMoved = newBlackKingsideRookMoved,
            blackQueensideRookMoved = newBlackQueensideRookMoved,
            lastMoveAt = Instant.now()
        )
    }

    /**
     * Get move count (full moves, not half-moves)
     */
    fun getMoveCount(): Int = (moveHistory.size + 1) / 2

    /**
     * Check if game is over
     */
    fun isGameOver(): Boolean = status in listOf(
        GameStatus.CHECKMATE,
        GameStatus.STALEMATE,
        GameStatus.DRAW
    )
}
