package com.chess.controller

import com.chess.dto.*
import com.chess.service.EditResult
import com.chess.service.GameService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/games/{gameId}")
@CrossOrigin(origins = ["*"])
class GameActionsController(
    private val gameService: GameService,
    private val messagingTemplate: SimpMessagingTemplate
) {

    @PostMapping("/undo")
    fun undoMove(
        @PathVariable gameId: String,
        @RequestParam creatorId: String
    ): ResponseEntity<Any> {
        val result = gameService.undoMove(gameId, creatorId)
        return when (result) {
            is EditResult.Success -> {
                val message = MoveUndoneMessage(gameId, result.game.toDto())
                messagingTemplate.convertAndSend("/topic/game/$gameId", message)
                ResponseEntity.ok(result.game.toDto())
            }
            is EditResult.GameNotFound -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to "Game not found"))
            is EditResult.NotAuthorized -> ResponseEntity.status(HttpStatus.FORBIDDEN).body(mapOf("error" to "Not authorized"))
            is EditResult.InvalidOperation -> ResponseEntity.badRequest().body(mapOf("error" to result.reason))
        }
    }

    @PostMapping("/annotations")
    fun addAnnotation(
        @PathVariable gameId: String,
        @RequestBody request: AddAnnotationRequest
    ): ResponseEntity<Any> {
        val annotation = request.toDomain()
        val success = gameService.addAnnotation(gameId, annotation)
        return if (success) {
            val message = AnnotationAddedMessage(gameId, AnnotationDto.fromDomain(annotation))
            messagingTemplate.convertAndSend("/topic/game/$gameId/annotations", message)
            ResponseEntity.ok(mapOf("success" to true))
        } else {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to "Game not found"))
        }
    }

    @DeleteMapping("/annotations")
    fun removeAnnotation(
        @PathVariable gameId: String,
        @RequestBody request: RemoveAnnotationRequest
    ): ResponseEntity<Any> {
        val position = request.position?.toDomain()
        val fromPos = request.from?.toDomain()
        val toPos = request.to?.toDomain()
        val success = gameService.removeAnnotation(gameId, position, fromPos, toPos)
        return if (success) {
            val message = AnnotationRemovedMessage(gameId, request.position, request.from, request.to)
            messagingTemplate.convertAndSend("/topic/game/$gameId/annotations", message)
            ResponseEntity.ok(mapOf("success" to true))
        } else {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to "Game not found"))
        }
    }

    @DeleteMapping("/annotations/all")
    fun clearAllAnnotations(@PathVariable gameId: String): ResponseEntity<Any> {
        val success = gameService.clearAllAnnotations(gameId)
        return if (success) {
            messagingTemplate.convertAndSend("/topic/game/$gameId/annotations", AnnotationsClearedMessage(gameId))
            ResponseEntity.ok(mapOf("success" to true))
        } else {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to "Game not found"))
        }
    }

    @GetMapping("/annotations")
    fun getAnnotations(@PathVariable gameId: String): ResponseEntity<List<AnnotationDto>> {
        val annotations = gameService.getAnnotations(gameId)
        return ResponseEntity.ok(annotations.map { AnnotationDto.fromDomain(it) })
    }
}
