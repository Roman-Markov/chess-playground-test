package com.chess.dto

import com.chess.domain.GameStatus
import com.chess.domain.Move
import com.chess.domain.Piece
import com.chess.domain.PieceColor

data class GameStateDto(
    val gameId: String,
    val board: Array<Array<PieceDto?>>,
    val currentPlayer: PieceColor,
    val status: GameStatus,
    val lastMove: Move? = null,
    val mode: String = "STANDARD",  // STANDARD | EDITING | CUSTOM
    val creatorId: String? = null
)

data class PieceDto(
    val color: String,
    val type: String
)
