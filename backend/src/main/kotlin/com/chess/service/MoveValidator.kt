package com.chess.service

import com.chess.domain.*
import com.chess.domain.pieces.Pawn
import org.springframework.stereotype.Service

/**
 * Validates chess moves including special rules
 */
@Service
class MoveValidator(private val checkDetector: CheckDetector) {

    /**
     * Validate if a move is legal in the current game state
     */
    fun isValidMove(from: Position, to: Position, game: Game): ValidationResult {
        val piece = game.board.getPiece(from)
            ?: return ValidationResult.Invalid("No piece at position ${from.toAlgebraic()}")

        // Check if it's the correct player's turn
        if (piece.color != game.currentPlayer) {
            return ValidationResult.Invalid("Not your turn")
        }

        // Check basic piece movement rules
        if (!piece.canMove(from, to, game.board)) {
            return ValidationResult.Invalid("Invalid move for ${piece.type.name}")
        }

        // Check if the move would leave the king in check
        val testBoard = game.board.copy()
        testBoard.movePiece(from, to)
        if (checkDetector.isKingInCheck(piece.color, testBoard)) {
            return ValidationResult.Invalid("Move would leave king in check")
        }

        return ValidationResult.Valid
    }

    /**
     * Get all legal moves for a piece at a position
     */
    fun getLegalMoves(from: Position, game: Game): List<Position> {
        val piece = game.board.getPiece(from) ?: return emptyList()

        if (piece.color != game.currentPlayer) {
            return emptyList()
        }

        val moves = piece.getValidMoves(from, game.board)
        
        // Filter out moves that would leave king in check
        return moves.filter { to ->
            val testBoard = game.board.copy()
            testBoard.movePiece(from, to)
            !checkDetector.isKingInCheck(piece.color, testBoard)
        }
    }

    /**
     * Validate castling move
     */
    fun canCastle(color: PieceColor, isKingside: Boolean, game: Game): Boolean {
        // Check if king or rook has moved
        if (game.hasKingMoved(color) || game.hasRookMoved(color, isKingside)) {
            return false
        }

        val row = if (color == PieceColor.WHITE) 0 else 5
        val kingCol = 4
        val rookCol = if (isKingside) 5 else 0
        
        // Check if king and rook are in their starting positions
        val king = game.board.getPiece(Position(row, kingCol))
        val rook = game.board.getPiece(Position(row, rookCol))
        
        if (king?.type != PieceType.KING || king.color != color) {
            return false
        }
        if (rook?.type != PieceType.ROOK || rook.color != color) {
            return false
        }

        // Check if squares between king and rook are empty
        val range = if (isKingside) (kingCol + 1 until rookCol) else (rookCol + 1 until kingCol)
        for (col in range) {
            if (game.board.getPiece(Position(row, col)) != null) {
                return false
            }
        }

        // Check if king is in check
        if (checkDetector.isKingInCheck(color, game.board)) {
            return false
        }

        // Check if king passes through or lands on an attacked square
        val targetCol = if (isKingside) kingCol + 2 else kingCol - 2
        val passCol = if (isKingside) kingCol + 1 else kingCol - 1
        
        // Check if the passing square is under attack
        val testBoard1 = game.board.copy()
        testBoard1.movePiece(Position(row, kingCol), Position(row, passCol))
        if (checkDetector.isKingInCheck(color, testBoard1)) {
            return false
        }

        // Check if the landing square is under attack
        val testBoard2 = game.board.copy()
        testBoard2.movePiece(Position(row, kingCol), Position(row, targetCol))
        if (checkDetector.isKingInCheck(color, testBoard2)) {
            return false
        }

        return true
    }

    /**
     * Validate en passant capture
     */
    fun canEnPassant(from: Position, to: Position, game: Game): Boolean {
        val piece = game.board.getPiece(from)
        if (piece !is Pawn) {
            return false
        }

        val lastMove = game.getLastMove() ?: return false
        return piece.canEnPassant(from, to, game.board, lastMove)
    }

    /**
     * Check if pawn should be promoted
     */
    fun shouldPromote(position: Position, game: Game): Boolean {
        val piece = game.board.getPiece(position)
        if (piece !is Pawn) {
            return false
        }
        return piece.shouldPromote(position)
    }
}

/**
 * Result of move validation
 */
sealed class ValidationResult {
    object Valid : ValidationResult()
    data class Invalid(val reason: String) : ValidationResult()
    
    fun isValid(): Boolean = this is Valid
}
