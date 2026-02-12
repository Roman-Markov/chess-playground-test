import type { Annotation } from '../types/Annotation';
import type { AnnotationColor } from '../types/Annotation';
import type { Position } from '../types/Position';
import { positionEquals } from '../types/Position';

const OPACITY = 0.6;

/** Length of arrowhead in viewBox units (line ends at base of triangle) */
const ARROWHEAD_LENGTH = 0.48;
/** Half-height of arrowhead triangle (perpendicular to line) */
const ARROWHEAD_HALF = 0.18;

const COLORS_HEX: Record<string, string> = {
  GREEN: '#22c55e',
  RED: '#ef4444',
  BLUE: '#3b82f6',
  ORANGE: '#f97316',
};

function posToCoord(pos: Position): { x: number; y: number } {
  return { x: pos.col + 0.5, y: 5 - pos.row + 0.5 };
}

function ArrowheadPath({
  endX,
  endY,
  tipX,
  tipY,
  color,
}: {
  endX: number;
  endY: number;
  tipX: number;
  tipY: number;
  color: string;
}) {
  const dx = tipX - endX;
  const dy = tipY - endY;
  const len = Math.hypot(dx, dy);
  if (len < 1e-6) return null;
  const perpX = -dy;
  const perpY = dx;
  const h = Math.hypot(perpX, perpY) || 1;
  const p1x = endX + (perpX * ARROWHEAD_HALF) / h;
  const p1y = endY + (perpY * ARROWHEAD_HALF) / h;
  const p2x = endX - (perpX * ARROWHEAD_HALF) / h;
  const p2y = endY - (perpY * ARROWHEAD_HALF) / h;
  return <path d={`M ${tipX} ${tipY} L ${p1x} ${p1y} L ${p2x} ${p2y} Z`} fill={color} />;
}

export interface ArrowPreview {
  from: Position;
  to: Position;
  color: AnnotationColor;
  /** When set, preview arrow tip follows cursor (viewBox 0-6 coords); when null, tip is at to cell center */
  pointerCoord?: { x: number; y: number } | null;
}

interface AnnotationsOverlayProps {
  annotations: Annotation[];
  previewArrow?: ArrowPreview | null;
  className?: string;
}

export function AnnotationsOverlay({ annotations, previewArrow, className = '' }: AnnotationsOverlayProps) {
  const hasPreviewArrow = previewArrow && (previewArrow.pointerCoord != null || !positionEquals(previewArrow.from, previewArrow.to));
  const hasContent = annotations.length > 0 || hasPreviewArrow;

  if (!hasContent) return null;

  return (
    <svg
      className={`annotations-overlay ${className}`}
      viewBox="0 0 6 6"
      preserveAspectRatio="none"
      style={{ width: '100%', height: '100%', display: 'block', opacity: OPACITY }}
    >
      {annotations.map((ann, idx) => {
        const color = COLORS_HEX[ann.color] || COLORS_HEX.GREEN;
        if (ann.type === 'CIRCLE') {
          const { x, y } = posToCoord(ann.to);
          return (
            <circle
              key={idx}
              cx={x}
              cy={y}
              r={0.4}
              fill="none"
              stroke={color}
              strokeWidth={0.14}
            />
          );
        }
        if (ann.type === 'ARROW' && ann.from) {
          const from = posToCoord(ann.from);
          const to = posToCoord(ann.to);
          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          const startShrink = 0.08;
          const endShrink = len > 0 ? ARROWHEAD_LENGTH : 0;
          const endX = to.x - (dx / len) * endShrink;
          const endY = to.y - (dy / len) * endShrink;
          const startX = from.x + (dx / len) * startShrink;
          const startY = from.y + (dy / len) * startShrink;
          return (
            <g key={idx}>
              <line x1={startX} y1={startY} x2={endX} y2={endY} stroke={color} strokeWidth={0.12} />
              <ArrowheadPath endX={endX} endY={endY} tipX={to.x} tipY={to.y} color={color} />
            </g>
          );
        }
        return null;
      })}
      {hasPreviewArrow && (() => {
        const from = posToCoord(previewArrow.from);
        const tip = previewArrow.pointerCoord ?? posToCoord(previewArrow.to);
        const dx = tip.x - from.x;
        const dy = tip.y - from.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const startShrink = 0.08;
        const endShrink = len > 0 ? ARROWHEAD_LENGTH : 0;
        const endX = tip.x - (dx / len) * endShrink;
        const endY = tip.y - (dy / len) * endShrink;
        const startX = from.x + (dx / len) * startShrink;
        const startY = from.y + (dy / len) * startShrink;
        const previewColor = COLORS_HEX[previewArrow.color] ?? COLORS_HEX.GREEN;
        return (
          <g>
            <line x1={startX} y1={startY} x2={endX} y2={endY} stroke={previewColor} strokeWidth={0.12} />
            <ArrowheadPath endX={endX} endY={endY} tipX={tip.x} tipY={tip.y} color={previewColor} />
          </g>
        );
      })()}
    </svg>
  );
}
