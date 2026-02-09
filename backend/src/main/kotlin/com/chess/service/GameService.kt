package com.chess.service

import com.chess.domain.*
import com.chess.domain.pieces.Pawn
import org.springframework.stereotype.Service
import java.util.concurrent.ConcurrentHashMap

@Service
class GameService(
    private val moveValidator: MoveValidator,
    private val checkDetector: CheckDetector
) {
    private val games = ConcurrentHashMap<String, Game>()

    fun createGame(): Game {
        val game = Game()
        games[game.id] = game
        return game
    }

    fun getGame(gameId: String): Game? {
        return games[gameId]
    }

    fun deleteGame(gameId: String) {
        games.remove(gameId)
    }

    fun getAllGames(): List<Game> {
        return games.values.toList()
    }

    /**
     * Execute a move in the game
     */
    fun makeMove(gameId: String, from: Position, to: Position, promotionType: PieceType? = null): MoveResult {
        val game = getGame(gameId) ?: return MoveResult.GameNotFound
        
        if (game.isGameOver()) {
            return MoveResult.GameOver
        }

        // Validate the move
        val validationResult = moveValidator.isValidMove(from, to, game)
        if (!validationResult.isValid()) {
            return MoveResult.InvalidMove((validationResult as ValidationResult.Invalid).reason)
        }

        val piece = game.board.getPiece(from)!!
        val capturedPiece = game.board.getPiece(to)

        // Check for special moves
        var isCastling = false
        var isEnPassant = false
        var promotion = promotionType

        // Check if it's a castling move
        if (piece.type == PieceType.KING && Math.abs(to.col - from.col) == 2) {
            val isKingside = to.col > from.col
            if (moveValidator.canCastle(piece.color, isKingside, game)) {
                isCastling = true
            } else {
                return MoveResult.InvalidMove("Cannot castle")
            }
        }

        // Check if it's an en passant move
        if (piece is Pawn && to.col != from.col && capturedPiece == null) {
            if (moveValidator.canEnPassant(from, to, game)) {
                isEnPassant = true
            } else {
                return MoveResult.InvalidMove("Invalid en passant")
            }
        }

        // Check if pawn should be promoted
        if (piece is Pawn && piece.shouldPromote(to)) {
            if (promotion == null) {
                return MoveResult.PromotionRequired
            }
            if (promotion !in listOf(PieceType.QUEEN, PieceType.ROOK, PieceType.BISHOP, PieceType.KNIGHT)) {
                return MoveResult.InvalidMove("Invalid promotion piece")
            }
        }

        // Create the move
        val move = Move(
            from = from,
            to = to,
            piece = piece,
            capturedPiece = capturedPiece,
            promotion = promotion,
            isCastling = isCastling,
            isEnPassant = isEnPassant
        )

        // Apply the move and update game status
        val newStatus = checkDetector.getGameStatus(game.afterMove(move))
        val updatedGame = game.afterMove(move, newStatus)
        games[gameId] = updatedGame

        return MoveResult.Success(updatedGame, move)
    }

    /**
     * Get all legal moves for a piece
     */
    fun getLegalMoves(gameId: String, position: Position): List<Position> {
        val game = getGame(gameId) ?: return emptyList()
        return moveValidator.getLegalMoves(position, game)
    }
}

/**
 * Result of a move attempt
 */
sealed class MoveResult {
    data class Success(val game: Game, val move: Move) : MoveResult()
    data class InvalidMove(val reason: String) : MoveResult()
    object PromotionRequired : MoveResult()
    object GameNotFound : MoveResult()
    object GameOver : MoveResult()
}
