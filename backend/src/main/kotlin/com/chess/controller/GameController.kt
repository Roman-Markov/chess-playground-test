package com.chess.controller

import com.chess.domain.PieceType
import com.chess.dto.*
import com.chess.service.GameService
import com.chess.service.MoveResult
import org.springframework.messaging.handler.annotation.MessageMapping
import org.springframework.messaging.handler.annotation.SendTo
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = ["*"])
class GameController(private val gameService: GameService) {

    @GetMapping("/health")
    fun health(): Map<String, String> {
        return mapOf("status" to "ok", "service" to "chess-backend")
    }

    @PostMapping("/games")
    fun createGame(): GameStateDto {
        val game = gameService.createGame()
        return game.toDto()
    }

    @GetMapping("/games/{gameId}")
    fun getGame(@PathVariable gameId: String): GameStateDto? {
        return gameService.getGame(gameId)?.toDto()
    }

    @GetMapping("/games")
    fun getAllGames(): List<GameStateDto> {
        return gameService.getAllGames().map { it.toDto() }
    }
}

@Controller
class WebSocketController(
    private val gameService: GameService,
    private val messagingTemplate: SimpMessagingTemplate
) {

    @MessageMapping("/game/create")
    @SendTo("/topic/game/created")
    fun createGame(message: CreateGameMessage): GameCreatedMessage {
        val game = gameService.createGame()
        return GameCreatedMessage(
            gameId = game.id,
            gameState = game.toDto()
        )
    }

    @MessageMapping("/game/move")
    fun makeMove(message: MakeMoveMessage) {
        val from = message.from.toDomain()
        val to = message.to.toDomain()
        val promotion = message.promotion?.let { PieceType.valueOf(it) }

        val result = gameService.makeMove(message.gameId, from, to, promotion)

        when (result) {
            is MoveResult.Success -> {
                val response = MoveMadeMessage(
                    gameId = message.gameId,
                    move = MoveDto.fromDomain(result.move),
                    gameState = result.game.toDto()
                )
                messagingTemplate.convertAndSend("/topic/game/${message.gameId}", response)
            }
            is MoveResult.InvalidMove -> {
                val response = InvalidMoveMessage(
                    gameId = message.gameId,
                    reason = result.reason
                )
                messagingTemplate.convertAndSend("/topic/game/${message.gameId}/error", response)
            }
            is MoveResult.PromotionRequired -> {
                val response = InvalidMoveMessage(
                    gameId = message.gameId,
                    reason = "Promotion piece required"
                )
                messagingTemplate.convertAndSend("/topic/game/${message.gameId}/error", response)
            }
            is MoveResult.GameNotFound -> {
                val response = ErrorMessage("Game not found")
                messagingTemplate.convertAndSend("/topic/game/${message.gameId}/error", response)
            }
            is MoveResult.GameOver -> {
                val response = ErrorMessage("Game is over")
                messagingTemplate.convertAndSend("/topic/game/${message.gameId}/error", response)
            }
        }
    }

    @MessageMapping("/game/legal-moves")
    fun getLegalMoves(message: GetLegalMovesMessage) {
        val position = message.position.toDomain()
        val legalMoves = gameService.getLegalMoves(message.gameId, position)
        
        val response = LegalMovesMessage(
            gameId = message.gameId,
            position = message.position,
            legalMoves = legalMoves.map { PositionDto.fromDomain(it) }
        )
        messagingTemplate.convertAndSend("/topic/game/${message.gameId}/legal-moves", response)
    }
}
