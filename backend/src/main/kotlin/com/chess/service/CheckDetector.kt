package com.chess.service

import com.chess.domain.*
import org.springframework.stereotype.Service

/**
 * Detects check, checkmate, and stalemate conditions
 */
@Service
class CheckDetector {

    /**
     * Check if a king is in check
     */
    fun isKingInCheck(color: PieceColor, board: Board): Boolean {
        val kingPosition = board.findKing(color) ?: return false
        val opponentColor = color.opposite()

        // Check if any opponent piece can attack the king
        val opponentPieces = board.getPieces(opponentColor)
        return opponentPieces.any { (position, piece) ->
            piece.canMove(position, kingPosition, board)
        }
    }

    /**
     * Check if a position is under attack by the opponent
     */
    fun isSquareUnderAttack(position: Position, byColor: PieceColor, board: Board): Boolean {
        val pieces = board.getPieces(byColor)
        return pieces.any { (piecePos, piece) ->
            piece.canMove(piecePos, position, board)
        }
    }

    /**
     * Check if it's checkmate
     * (King is in check AND no legal moves available)
     */
    fun isCheckmate(game: Game): Boolean {
        if (!isKingInCheck(game.currentPlayer, game.board)) {
            return false
        }
        return !hasAnyLegalMoves(game)
    }

    /**
     * Check if it's stalemate
     * (King is NOT in check AND no legal moves available)
     */
    fun isStalemate(game: Game): Boolean {
        if (isKingInCheck(game.currentPlayer, game.board)) {
            return false
        }
        return !hasAnyLegalMoves(game)
    }

    /**
     * Check if the current player has any legal moves
     */
    fun hasAnyLegalMoves(game: Game): Boolean {
        val pieces = game.board.getPieces(game.currentPlayer)
        for ((position, piece) in pieces) {
            val possibleMoves = piece.getValidMoves(position, game.board).toMutableList()
            // Include en passant for pawns
            if (piece is com.chess.domain.pieces.Pawn) {
                val lastMove = game.getLastMove()
                if (lastMove != null && lastMove.isPawnDoubleMove()) {
                    val passedOverRow = (lastMove.from.row + lastMove.to.row) / 2
                    val ourRowOk = position.row == lastMove.to.row
                    if (ourRowOk && Math.abs(lastMove.to.col - position.col) == 1) {
                        possibleMoves.add(Position(passedOverRow, lastMove.to.col))
                    }
                }
            }
            for (target in possibleMoves) {
                val testBoard = game.board.copy()
                testBoard.movePiece(position, target)
                if (piece is com.chess.domain.pieces.Pawn && piece.canEnPassant(position, target, game.board, game.getLastMove())) {
                    val capturedRow = if (piece.color == PieceColor.WHITE) target.row - 1 else target.row + 1
                    testBoard.setPiece(Position(capturedRow, target.col), null)
                }
                if (!isKingInCheck(game.currentPlayer, testBoard)) return true
            }
        }
        return false
    }

    /**
     * Get all positions that are attacking the king
     */
    fun getAttackingPieces(color: PieceColor, board: Board): List<Position> {
        val kingPosition = board.findKing(color) ?: return emptyList()
        val opponentColor = color.opposite()
        
        return board.getPieces(opponentColor)
            .filter { (position, piece) -> piece.canMove(position, kingPosition, board) }
            .map { it.first }
    }

    /**
     * Determine the game status after a move
     */
    fun getGameStatus(game: Game): GameStatus {
        return when {
            isCheckmate(game) -> GameStatus.CHECKMATE
            isStalemate(game) -> GameStatus.STALEMATE
            isKingInCheck(game.currentPlayer, game.board) -> GameStatus.CHECK
            else -> GameStatus.ACTIVE
        }
    }
}
