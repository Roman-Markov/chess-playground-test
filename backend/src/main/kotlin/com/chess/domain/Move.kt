package com.chess.domain

/**
 * Represents a chess move
 */
data class Move(
    val from: Position,
    val to: Position,
    val piece: Piece,
    val capturedPiece: Piece? = null,
    val promotion: PieceType? = null,
    val isCastling: Boolean = false,
    val isEnPassant: Boolean = false
) {
    /**
     * Check if this move is a pawn double move (moved 2 squares forward)
     */
    fun isPawnDoubleMove(): Boolean {
        return piece.type == PieceType.PAWN && 
               Math.abs(to.row - from.row) == 2
    }

    /**
     * Check if this move is a capture
     */
    fun isCapture(): Boolean {
        return capturedPiece != null || isEnPassant
    }

    /**
     * Get algebraic notation for this move
     */
    fun toAlgebraic(): String {
        val sb = StringBuilder()
        
        when {
            isCastling -> {
                // Castling: O-O (kingside) or O-O-O (queenside)
                sb.append(if (to.col > from.col) "O-O" else "O-O-O")
            }
            piece.type == PieceType.PAWN -> {
                // Pawn moves: e4 or exd5 (if capture)
                if (isCapture()) {
                    sb.append(from.toAlgebraic()[0])
                    sb.append('x')
                }
                sb.append(to.toAlgebraic())
                if (promotion != null) {
                    sb.append('=')
                    sb.append(promotion.name[0])
                }
            }
            else -> {
                // Other pieces: Nf3 or Nxf3 (if capture)
                sb.append(piece.type.name[0])
                if (isCapture()) {
                    sb.append('x')
                }
                sb.append(to.toAlgebraic())
            }
        }
        
        return sb.toString()
    }

    override fun toString(): String = "${from.toAlgebraic()}-${to.toAlgebraic()}"
}
