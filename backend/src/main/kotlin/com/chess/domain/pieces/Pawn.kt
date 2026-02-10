package com.chess.domain.pieces

import com.chess.domain.*

/**
 * Pawn piece - moves forward, captures diagonally, with special rules for double move, en passant, and promotion
 */
class Pawn(color: PieceColor) : Piece(color, PieceType.PAWN) {
    
    override fun getValidMoves(from: Position, board: Board): List<Position> {
        val moves = mutableListOf<Position>()
        val direction = if (color == PieceColor.WHITE) 1 else -1
        val startRow = if (color == PieceColor.WHITE) 1 else 4
        
        // Move forward one square
        val oneSquareAhead = Position(from.row + direction, from.col)
        if (oneSquareAhead.row in 0..5 && isEmpty(oneSquareAhead, board)) {
            moves.add(oneSquareAhead)
            
            // Move forward two squares from starting position
            if (from.row == startRow) {
                val twoSquaresAhead = Position(from.row + 2 * direction, from.col)
                if (isEmpty(twoSquaresAhead, board)) {
                    moves.add(twoSquaresAhead)
                }
            }
        }
        
        // Capture diagonally
        for (colDelta in listOf(-1, 1)) {
            val newCol = from.col + colDelta
            if (newCol in 0..5) {
                val capturePosition = Position(from.row + direction, newCol)
                if (capturePosition.row in 0..5 && isOpponentPiece(capturePosition, board)) {
                    moves.add(capturePosition)
                }
            }
        }
        
        return moves
    }
    
    override fun canMove(from: Position, to: Position, board: Board): Boolean {
        val direction = if (color == PieceColor.WHITE) 1 else -1
        val startRow = if (color == PieceColor.WHITE) 1 else 4
        
        val rowDiff = to.row - from.row
        val colDiff = Math.abs(to.col - from.col)
        
        // Move forward one square
        if (rowDiff == direction && colDiff == 0) {
            return isEmpty(to, board)
        }
        
        // Move forward two squares from starting position
        if (rowDiff == 2 * direction && colDiff == 0 && from.row == startRow) {
            val oneSquareAhead = Position(from.row + direction, from.col)
            return isEmpty(oneSquareAhead, board) && isEmpty(to, board)
        }
        
        // Capture diagonally
        if (rowDiff == direction && colDiff == 1) {
            return isOpponentPiece(to, board)
        }
        
        return false
    }
    
    /**
     * Check if pawn can perform en passant capture.
     * Enemy just did a double move to lastMove.to. We capture to the square they passed over.
     * The capturing pawn must be on the same rank as the enemy pawn that just moved.
     */
    fun canEnPassant(from: Position, to: Position, board: Board, lastMove: Move?): Boolean {
        if (lastMove == null) return false

        val direction = if (color == PieceColor.WHITE) 1 else -1

        if (lastMove.piece.type != PieceType.PAWN) return false
        if (!lastMove.isPawnDoubleMove()) return false

        val passedOverRow = (lastMove.from.row + lastMove.to.row) / 2
        if (to.row != passedOverRow || to.col != lastMove.to.col) return false
        if (Math.abs(lastMove.to.col - from.col) != 1) return false

        if (from.row != lastMove.to.row) return false
        return true
    }
    
    /**
     * Check if pawn should be promoted
     */
    fun shouldPromote(position: Position): Boolean {
        val promotionRow = if (color == PieceColor.WHITE) 5 else 0
        return position.row == promotionRow
    }
}
