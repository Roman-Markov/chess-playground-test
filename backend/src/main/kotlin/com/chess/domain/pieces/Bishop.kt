package com.chess.domain.pieces

import com.chess.domain.*

/**
 * Bishop piece - moves any number of squares diagonally
 */
class Bishop(color: PieceColor) : Piece(color, PieceType.BISHOP) {
    
    override fun getValidMoves(from: Position, board: Board): List<Position> {
        val moves = mutableListOf<Position>()
        
        // 4 diagonal directions
        val directions = listOf(
            Pair(-1, -1),  // up-left
            Pair(-1, 1),   // up-right
            Pair(1, -1),   // down-left
            Pair(1, 1)     // down-right
        )
        
        for ((rowDelta, colDelta) in directions) {
            moves.addAll(getPositionsInDirection(from, rowDelta, colDelta, board))
        }
        
        return moves
    }
    
    override fun canMove(from: Position, to: Position, board: Board): Boolean {
        val rowDiff = Math.abs(to.row - from.row)
        val colDiff = Math.abs(to.col - from.col)
        
        // Must be on a diagonal (row difference equals column difference)
        if (rowDiff != colDiff || rowDiff == 0) {
            return false
        }
        
        // Check path is clear
        val rowStep = if (to.row > from.row) 1 else -1
        val colStep = if (to.col > from.col) 1 else -1
        
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
