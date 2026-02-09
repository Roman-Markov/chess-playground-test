package com.chess.domain.pieces

import com.chess.domain.*

/**
 * Queen piece - moves any number of squares diagonally or straight
 */
class Queen(color: PieceColor) : Piece(color, PieceType.QUEEN) {
    
    override fun getValidMoves(from: Position, board: Board): List<Position> {
        val moves = mutableListOf<Position>()
        
        // All 8 directions: horizontal, vertical, and diagonals
        val directions = listOf(
            Pair(-1, -1), Pair(-1, 0), Pair(-1, 1),
            Pair(0, -1),               Pair(0, 1),
            Pair(1, -1),  Pair(1, 0),  Pair(1, 1)
        )
        
        for ((rowDelta, colDelta) in directions) {
            moves.addAll(getPositionsInDirection(from, rowDelta, colDelta, board))
        }
        
        return moves
    }
    
    override fun canMove(from: Position, to: Position, board: Board): Boolean {
        val rowDiff = Math.abs(to.row - from.row)
        val colDiff = Math.abs(to.col - from.col)
        
        // Must be on same row, column, or diagonal
        val isHorizontal = rowDiff == 0 && colDiff > 0
        val isVertical = colDiff == 0 && rowDiff > 0
        val isDiagonal = rowDiff == colDiff && rowDiff > 0
        
        if (!isHorizontal && !isVertical && !isDiagonal) {
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
