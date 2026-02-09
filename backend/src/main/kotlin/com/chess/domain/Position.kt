package com.chess.domain

/**
 * Represents a position on the chess board.
 * For a 6x6 board: row and col are in range [0..5]
 */
data class Position(
    val row: Int,
    val col: Int
) {
    init {
        require(row in 0..5) { "Row must be in range 0..5" }
        require(col in 0..5) { "Column must be in range 0..5" }
    }

    /**
     * Check if this position is valid on the board
     */
    fun isValid(): Boolean = row in 0..5 && col in 0..5

    /**
     * Get algebraic notation (e.g., "e1", "a6")
     */
    fun toAlgebraic(): String {
        val file = ('a' + col).toString()
        val rank = (row + 1).toString()
        return "$file$rank"
    }

    companion object {
        /**
         * Create Position from algebraic notation (e.g., "e1", "a6")
         */
        fun fromAlgebraic(notation: String): Position {
            require(notation.length == 2) { "Invalid algebraic notation: $notation" }
            val col = notation[0] - 'a'
            val row = notation[1].digitToInt() - 1
            return Position(row, col)
        }
    }
}
