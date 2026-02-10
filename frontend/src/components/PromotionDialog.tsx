import { createPortal } from 'react-dom';
import type { Position } from '../types/Position';
import type { PieceType } from '../types/Piece';

type PromotionPieceType = 'QUEEN' | 'ROOK' | 'BISHOP' | 'KNIGHT';

interface PromotionDialogProps {
  from: Position;
  to: Position;
  onChoose: (pieceType: PieceType) => void;
}

const PROMOTION_PIECES: PromotionPieceType[] = ['QUEEN', 'ROOK', 'BISHOP', 'KNIGHT'];

const LABELS: Record<PromotionPieceType, string> = {
  QUEEN: 'Queen',
  ROOK: 'Rook',
  BISHOP: 'Bishop',
  KNIGHT: 'Knight',
};

export const PromotionDialog = ({ onChoose }: PromotionDialogProps) => {
  const content = (
    <div
      className="promotion-overlay"
      role="dialog"
      aria-label="Choose piece for promotion"
      style={{ position: 'fixed', inset: 0, zIndex: 99999, pointerEvents: 'auto' }}
    >
      <div className="promotion-dialog">
        <h3>Promote pawn to</h3>
        <div className="promotion-choices">
          {PROMOTION_PIECES.map((pieceType) => (
            <button
              key={pieceType}
              type="button"
              className="promotion-btn"
              onClick={() => onChoose(pieceType)}
            >
              {LABELS[pieceType]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
  return createPortal(content, document.body);
};
