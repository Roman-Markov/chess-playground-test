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
    private val annotations = ConcurrentHashMap<String, MutableList<com.chess.domain.Annotation>>()

    fun createGame(creatorId: String? = null): Game {
        val game = Game(creatorId = creatorId)
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
        
        // Reject moves if game is in editing mode
        if (game.mode == GameMode.EDITING) {
            return MoveResult.InvalidMove("Game is in editing mode")
        }
        
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

    // ========== Editing Mode Functions ==========

    /**
     * Start editing mode (creator only)
     */
    fun startEditing(gameId: String, creatorId: String): EditResult {
        val game = getGame(gameId) ?: return EditResult.GameNotFound
        
        if (game.creatorId != null && game.creatorId != creatorId) {
            return EditResult.NotAuthorized
        }
        
        val updatedGame = game.copy(
            mode = GameMode.EDITING,
            creatorId = game.creatorId ?: creatorId,
            moveHistory = emptyList()  // Clear history when entering edit mode
        )
        games[gameId] = updatedGame
        
        return EditResult.Success(updatedGame)
    }

    /**
     * Stop editing and save the current position
     */
    fun stopEditing(gameId: String, currentPlayer: PieceColor): EditResult {
        val game = getGame(gameId) ?: return EditResult.GameNotFound
        
        if (game.mode != GameMode.EDITING) {
            return EditResult.InvalidOperation("Game is not in editing mode")
        }
        
        val updatedGame = game.copy(
            mode = GameMode.CUSTOM,
            customStartPosition = game.board.copy(),  // Save current position
            currentPlayer = currentPlayer,
            status = checkDetector.getGameStatus(game.copy(currentPlayer = currentPlayer))
        )
        games[gameId] = updatedGame
        
        return EditResult.Success(updatedGame)
    }

    /**
     * Add a piece to the board (editing mode only)
     */
    fun addPiece(gameId: String, piece: Piece, position: Position): EditResult {
        val game = getGame(gameId) ?: return EditResult.GameNotFound
        
        if (game.mode != GameMode.EDITING) {
            return EditResult.InvalidOperation("Can only add pieces in editing mode")
        }
        
        val newBoard = game.board.copy()
        newBoard.setPiece(position, piece)
        
        val updatedGame = game.copy(board = newBoard)
        games[gameId] = updatedGame
        
        return EditResult.Success(updatedGame)
    }

    /**
     * Remove a piece from the board (editing mode only)
     */
    fun removePiece(gameId: String, position: Position): EditResult {
        val game = getGame(gameId) ?: return EditResult.GameNotFound
        
        if (game.mode != GameMode.EDITING) {
            return EditResult.InvalidOperation("Can only remove pieces in editing mode")
        }
        
        val newBoard = game.board.copy()
        newBoard.setPiece(position, null)
        
        val updatedGame = game.copy(board = newBoard)
        games[gameId] = updatedGame
        
        return EditResult.Success(updatedGame)
    }

    /**
     * Move a piece on the board without validation (editing mode only)
     * If target square has a piece, swap them
     */
    fun movePieceEditor(gameId: String, from: Position, to: Position): EditResult {
        val game = getGame(gameId) ?: return EditResult.GameNotFound
        
        if (game.mode != GameMode.EDITING) {
            return EditResult.InvalidOperation("Can only move pieces in editing mode")
        }
        
        val newBoard = game.board.copy()
        val pieceFrom = newBoard.getPiece(from)
        val pieceTo = newBoard.getPiece(to)
        
        if (pieceFrom == null) {
            return EditResult.InvalidOperation("No piece at source position")
        }
        
        // Swap pieces if target is occupied, otherwise move
        newBoard.setPiece(to, pieceFrom)
        newBoard.setPiece(from, pieceTo)
        
        val updatedGame = game.copy(board = newBoard)
        games[gameId] = updatedGame
        
        return EditResult.Success(updatedGame)
    }

    /**
     * Clear all pieces from the board (editing mode only)
     */
    fun clearBoard(gameId: String): EditResult {
        val game = getGame(gameId) ?: return EditResult.GameNotFound
        
        if (game.mode != GameMode.EDITING) {
            return EditResult.InvalidOperation("Can only clear board in editing mode")
        }
        
        val updatedGame = game.copy(board = Board.empty())
        games[gameId] = updatedGame
        
        return EditResult.Success(updatedGame)
    }

    /**
     * Reset to standard starting position
     */
    fun resetToStandard(gameId: String): EditResult {
        val game = getGame(gameId) ?: return EditResult.GameNotFound
        
        if (game.mode != GameMode.EDITING) {
            return EditResult.InvalidOperation("Can only reset in editing mode")
        }
        
        val updatedGame = game.copy(
            board = Board(),  // Standard starting position
            currentPlayer = PieceColor.WHITE,
            status = GameStatus.ACTIVE
        )
        games[gameId] = updatedGame
        
        return EditResult.Success(updatedGame)
    }

    /**
     * Reset to custom starting position (saved after editing)
     */
    fun resetToCustom(gameId: String): EditResult {
        val game = getGame(gameId) ?: return EditResult.GameNotFound
        
        if (game.mode != GameMode.CUSTOM) {
            return EditResult.InvalidOperation("Game is not in custom mode")
        }
        
        val customBoard = game.customStartPosition ?: return EditResult.InvalidOperation("No custom position saved")
        
        val updatedGame = game.copy(
            board = customBoard.copy(),
            currentPlayer = PieceColor.WHITE,
            status = GameStatus.ACTIVE,
            moveHistory = emptyList()
        )
        games[gameId] = updatedGame
        
        return EditResult.Success(updatedGame)
    }

    /**
     * Undo the last move (custom games only)
     */
    fun undoMove(gameId: String, creatorId: String): EditResult {
        val game = getGame(gameId) ?: return EditResult.GameNotFound
        
        if (game.creatorId != creatorId) {
            return EditResult.NotAuthorized
        }
        
        if (game.mode != GameMode.CUSTOM) {
            return EditResult.InvalidOperation("Undo only available in custom games")
        }
        
        if (game.moveHistory.isEmpty()) {
            return EditResult.InvalidOperation("No moves to undo")
        }
        
        // Rebuild game state by replaying all moves except the last one
        val customStart = game.customStartPosition ?: return EditResult.InvalidOperation("No custom start position")
        
        var rebuiltGame = game.copy(
            board = customStart.copy(),
            currentPlayer = PieceColor.WHITE,
            status = GameStatus.ACTIVE,
            moveHistory = emptyList(),
            whiteKingMoved = false,
            blackKingMoved = false,
            whiteKingsideRookMoved = false,
            whiteQueensideRookMoved = false,
            blackKingsideRookMoved = false,
            blackQueensideRookMoved = false
        )
        
        val movesToReplay = game.moveHistory.dropLast(1)
        for (move in movesToReplay) {
            val newStatus = checkDetector.getGameStatus(rebuiltGame.afterMove(move))
            rebuiltGame = rebuiltGame.afterMove(move, newStatus)
        }
        
        games[gameId] = rebuiltGame
        
        return EditResult.Success(rebuiltGame)
    }

    // ========== Annotation Functions (in-memory only) ==========

    /**
     * Add an annotation (arrow or circle)
     */
    fun addAnnotation(gameId: String, annotation: com.chess.domain.Annotation): Boolean {
        if (!games.containsKey(gameId)) return false
        
        annotations.getOrPut(gameId) { mutableListOf() }.add(annotation)
        return true
    }

    /**
     * Remove an annotation
     */
    fun removeAnnotation(gameId: String, position: Position? = null, fromPos: Position? = null, toPos: Position? = null): Boolean {
        val gameAnnotations = annotations[gameId] ?: return false
        
        gameAnnotations.removeIf { ann ->
            when {
                ann.type == AnnotationType.CIRCLE && position != null -> ann.to == position
                ann.type == AnnotationType.ARROW && fromPos != null && toPos != null -> 
                    ann.from == fromPos && ann.to == toPos
                else -> false
            }
        }
        
        return true
    }

    /**
     * Clear all annotations for a game
     */
    fun clearAllAnnotations(gameId: String): Boolean {
        annotations[gameId]?.clear()
        return true
    }

    /**
     * Get all annotations for a game
     */
    fun getAnnotations(gameId: String): List<com.chess.domain.Annotation> {
        return annotations[gameId]?.toList() ?: emptyList()
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

/**
 * Result of an edit operation
 */
sealed class EditResult {
    data class Success(val game: Game) : EditResult()
    data class InvalidOperation(val reason: String) : EditResult()
    object GameNotFound : EditResult()
    object NotAuthorized : EditResult()
}
