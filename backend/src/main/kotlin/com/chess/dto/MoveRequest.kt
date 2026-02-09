package com.chess.dto

import com.chess.domain.PieceType
import com.chess.domain.Position

data class MoveRequest(
    val gameId: String,
    val from: Position,
    val to: Position,
    val promotion: PieceType? = null
)
