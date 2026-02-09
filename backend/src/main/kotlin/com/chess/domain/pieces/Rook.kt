package com.chess.domain.pieces

import com.chess.domain.*

/**
 * Rook piece - moves any number of squares horizontally or vertically
 */
class Rook(color: PieceColor) : Piece(color, PieceType.ROOK) {
    
    override fun getValidMoves(from: Position, board: Board): List<Position> {
        val moves = mutableListOf<Position>()
        
        // 4 directions: up, down, left, right
        val directions = listOf(
            Pair(-1, 0),  // up
            Pair(1, 0),   // down
            Pair(0, -1),  // left
            Pair(0, 1)    // right
        )
        
        for ((rowDelta, colDelta) in directions) {
            moves.addAll(getPositionsInDirection(from, rowDelta, colDelta, board))
        }
        
        return moves
    }
    
    override fun canMove(from: Position, to: Position, board: Board): Boolean {
        // Must be on same row or column
        if (from.row != to.row && from.col != to.col) {
            return false
        }
        
        // Check path is clear
        val rowStep = when {
            to.row > from.row -> 1
            to.row < from.row -> -1
            else -> 0
        }
        val colStep = when {
            to.col > from.col -> 1
            to.col < from.col -> -1
            else -> 0
        }
        
        var currentRow = from.row + rowStep
        var currentCol = from.col + colStep
        
        while (currentRow != to.row || currentCol != to.col) {
            if (board.getPiece(Position(currentRow, currentCol)) != null) {
                return false
            }
            currentRow += rowStep
            currentCol += colStep
        }
        
        // Can't capture own piece
        return !isOwnPiece(to, board)
    }
}
