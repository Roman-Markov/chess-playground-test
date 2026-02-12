import type { Piece, PieceColor } from '../types/Piece';
import { getPieceSymbol } from '../utils/pieceSymbols';

const PIECE_TYPES: Piece['type'][] = ['ROOK', 'KNIGHT', 'BISHOP', 'QUEEN', 'KING', 'PAWN'];

interface PiecePaletteProps {
  color: PieceColor;
  selectedPiece: Piece | null;
  onSelectPiece: (piece: Piece) => void;
  position: 'top' | 'bottom';
}

export function PiecePalette({ color, selectedPiece, onSelectPiece, position }: PiecePaletteProps) {
  return (
    <div className={`piece-palette piece-palette-${position}`} role="toolbar" aria-label={`${color} pieces`}>
      {PIECE_TYPES.map((type) => {
        const piece: Piece = { color, type };
        const isSelected =
          selectedPiece?.color === color && selectedPiece?.type === type;
        return (
          <button
            key={type}
            type="button"
            className={`palette-piece palette-piece-${color.toLowerCase()} ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelectPiece(piece)}
            aria-pressed={isSelected}
            aria-label={`Add ${color} ${type.toLowerCase()}`}
          >
            <span className="palette-piece-symbol" aria-hidden>
              {getPieceSymbol(piece)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
