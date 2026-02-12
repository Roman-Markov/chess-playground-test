import type { GameState } from '../types/GameState';
import { type Position, positionEquals } from '../types/Position';
import { Cell } from './Cell';
import '../styles/Board.css';

interface BoardProps {
  gameState: GameState;
  onCellClick: (position: Position) => void;
  editMode?: boolean;
  selectedCellOnBoard?: Position | null;
  onCellDoubleClick?: (position: Position) => void;
  onContextMenu?: (e: React.MouseEvent, position: Position) => void;
  onRightMouseUp?: (position: Position) => void;
  onMouseMove?: (position: Position) => void;
}

export const Board = ({
  gameState,
  onCellClick,
  editMode = false,
  selectedCellOnBoard = null,
  onCellDoubleClick,
  onContextMenu,
  onRightMouseUp,
  onMouseMove,
}: BoardProps) => {
  const { board, selectedCell, validMoves } = gameState;

  const isValidMove = (position: Position): boolean => {
    return validMoves.some((move) => positionEquals(move, position));
  };

  const isSelected = (position: Position): boolean => {
    return selectedCell !== null && positionEquals(selectedCell, position);
  };

  const isSelectedForMove = (position: Position): boolean => {
    return editMode && selectedCellOnBoard !== null && positionEquals(selectedCellOnBoard, position);
  };

  const files = ['a', 'b', 'c', 'd', 'e', 'f'];
  const rowsFromTop = [5, 4, 3, 2, 1, 0];

  return (
    <div className="chess-board-wrapper">
      <div className="chess-board">
        {rowsFromTop.map((row) => (
          <div key={row} className="board-row">
            <span className="board-rank" aria-hidden>
              {row + 1}
            </span>
            {[0, 1, 2, 3, 4, 5].map((col) => {
              const position: Position = { row, col };
              const piece = board[row]?.[col] || null;
              const isDark = (row + col) % 2 === 1;

              return (
                <Cell
                  key={`${row}-${col}`}
                  position={position}
                  piece={piece}
                  isDark={isDark}
                  selected={isSelected(position)}
                  selectedForMove={isSelectedForMove(position)}
                  validMove={isValidMove(position)}
                  onClick={() => onCellClick(position)}
                  onDoubleClick={onCellDoubleClick ? () => onCellDoubleClick(position) : undefined}
                  onContextMenu={onContextMenu ? (e) => onContextMenu(e, position) : undefined}
                  onMouseUp={onRightMouseUp ? (e) => e.button === 2 && onRightMouseUp(position) : undefined}
                  onMouseMove={onMouseMove}
                />
              );
            })}
          </div>
        ))}
        <div className="board-files">
          <span className="board-file-spacer" aria-hidden />
          {files.map((f, col) => (
            <span key={col} className="board-file" aria-hidden>
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
