package com.chess.domain

/**
 * Abstract base class for all chess pieces.
 * Uses Strategy Pattern for different movement rules.
 */
abstract class Piece(
    val color: PieceColor,
    val type: PieceType
) {
    /**
     * Get all valid moves for this piece from the given position.
     * Does not consider check/checkmate (that's handled by MoveValidator).
     */
    abstract fun getValidMoves(from: Position, board: Board): List<Position>

    /**
     * Check if this piece can move from 'from' to 'to' position.
     * Does not consider check/checkmate (that's handled by MoveValidator).
     */
    abstract fun canMove(from: Position, to: Position, board: Board): Boolean

    /**
     * Helper method to check if a position is occupied by opponent's piece
     */
    protected fun isOpponentPiece(position: Position, board: Board): Boolean {
        val piece = board.getPiece(position)
        return piece != null && piece.color != this.color
    }

    /**
     * Helper method to check if a position is occupied by own piece
     */
    protected fun isOwnPiece(position: Position, board: Board): Boolean {
        val piece = board.getPiece(position)
        return piece != null && piece.color == this.color
    }

    /**
     * Helper method to check if a position is empty
     */
    protected fun isEmpty(position: Position, board: Board): Boolean {
        return board.getPiece(position) == null
    }

    /**
     * Get all positions in a direction until blocked or edge of board
     */
    protected fun getPositionsInDirection(
        from: Position,
        rowDelta: Int,
        colDelta: Int,
        board: Board
    ): List<Position> {
        val positions = mutableListOf<Position>()
        var currentRow = from.row + rowDelta
        var currentCol = from.col + colDelta

        while (currentRow in 0..5 && currentCol in 0..5) {
            val position = Position(currentRow, currentCol)
            val piece = board.getPiece(position)

            if (piece == null) {
                // Empty cell, can continue
                positions.add(position)
            } else if (piece.color != this.color) {
                // Opponent piece, can capture but can't continue
                positions.add(position)
                break
            } else {
                // Own piece, can't move here or continue
                break
            }

            currentRow += rowDelta
            currentCol += colDelta
        }

        return positions
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is Piece) return false
        return color == other.color && type == other.type
    }

    override fun hashCode(): Int {
        var result = color.hashCode()
        result = 31 * result + type.hashCode()
        return result
    }

    override fun toString(): String = "${color}_${type}"
}
