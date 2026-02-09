package com.chess.domain.pieces

import com.chess.domain.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*

class PieceMovementTest {

    @Test
    fun `test king movement`() {
        val board = Board()
        // Clear the board
        for (row in 0..5) {
            for (col in 0..5) {
                board.setPiece(Position(row, col), null)
            }
        }
        
        // Place king in the center
        val kingPos = Position(3, 3)
        board.setPiece(kingPos, King(PieceColor.WHITE))
        
        val validMoves = board.getPiece(kingPos)!!.getValidMoves(kingPos, board)
        
        // King should have 8 possible moves from center
        assertEquals(8, validMoves.size)
    }
    
    @Test
    fun `test rook movement`() {
        val board = Board()
        // Clear the board
        for (row in 0..5) {
            for (col in 0..5) {
                board.setPiece(Position(row, col), null)
            }
        }
        
        // Place rook in the center
        val rookPos = Position(3, 3)
        board.setPiece(rookPos, Rook(PieceColor.WHITE))
        
        val validMoves = board.getPiece(rookPos)!!.getValidMoves(rookPos, board)
        
        // Rook should have 10 possible moves from center (4 + 3 + 2 + 1 = 10 in each direction)
        // Actually: 3 up + 2 down + 3 left + 2 right = 10
        assertEquals(10, validMoves.size)
    }
    
    @Test
    fun `test bishop movement`() {
        val board = Board()
        // Clear the board
        for (row in 0..5) {
            for (col in 0..5) {
                board.setPiece(Position(row, col), null)
            }
        }
        
        // Place bishop in the center
        val bishopPos = Position(3, 3)
        board.setPiece(bishopPos, Bishop(PieceColor.WHITE))
        
        val validMoves = board.getPiece(bishopPos)!!.getValidMoves(bishopPos, board)
        
        // Bishop should have moves on all 4 diagonals
        assertTrue(validMoves.size > 0)
    }
    
    @Test
    fun `test knight movement`() {
        val board = Board()
        // Clear the board
        for (row in 0..5) {
            for (col in 0..5) {
                board.setPiece(Position(row, col), null)
            }
        }
        
        // Place knight in the center
        val knightPos = Position(3, 3)
        board.setPiece(knightPos, Knight(PieceColor.WHITE))
        
        val validMoves = board.getPiece(knightPos)!!.getValidMoves(knightPos, board)
        
        // Knight should have up to 8 L-shaped moves
        assertTrue(validMoves.size <= 8)
        assertTrue(validMoves.size > 0)
    }
    
    @Test
    fun `test queen movement`() {
        val board = Board()
        // Clear the board
        for (row in 0..5) {
            for (col in 0..5) {
                board.setPiece(Position(row, col), null)
            }
        }
        
        // Place queen in the center
        val queenPos = Position(3, 3)
        board.setPiece(queenPos, Queen(PieceColor.WHITE))
        
        val validMoves = board.getPiece(queenPos)!!.getValidMoves(queenPos, board)
        
        // Queen should have moves combining rook and bishop
        assertTrue(validMoves.size > 10)
    }
    
    @Test
    fun `test pawn movement forward`() {
        val board = Board()
        
        // White pawn at starting position
        val pawnPos = Position(1, 4)
        val pawn = board.getPiece(pawnPos) as Pawn
        
        val validMoves = pawn.getValidMoves(pawnPos, board)
        
        // Pawn should be able to move 1 or 2 squares forward from starting position
        assertTrue(validMoves.contains(Position(2, 4)))
        assertTrue(validMoves.contains(Position(3, 4)))
    }
    
    @Test
    fun `test pawn cannot move backward`() {
        val board = Board()
        // Clear the board
        for (row in 0..5) {
            for (col in 0..5) {
                board.setPiece(Position(row, col), null)
            }
        }
        
        // Place white pawn in the middle
        val pawnPos = Position(3, 3)
        val pawn = Pawn(PieceColor.WHITE)
        board.setPiece(pawnPos, pawn)
        
        assertFalse(pawn.canMove(pawnPos, Position(2, 3), board))
        assertFalse(pawn.canMove(pawnPos, Position(1, 3), board))
    }
}
