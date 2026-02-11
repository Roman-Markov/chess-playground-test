import { useState, useEffect, useRef } from 'react';
import type { GameState } from '../types/GameState';
import { type Position, positionEquals } from '../types/Position';
import { useWebSocket } from './useWebSocket';
import { getLegalMoves } from '../services/validation';
import type { Piece, PieceColor } from '../types/Piece';

interface UseGameProps {
  gameId?: string;
  myColor?: PieceColor | null;
}

export const useGame = ({ gameId, myColor = null }: UseGameProps = {}) => {
  const [gameState, setGameState] = useState<GameState>({
    gameId: '',
    board: Array(6).fill(null).map(() => Array(6).fill(null)),
    currentPlayer: 'WHITE',
    status: 'ACTIVE',
    selectedCell: null,
    validMoves: [],
  });

  // Store the last server-confirmed state for rollback
  const serverStateRef = useRef<GameState>(gameState);
  const pendingMoveRef = useRef<{ from: Position; to: Position } | null>(null);

  const { connected, subscribe, send } = useWebSocket();

  const [promotionPending, setPromotionPending] = useState<{ from: Position; to: Position } | null>(null);

  useEffect(() => {
    if (connected && gameId) {
      // Subscribe to game updates (use prop gameId so we subscribe when opening via link)
      subscribe(`/topic/game/${gameId}`, (message: any) => {
        if (message.gameState) {
          const newState = {
            ...gameState,
            board: message.gameState.board,
            currentPlayer: message.gameState.currentPlayer,
            status: message.gameState.status,
            lastMove: message.gameState.lastMove,
            selectedCell: null,
            validMoves: [],
          };
          serverStateRef.current = newState;
          pendingMoveRef.current = null;
          setPromotionPending(null);
          setGameState(newState);
        }
      });

      // Subscribe to errors (e.g. promotion required)
      subscribe(`/topic/game/${gameId}/error`, (message: any) => {
        if (message.reason === 'Promotion piece required' && message.from && message.to) {
          setPromotionPending({
            from: { row: message.from.row, col: message.from.col },
            to: { row: message.to.row, col: message.to.col },
          });
        }
      });

      // Subscribe to legal moves updates (fallback)
      subscribe(`/topic/game/${gameId}/legal-moves`, (message: any) => {
        if (message.legalMoves) {
          setGameState(prev => {
            if (prev.validMoves.length === 0) {
              return { ...prev, validMoves: message.legalMoves };
            }
            return prev;
          });
        }
      });
    }
  }, [connected, gameId]);

  const canMove = myColor === null || gameState.currentPlayer === myColor;

  const handleCellClick = (position: Position) => {
    if (!canMove) return;

    const piece = gameState.board[position.row]?.[position.col];

    // If no cell is selected
    if (!gameState.selectedCell) {
      // Select the cell if it has a piece of the current player (and we're allowed to move it)
      if (piece && piece.color === gameState.currentPlayer) {
        // 🚀 OPTIMISTIC: Calculate legal moves instantly on client
        const legalMoves = getLegalMoves(position, gameState);
        
        setGameState(prev => ({
          ...prev,
          selectedCell: position,
          validMoves: legalMoves, // Instant highlight!
        }));
        
        // Still request from server for verification (background)
        if (connected) {
          send('/app/game/legal-moves', {
            gameId: gameId || gameState.gameId,
            position: { row: position.row, col: position.col },
          });
        }
      }
      return;
    }

    // If clicking the same cell, deselect
    if (positionEquals(gameState.selectedCell, position)) {
      setGameState(prev => ({
        ...prev,
        selectedCell: null,
        validMoves: [],
      }));
      return;
    }

    // If clicking a valid move, make the move (or show promotion dialog)
    const isValidMove = gameState.validMoves.some(move =>
      positionEquals(move, position)
    );

    if (isValidMove) {
      const movingPiece = gameState.board[gameState.selectedCell!.row]?.[gameState.selectedCell!.col];
      const isPromotionMove =
        movingPiece?.type === 'PAWN' &&
        ((movingPiece.color === 'WHITE' && position.row === 5) ||
          (movingPiece.color === 'BLACK' && position.row === 0));

      if (isPromotionMove) {
        setPromotionPending({ from: gameState.selectedCell!, to: position });
        setGameState((prev) => ({ ...prev, selectedCell: null, validMoves: [] }));
        return;
      }
      makeMove(gameState.selectedCell!, position);
    } else if (piece && piece.color === gameState.currentPlayer) {
      // Select a different piece
      // 🚀 OPTIMISTIC: Calculate legal moves instantly
      const legalMoves = getLegalMoves(position, gameState);
      
      setGameState(prev => ({
        ...prev,
        selectedCell: position,
        validMoves: legalMoves, // Instant highlight!
      }));
      
      if (connected) {
        send('/app/game/legal-moves', {
          gameId: gameId || gameState.gameId,
          position: { row: position.row, col: position.col },
        });
      }
    } else {
      // Invalid move or wrong player's piece
      setGameState(prev => ({
        ...prev,
        selectedCell: null,
        validMoves: [],
      }));
    }
  };

  const makeMove = (from: Position, to: Position, promotion?: string) => {
    if (!connected) {
      console.error('WebSocket not connected');
      return;
    }

    const newBoard: (Piece | null)[][] = gameState.board.map(row => [...row]);
    const movingPiece = newBoard[from.row][from.col] ?? newBoard[to.row][to.col];

    if (movingPiece) {
      serverStateRef.current = gameState;
      pendingMoveRef.current = { from, to };

      newBoard[to.row][to.col] = promotion
        ? { color: movingPiece.color, type: promotion as Piece['type'] }
        : movingPiece;
      newBoard[from.row][from.col] = null;

      const wasEnPassant =
        movingPiece.type === 'PAWN' &&
        to.col !== from.col &&
        gameState.board[to.row][to.col] === null &&
        gameState.lastMove &&
        Math.abs(gameState.lastMove.to.row - gameState.lastMove.from.row) === 2;
      if (wasEnPassant) {
        const capturedRow = movingPiece.color === 'WHITE' ? to.row - 1 : to.row + 1;
        newBoard[capturedRow][to.col] = null;
      }

      setGameState(prev => ({
        ...prev,
        board: newBoard,
        currentPlayer: prev.currentPlayer === 'WHITE' ? 'BLACK' : 'WHITE',
        selectedCell: null,
        validMoves: [],
        lastMove: { from, to },
      }));
    }

    send('/app/game/move', {
      gameId: gameId || gameState.gameId,
      from: { row: from.row, col: from.col },
      to: { row: to.row, col: to.col },
      promotion,
    });
  };

  const completePromotion = (pieceType: string) => {
    if (!promotionPending) return;
    makeMove(promotionPending.from, promotionPending.to, pieceType);
    setPromotionPending(null);
  };

  const updateGameState = (newState: Partial<GameState>) => {
    setGameState((prev) => ({
      ...prev,
      ...newState,
    }));
  };

  return {
    gameState,
    connected,
    handleCellClick,
    makeMove,
    updateGameState,
    promotionPending,
    completePromotion,
  };
};
