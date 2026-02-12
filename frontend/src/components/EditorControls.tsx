import { useState } from 'react';
import type { PieceColor } from '../types/Piece';

interface EditorControlsProps {
  editMode: boolean;
  isCustom: boolean;
  isCreator: boolean;
  onStartEdit: () => void;
  onStopEdit: (currentPlayer: PieceColor) => void;
  onClearBoard: () => void;
  onResetStandard: () => void;
  onResetCustom: () => void;
  onUndo: () => void;
  onClearAnnotations: () => void;
  hasAnnotations: boolean;
}

export function EditorControls({
  editMode,
  isCustom,
  isCreator,
  onStartEdit,
  onStopEdit,
  onClearBoard,
  onResetStandard,
  onResetCustom,
  onUndo,
  onClearAnnotations,
  hasAnnotations,
}: EditorControlsProps) {
  const [nextToMove, setNextToMove] = useState<PieceColor>('WHITE');

  if (!isCreator) return null;

  return (
    <div className="editor-controls">
      <h3 className="editor-controls-title">Position</h3>
      {!editMode && (
        <button type="button" className="btn btn-secondary editor-btn" onClick={onStartEdit}>
          Edit position
        </button>
      )}
      {editMode && (
        <>
          <label className="editor-label">
            Next to move:
            <select
              value={nextToMove}
              onChange={(e) => setNextToMove(e.target.value as PieceColor)}
              className="editor-select"
              aria-label="Next to move"
            >
              <option value="WHITE">White</option>
              <option value="BLACK">Black</option>
            </select>
          </label>
          <button type="button" className="btn btn-primary editor-btn" onClick={() => onStopEdit(nextToMove)}>
            Stop editing
          </button>
          <button type="button" className="btn btn-secondary editor-btn" onClick={onClearBoard}>
            Clear board
          </button>
          <button type="button" className="btn btn-secondary editor-btn" onClick={onResetStandard}>
            Reset to standard
          </button>
        </>
      )}
      {isCustom && !editMode && (
        <>
          <button type="button" className="btn btn-secondary editor-btn" onClick={onResetCustom}>
            Reset to initial position
          </button>
          <button type="button" className="btn btn-secondary editor-btn" onClick={onUndo}>
            Undo move
          </button>
        </>
      )}
      {hasAnnotations && (
        <button type="button" className="btn btn-secondary editor-btn" onClick={onClearAnnotations}>
          Clear annotations
        </button>
      )}
    </div>
  );
}
