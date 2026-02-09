package com.chess.domain

import com.chess.domain.pieces.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*

class BoardTest {

    @Test
    fun `test initial board setup`() {
        val board = Board()
        
        // Check white pieces
        assertNotNull(board.getPiece(Position(0, 0)))
        assertEquals(PieceType.ROOK, board.getPiece(Position(0, 0))?.type)
        assertEquals(PieceColor.WHITE, board.getPiece(Position(0, 0))?.color)
        
        assertNotNull(board.getPiece(Position(0, 4)))
        assertEquals(PieceType.KING, board.getPiece(Position(0, 4))?.type)
        
        // Check black pieces
        assertNotNull(board.getPiece(Position(5, 4)))
        assertEquals(PieceType.KING, board.getPiece(Position(5, 4))?.type)
        assertEquals(PieceColor.BLACK, board.getPiece(Position(5, 4))?.color)
        
        // Check pawns
        for (col in 0..5) {
            assertNotNull(board.getPiece(Position(1, col)))
            assertEquals(PieceType.PAWN, board.getPiece(Position(1, col))?.type)
            assertEquals(PieceColor.WHITE, board.getPiece(Position(1, col))?.color)
            
            assertNotNull(board.getPiece(Position(4, col)))
            assertEquals(PieceType.PAWN, board.getPiece(Position(4, col))?.type)
            assertEquals(PieceColor.BLACK, board.getPiece(Position(4, col))?.color)
        }
        
        // Check empty squares
        for (row in 2..3) {
            for (col in 0..5) {
                assertNull(board.getPiece(Position(row, col)))
            }
        }
    }
    
    @Test
    fun `test find king`() {
        val board = Board()
        
        val whiteKing = board.findKing(PieceColor.WHITE)
        assertNotNull(whiteKing)
        assertEquals(Position(0, 4), whiteKing)
        
        val blackKing = board.findKing(PieceColor.BLACK)
        assertNotNull(blackKing)
        assertEquals(Position(5, 4), blackKing)
    }
    
    @Test
    fun `test move piece`() {
        val board = Board()
        
        // Move white pawn from e2 to e4
        val from = Position(1, 4)
        val to = Position(3, 4)
        
        val piece = board.getPiece(from)
        assertNotNull(piece)
        
        board.movePiece(from, to)
        
        assertNull(board.getPiece(from))
        assertNotNull(board.getPiece(to))
        assertEquals(piece, board.getPiece(to))
    }
    
    @Test
    fun `test board copy`() {
        val board = Board()
        val copy = board.copy()
        
        // Verify all pieces are copied
        for (row in 0..5) {
            for (col in 0..5) {
                val pos = Position(row, col)
                val original = board.getPiece(pos)
                val copied = copy.getPiece(pos)
                
                if (original == null) {
                    assertNull(copied)
                } else {
                    assertNotNull(copied)
                    assertEquals(original.type, copied!!.type)
                    assertEquals(original.color, copied.color)
                }
            }
        }
        
        // Verify it's a deep copy by modifying one
        copy.movePiece(Position(1, 0), Position(2, 0))
        assertNotNull(board.getPiece(Position(1, 0)))
        assertNull(copy.getPiece(Position(1, 0)))
    }
}
