package com.chess.controller

import com.chess.domain.*
import com.chess.domain.pieces.*
import com.chess.dto.*
import com.chess.service.EditResult
import com.chess.service.GameService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/games/{gameId}/edit")
@CrossOrigin(origins = ["*"])
class EditorController(
    private val gameService: GameService,
    private val messagingTemplate: SimpMessagingTemplate
) {

    @PostMapping("/start")
    fun startEditing(
        @PathVariable gameId: String,
        @RequestBody request: StartEditingRequest
    ): ResponseEntity<Any> {
        val result = gameService.startEditing(gameId, request.creatorId)
        
        return when (result) {
            is EditResult.Success -> {
                // Broadcast to all clients
                messagingTemplate.convertAndSend(
                    "/topic/game/$gameId",
                    EditModeStartedMessage(gameId)
                )
                ResponseEntity.ok(result.game.toDto())
            }
            is EditResult.GameNotFound -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(mapOf("error" to "Game not found"))
            is EditResult.NotAuthorized -> ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(mapOf("error" to "Not authorized"))
            is EditResult.InvalidOperation -> ResponseEntity.badRequest()
                .body(mapOf("error" to result.reason))
        }
    }

    @PostMapping("/stop")
    fun stopEditing(
        @PathVariable gameId: String,
        @RequestBody request: StopEditingRequest
    ): ResponseEntity<Any> {
        val result = gameService.stopEditing(gameId, request.currentPlayer)
        
        return when (result) {
            is EditResult.Success -> {
                val message = EditModeEndedMessage(
                    gameId = gameId,
                    gameState = result.game.toDto()
                )
                messagingTemplate.convertAndSend("/topic/game/$gameId", message)
                ResponseEntity.ok(result.game.toDto())
            }
            is EditResult.GameNotFound -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(mapOf("error" to "Game not found"))
            is EditResult.InvalidOperation -> ResponseEntity.badRequest()
                .body(mapOf("error" to result.reason))
            else -> ResponseEntity.badRequest().body(mapOf("error" to "Unknown error"))
        }
    }

    @PostMapping("/pieces")
    fun addPiece(
        @PathVariable gameId: String,
        @RequestBody request: AddPieceRequest
    ): ResponseEntity<Any> {
        val piece = parsePiece(request.piece) ?: return ResponseEntity.badRequest()
            .body(mapOf("error" to "Invalid piece"))
        
        val position = request.position.toDomain()
        val result = gameService.addPiece(gameId, piece, position)
        
        return when (result) {
            is EditResult.Success -> {
                val message = PieceAddedMessage(
                    gameId = gameId,
                    piece = request.piece,
                    position = request.position
                )
                messagingTemplate.convertAndSend("/topic/game/$gameId", message)
                ResponseEntity.ok(result.game.toDto())
            }
            is EditResult.GameNotFound -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(mapOf("error" to "Game not found"))
            is EditResult.InvalidOperation -> ResponseEntity.badRequest()
                .body(mapOf("error" to result.reason))
            else -> ResponseEntity.badRequest().body(mapOf("error" to "Unknown error"))
        }
    }

    @DeleteMapping("/pieces")
    fun removePiece(
        @PathVariable gameId: String,
        @RequestBody request: RemovePieceRequest
    ): ResponseEntity<Any> {
        val position = request.position.toDomain()
        val result = gameService.removePiece(gameId, position)
        
        return when (result) {
            is EditResult.Success -> {
                val message = PieceRemovedMessage(
                    gameId = gameId,
                    position = request.position
                )
                messagingTemplate.convertAndSend("/topic/game/$gameId", message)
                ResponseEntity.ok(result.game.toDto())
            }
            is EditResult.GameNotFound -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(mapOf("error" to "Game not found"))
            is EditResult.InvalidOperation -> ResponseEntity.badRequest()
                .body(mapOf("error" to result.reason))
            else -> ResponseEntity.badRequest().body(mapOf("error" to "Unknown error"))
        }
    }

    @PutMapping("/pieces")
    fun movePiece(
        @PathVariable gameId: String,
        @RequestBody request: MovePieceRequest
    ): ResponseEntity<Any> {
        val from = request.from.toDomain()
        val to = request.to.toDomain()
        val result = gameService.movePieceEditor(gameId, from, to)
        
        return when (result) {
            is EditResult.Success -> {
                val message = PieceMovedEditorMessage(
                    gameId = gameId,
                    from = request.from,
                    to = request.to
                )
                messagingTemplate.convertAndSend("/topic/game/$gameId", message)
                ResponseEntity.ok(result.game.toDto())
            }
            is EditResult.GameNotFound -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(mapOf("error" to "Game not found"))
            is EditResult.InvalidOperation -> ResponseEntity.badRequest()
                .body(mapOf("error" to result.reason))
            else -> ResponseEntity.badRequest().body(mapOf("error" to "Unknown error"))
        }
    }

    @PostMapping("/clear")
    fun clearBoard(@PathVariable gameId: String): ResponseEntity<Any> {
        val result = gameService.clearBoard(gameId)
        
        return when (result) {
            is EditResult.Success -> {
                messagingTemplate.convertAndSend(
                    "/topic/game/$gameId",
                    BoardClearedMessage(gameId)
                )
                ResponseEntity.ok(result.game.toDto())
            }
            is EditResult.GameNotFound -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(mapOf("error" to "Game not found"))
            is EditResult.InvalidOperation -> ResponseEntity.badRequest()
                .body(mapOf("error" to result.reason))
            else -> ResponseEntity.badRequest().body(mapOf("error" to "Unknown error"))
        }
    }

    @PostMapping("/reset-standard")
    fun resetToStandard(@PathVariable gameId: String): ResponseEntity<Any> {
        val result = gameService.resetToStandard(gameId)
        
        return when (result) {
            is EditResult.Success -> {
                val message = BoardResetMessage(
                    gameId = gameId,
                    gameState = result.game.toDto()
                )
                messagingTemplate.convertAndSend("/topic/game/$gameId", message)
                ResponseEntity.ok(result.game.toDto())
            }
            is EditResult.GameNotFound -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(mapOf("error" to "Game not found"))
            is EditResult.InvalidOperation -> ResponseEntity.badRequest()
                .body(mapOf("error" to result.reason))
            else -> ResponseEntity.badRequest().body(mapOf("error" to "Unknown error"))
        }
    }

    @PostMapping("/reset-custom")
    fun resetToCustom(@PathVariable gameId: String): ResponseEntity<Any> {
        val result = gameService.resetToCustom(gameId)
        
        return when (result) {
            is EditResult.Success -> {
                val message = BoardResetMessage(
                    gameId = gameId,
                    gameState = result.game.toDto()
                )
                messagingTemplate.convertAndSend("/topic/game/$gameId", message)
                ResponseEntity.ok(result.game.toDto())
            }
            is EditResult.GameNotFound -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(mapOf("error" to "Game not found"))
            is EditResult.InvalidOperation -> ResponseEntity.badRequest()
                .body(mapOf("error" to result.reason))
            else -> ResponseEntity.badRequest().body(mapOf("error" to "Unknown error"))
        }
    }

    private fun parsePiece(pieceDto: PieceDto): Piece? {
        val color = try {
            PieceColor.valueOf(pieceDto.color)
        } catch (e: IllegalArgumentException) {
            return null
        }
        
        return when (pieceDto.type) {
            "KING" -> King(color)
            "QUEEN" -> Queen(color)
            "ROOK" -> Rook(color)
            "BISHOP" -> Bishop(color)
            "KNIGHT" -> Knight(color)
            "PAWN" -> Pawn(color)
            else -> null
        }
    }
}
