package com.chess.domain

import com.chess.domain.pieces.*

/**
 * Represents a 6x6 chess board.
 * Row 0 is rank 1 (white's back rank), row 5 is rank 6 (black's back rank).
 * Col 0 is file 'a', col 5 is file 'f'.
 */
class Board {
    private val grid: Array<Array<Piece?>> = Array(6) { arrayOfNulls(6) }

    init {
        setupInitialPosition()
    }

    /**
     * Setup the initial chess position for 6x6 board
     */
    private fun setupInitialPosition() {
        // White pieces (row 0 and 1)
        grid[0][0] = Rook(PieceColor.WHITE)
        grid[0][1] = Knight(PieceColor.WHITE)
        grid[0][2] = Bishop(PieceColor.WHITE)
        grid[0][3] = Queen(PieceColor.WHITE)
        grid[0][4] = King(PieceColor.WHITE)
        grid[0][5] = Rook(PieceColor.WHITE)

        // White pawns
        for (col in 0..5) {
            grid[1][col] = Pawn(PieceColor.WHITE)
        }

        // Black pieces (row 5 and 4)
        grid[5][0] = Rook(PieceColor.BLACK)
        grid[5][1] = Knight(PieceColor.BLACK)
        grid[5][2] = Bishop(PieceColor.BLACK)
        grid[5][3] = Queen(PieceColor.BLACK)
        grid[5][4] = King(PieceColor.BLACK)
        grid[5][5] = Rook(PieceColor.BLACK)

        // Black pawns
        for (col in 0..5) {
            grid[4][col] = Pawn(PieceColor.BLACK)
        }
    }

    /**
     * Get piece at position
     */
    fun getPiece(position: Position): Piece? {
        return grid[position.row][position.col]
    }

    /**
     * Set piece at position
     */
    fun setPiece(position: Position, piece: Piece?) {
        grid[position.row][position.col] = piece
    }

    /**
     * Move piece from one position to another
     */
    fun movePiece(from: Position, to: Position) {
        val piece = getPiece(from)
        setPiece(to, piece)
        setPiece(from, null)
    }

    /**
     * Get all pieces of a specific color
     */
    fun getPieces(color: PieceColor): List<Pair<Position, Piece>> {
        val pieces = mutableListOf<Pair<Position, Piece>>()
        for (row in 0..5) {
            for (col in 0..5) {
                val position = Position(row, col)
                val piece = getPiece(position)
                if (piece != null && piece.color == color) {
                    pieces.add(Pair(position, piece))
                }
            }
        }
        return pieces
    }

    /**
     * Find the king of a specific color
     */
    fun findKing(color: PieceColor): Position? {
        for (row in 0..5) {
            for (col in 0..5) {
                val position = Position(row, col)
                val piece = getPiece(position)
                if (piece != null && piece.type == PieceType.KING && piece.color == color) {
                    return position
                }
            }
        }
        return null
    }

    /**
     * Create a deep copy of the board
     */
    fun copy(): Board {
        val newBoard = Board()
        // Clear the new board first
        for (row in 0..5) {
            for (col in 0..5) {
                newBoard.grid[row][col] = null
            }
        }
        // Copy all pieces
        for (row in 0..5) {
            for (col in 0..5) {
                val piece = this.grid[row][col]
                if (piece != null) {
                    newBoard.grid[row][col] = when (piece.type) {
                        PieceType.KING -> King(piece.color)
                        PieceType.QUEEN -> Queen(piece.color)
                        PieceType.ROOK -> Rook(piece.color)
                        PieceType.BISHOP -> Bishop(piece.color)
                        PieceType.KNIGHT -> Knight(piece.color)
                        PieceType.PAWN -> Pawn(piece.color)
                    }
                }
            }
        }
        return newBoard
    }

    /**
     * Get board as 2D array for serialization
     */
    fun toArray(): Array<Array<Piece?>> {
        return grid.map { it.copyOf() }.toTypedArray()
    }

    override fun toString(): String {
        val sb = StringBuilder()
        for (row in 5 downTo 0) {
            sb.append("${row + 1} ")
            for (col in 0..5) {
                val piece = grid[row][col]
                sb.append(if (piece == null) " . " else " ${piece.type.name[0]} ")
            }
            sb.append("\n")
        }
        sb.append("  ")
        for (col in 0..5) {
            sb.append(" ${('a' + col)} ")
        }
        return sb.toString()
    }
}
