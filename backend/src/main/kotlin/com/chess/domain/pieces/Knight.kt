package com.chess.domain.pieces

import com.chess.domain.*

/**
 * Knight piece - moves in an "L" shape: 2 squares in one direction and 1 square perpendicular
 */
class Knight(color: PieceColor) : Piece(color, PieceType.KNIGHT) {
    
    override fun getValidMoves(from: Position, board: Board): List<Position> {
        val moves = mutableListOf<Position>()
        
        // All 8 possible L-shaped moves
        val knightMoves = listOf(
            Pair(-2, -1), Pair(-2, 1),  // up 2, left/right 1
            Pair(-1, -2), Pair(-1, 2),  // up 1, left/right 2
            Pair(1, -2),  Pair(1, 2),   // down 1, left/right 2
            Pair(2, -1),  Pair(2, 1)    // down 2, left/right 1
        )
        
        for ((rowDelta, colDelta) in knightMoves) {
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
        val rowDiff = Math.abs(to.row - from.row)
        val colDiff = Math.abs(to.col - from.col)
        
        // Must be L-shaped: (2,1) or (1,2)
        val isValidLMove = (rowDiff == 2 && colDiff == 1) || (rowDiff == 1 && colDiff == 2)
        
        if (!isValidLMove) {
            return false
        }
        
        // Can't capture own piece
        return !isOwnPiece(to, board)
    }
}
