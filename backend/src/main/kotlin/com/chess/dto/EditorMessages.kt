package com.chess.dto

import com.chess.domain.*

/**
 * Request to start editing mode
 */
data class StartEditingRequest(
    val creatorId: String
)

/**
 * Request to stop editing and start game from position
 */
data class StopEditingRequest(
    val currentPlayer: PieceColor = PieceColor.WHITE
)

/**
 * Request to add a piece to the board
 */
data class AddPieceRequest(
    val piece: PieceDto,
    val position: PositionDto
)

/**
 * Request to remove a piece from the board
 */
data class RemovePieceRequest(
    val position: PositionDto
)

/**
 * Request to move a piece on the board (during editing)
 */
data class MovePieceRequest(
    val from: PositionDto,
    val to: PositionDto
)

/**
 * Request to add annotation
 */
data class AddAnnotationRequest(
    val type: String,  // ARROW | CIRCLE
    val from: PositionDto? = null,
    val to: PositionDto,
    val color: String  // GREEN | RED | BLUE | ORANGE
)

/**
 * Request to remove annotation
 */
data class RemoveAnnotationRequest(
    val position: PositionDto? = null,  // for CIRCLE
    val from: PositionDto? = null,       // for ARROW
    val to: PositionDto? = null          // for ARROW
)

/**
 * DTO for annotation
 */
data class AnnotationDto(
    val type: String,
    val from: PositionDto? = null,
    val to: PositionDto,
    val color: String
) {
    companion object {
        fun fromDomain(annotation: com.chess.domain.Annotation) = AnnotationDto(
            type = annotation.type.name,
            from = annotation.from?.let { PositionDto.fromDomain(it) },
            to = PositionDto.fromDomain(annotation.to),
            color = annotation.color.name
        )
    }
}

fun AnnotationDto.toDomain(): com.chess.domain.Annotation = com.chess.domain.Annotation(
    type = AnnotationType.valueOf(this.type),
    from = this.from?.toDomain(),
    to = this.to.toDomain(),
    color = AnnotationColor.valueOf(this.color)
)

fun AddAnnotationRequest.toDomain(): com.chess.domain.Annotation = com.chess.domain.Annotation(
    type = AnnotationType.valueOf(this.type),
    from = this.from?.toDomain(),
    to = this.to.toDomain(),
    color = AnnotationColor.valueOf(this.color)
)
