package com.chess.domain

/**
 * Annotation type for board highlights
 */
enum class AnnotationType {
    ARROW,   // Arrow between two squares
    CIRCLE   // Circle on a single square
}

/**
 * Annotation color
 */
enum class AnnotationColor {
    GREEN,
    RED,
    BLUE,
    ORANGE
}

/**
 * Board annotation (arrow or circle) for analysis/training
 * Stored in memory only, not persisted
 */
data class Annotation(
    val type: AnnotationType,
    val from: Position? = null,  // null for CIRCLE
    val to: Position,
    val color: AnnotationColor
)
