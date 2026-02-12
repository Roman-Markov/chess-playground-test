import { useState, useCallback } from 'react';
import type { GameState } from '../types/GameState';
import type { Piece, PieceColor } from '../types/Piece';
import type { Position } from '../types/Position';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export function useGameEditor(
  gameId: string,
  isCreator: boolean,
  gameState: GameState,
  updateGameState: (state: Partial<GameState>) => void
) {
  const [selectedPieceForPlacement, setSelectedPieceForPlacement] = useState<Piece | null>(null);
  const [selectedCellOnBoard, setSelectedCellOnBoard] = useState<Position | null>(null);

  const editMode = gameState.mode === 'EDITING';
  const isCustom = gameState.mode === 'CUSTOM';

  const fetchAndUpdate = useCallback(
    async (res: Response) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || res.statusText);
      }
      const data = await res.json();
      updateGameState({
        board: data.board,
        currentPlayer: data.currentPlayer,
        status: data.status,
        mode: data.mode,
        creatorId: data.creatorId,
        lastMove: data.lastMove,
        selectedCell: null,
        validMoves: [],
      });
    },
    [updateGameState]
  );

  const startEditing = useCallback(async () => {
    if (!isCreator || !gameId) return;
    const creatorId = gameState.creatorId || 'creator'; // fallback if not set
    const res = await fetch(`${apiUrl}/api/games/${gameId}/edit/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creatorId }),
    });
    await fetchAndUpdate(res);
  }, [gameId, isCreator, gameState.creatorId, fetchAndUpdate]);

  const stopEditing = useCallback(
    async (currentPlayer: PieceColor = 'WHITE') => {
      const res = await fetch(`${apiUrl}/api/games/${gameId}/edit/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPlayer }),
      });
      await fetchAndUpdate(res);
      setSelectedPieceForPlacement(null);
      setSelectedCellOnBoard(null);
    },
    [gameId, fetchAndUpdate]
  );

  const addPiece = useCallback(
    async (piece: Piece, position: Position) => {
      const res = await fetch(`${apiUrl}/api/games/${gameId}/edit/pieces`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          piece: { color: piece.color, type: piece.type },
          position: { row: position.row, col: position.col },
        }),
      });
      await fetchAndUpdate(res);
      setSelectedPieceForPlacement(null);
    },
    [gameId, fetchAndUpdate]
  );

  const removePiece = useCallback(
    async (position: Position) => {
      const res = await fetch(`${apiUrl}/api/games/${gameId}/edit/pieces`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position: { row: position.row, col: position.col } }),
      });
      await fetchAndUpdate(res);
      setSelectedCellOnBoard(null);
    },
    [gameId, fetchAndUpdate]
  );

  const movePieceEditor = useCallback(
    async (from: Position, to: Position) => {
      const res = await fetch(`${apiUrl}/api/games/${gameId}/edit/pieces`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: { row: from.row, col: from.col },
          to: { row: to.row, col: to.col },
        }),
      });
      await fetchAndUpdate(res);
      setSelectedCellOnBoard(null);
    },
    [gameId, fetchAndUpdate]
  );

  const clearBoard = useCallback(async () => {
    const res = await fetch(`${apiUrl}/api/games/${gameId}/edit/clear`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    await fetchAndUpdate(res);
  }, [gameId, fetchAndUpdate]);

  const resetToStandard = useCallback(async () => {
    const res = await fetch(`${apiUrl}/api/games/${gameId}/edit/reset-standard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    await fetchAndUpdate(res);
  }, [gameId, fetchAndUpdate]);

  const resetToCustom = useCallback(async () => {
    const res = await fetch(`${apiUrl}/api/games/${gameId}/edit/reset-custom`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    await fetchAndUpdate(res);
  }, [gameId, fetchAndUpdate]);

  const undoMove = useCallback(async () => {
    const creatorId = gameState.creatorId || 'creator';
    const res = await fetch(
      `${apiUrl}/api/games/${gameId}/undo?creatorId=${encodeURIComponent(creatorId)}`,
      { method: 'POST' }
    );
    await fetchAndUpdate(res);
  }, [gameId, gameState.creatorId, fetchAndUpdate]);

  return {
    editMode,
    isCustom,
    selectedPieceForPlacement,
    setSelectedPieceForPlacement,
    selectedCellOnBoard,
    setSelectedCellOnBoard,
    startEditing,
    stopEditing,
    addPiece,
    removePiece,
    movePieceEditor,
    clearBoard,
    resetToStandard,
    resetToCustom,
    undoMove,
  };
}
