package com.chess.domain

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.assertThrows

class PositionTest {

    @Test
    fun `test valid position creation`() {
        val pos = Position(0, 0)
        assertEquals(0, pos.row)
        assertEquals(0, pos.col)
        assertTrue(pos.isValid())
    }
    
    @Test
    fun `test invalid position creation - negative row`() {
        assertThrows<IllegalArgumentException> {
            Position(-1, 0)
        }
    }
    
    @Test
    fun `test invalid position creation - row too large`() {
        assertThrows<IllegalArgumentException> {
            Position(6, 0)
        }
    }
    
    @Test
    fun `test invalid position creation - negative col`() {
        assertThrows<IllegalArgumentException> {
            Position(0, -1)
        }
    }
    
    @Test
    fun `test invalid position creation - col too large`() {
        assertThrows<IllegalArgumentException> {
            Position(0, 6)
        }
    }
    
    @Test
    fun `test algebraic notation conversion`() {
        assertEquals("a1", Position(0, 0).toAlgebraic())
        assertEquals("f6", Position(5, 5).toAlgebraic())
        assertEquals("e4", Position(3, 4).toAlgebraic())
        assertEquals("d2", Position(1, 3).toAlgebraic())
    }
    
    @Test
    fun `test from algebraic notation`() {
        assertEquals(Position(0, 0), Position.fromAlgebraic("a1"))
        assertEquals(Position(5, 5), Position.fromAlgebraic("f6"))
        assertEquals(Position(3, 4), Position.fromAlgebraic("e4"))
        assertEquals(Position(1, 3), Position.fromAlgebraic("d2"))
    }
    
    @Test
    fun `test algebraic notation round trip`() {
        val positions = listOf(
            Position(0, 0),
            Position(5, 5),
            Position(3, 2),
            Position(1, 4)
        )
        
        for (pos in positions) {
            val algebraic = pos.toAlgebraic()
            val converted = Position.fromAlgebraic(algebraic)
            assertEquals(pos, converted)
        }
    }
}
