import type { Position } from '../types/Position';
import type { Piece as PieceData } from '../types/Piece';
import { Piece } from './Piece';

interface CellProps {
  position: Position;
  piece: PieceData | null;
  isDark: boolean;
  selected: boolean;
  validMove: boolean;
  selectedForMove?: boolean;
  onClick: () => void;
  onDoubleClick?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  onMouseUp?: (e: React.MouseEvent) => void;
  onMouseMove?: (position: Position) => void;
}

export const Cell = ({
  position,
  piece,
  isDark,
  selected,
  validMove,
  selectedForMove = false,
  onClick,
  onDoubleClick,
  onContextMenu,
  onMouseUp,
  onMouseMove,
}: CellProps) => {
  const cellClasses = [
    'chess-cell',
    isDark ? 'dark' : 'light',
    selected ? 'selected' : '',
    selectedForMove ? 'selected-for-move' : '',
    validMove ? 'valid-move' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={cellClasses}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      onMouseUp={onMouseUp}
      onMouseMove={() => onMouseMove?.(position)}
      data-row={position.row}
      data-col={position.col}
    >
      {piece && <Piece piece={piece} />}
      {validMove && !piece && <div className="move-indicator" />}
    </div>
  );
};
