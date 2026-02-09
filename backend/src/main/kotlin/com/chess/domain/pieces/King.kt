package com.chess.domain.pieces

import com.chess.domain.*

/**
 * King piece - moves one square in any direction
 */
class King(color: PieceColor) : Piece(color, PieceType.KING) {
    
    override fun getValidMoves(from: Position, board: Board): List<Position> {
        val moves = mutableListOf<Position>()
        
        // All 8 directions: up, down, left, right, and 4 diagonals
        val directions = listOf(
            Pair(-1, -1), Pair(-1, 0), Pair(-1, 1),
            Pair(0, -1),               Pair(0, 1),
            Pair(1, -1),  Pair(1, 0),  Pair(1, 1)
        )
        
        for ((rowDelta, colDelta) in directions) {
            val newRow = from.row + rowDelta
            val newCol = from.col + colDelta
            
            if (newRow in 0..5 && newCol in 0..5) {
                val position = Position(newRow, newCol)
                if (!isOwnPiece(position, board)) {
                    moves.add(position)
                }
            }
        }
        
        return moves
    }
    
    override fun canMove(from: Position, to: Position, board: Board): Boolean {
        // Check if destination is within one square
        val rowDiff = Math.abs(to.row - from.row)
        val colDiff = Math.abs(to.col - from.col)
        
        if (rowDiff > 1 || colDiff > 1) {
            return false
        }
        
        // Can't capture own piece
        return !isOwnPiece(to, board)
    }
}
