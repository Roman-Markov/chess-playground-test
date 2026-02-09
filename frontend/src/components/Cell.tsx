import type { Position } from '../types/Position';
import type { Piece as PieceData } from '../types/Piece';
import { Piece } from './Piece';

interface CellProps {
  position: Position;
  piece: PieceData | null;
  isDark: boolean;
  selected: boolean;
  validMove: boolean;
  onClick: () => void;
}

export const Cell = ({ position, piece, isDark, selected, validMove, onClick }: CellProps) => {
  const cellClasses = [
    'chess-cell',
    isDark ? 'dark' : 'light',
    selected ? 'selected' : '',
    validMove ? 'valid-move' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={cellClasses}
      onClick={onClick}
      data-row={position.row}
      data-col={position.col}
    >
      {piece && <Piece piece={piece} />}
      {validMove && !piece && <div className="move-indicator" />}
    </div>
  );
};
