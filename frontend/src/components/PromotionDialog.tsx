import { createPortal } from 'react-dom';
import type { CSSProperties } from 'react';
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

const overlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 2147483647,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(0,0,0,0.65)',
  pointerEvents: 'auto',
};

const dialogStyle: CSSProperties = {
  background: 'white',
  padding: '24px',
  borderRadius: '12px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  textAlign: 'center',
};

export const PromotionDialog = ({ onChoose }: PromotionDialogProps) => {
  const content = (
    <div
      className="promotion-overlay"
      role="dialog"
      aria-label="Choose piece for promotion"
      style={overlayStyle}
    >
      <div className="promotion-dialog" style={dialogStyle}>
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

  const portalTarget = typeof document !== 'undefined' ? document.getElementById('promotion-portal-root') ?? document.body : null;
  if (portalTarget) {
    return createPortal(content, portalTarget);
  }
  return content;
};
