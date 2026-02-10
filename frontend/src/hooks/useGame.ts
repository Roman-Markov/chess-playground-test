import { useState, useEffect, useRef } from 'react';
import type { GameState } from '../types/GameState';
import { type Position, positionEquals } from '../types/Position';
import { useWebSocket } from './useWebSocket';
import { getLegalMoves } from '../services/validation';
import type { Piece } from '../types/Piece';

interface UseGameProps {
  gameId?: string;
}

export const useGame = ({ gameId }: UseGameProps = {}) => {
  const [gameState, setGameState] = useState<GameState>({
    gameId: gameId || '',
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

  useEffect(() => {
    if (connected && gameState.gameId) {
      // Subscribe to game updates
      subscribe(`/topic/game/${gameState.gameId}`, (message: any) => {
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
          
          // Update server state reference
          serverStateRef.current = newState;
          pendingMoveRef.current = null; // Clear pending move
          
          setGameState(newState);
        }
      });

      // Subscribe to legal moves updates (fallback, we use client-side now)
      subscribe(`/topic/game/${gameState.gameId}/legal-moves`, (message: any) => {
        if (message.legalMoves) {
          // Only update if we don't have client-calculated moves
          setGameState(prev => {
            if (prev.validMoves.length === 0) {
              return { ...prev, validMoves: message.legalMoves };
            }
            return prev;
          });
        }
      });
    }
  }, [connected, gameState.gameId]);

  const handleCellClick = (position: Position) => {
    const piece = gameState.board[position.row]?.[position.col];

    // If no cell is selected
    if (!gameState.selectedCell) {
      // Select the cell if it has a piece of the current player
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
            gameId: gameState.gameId,
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

    // If clicking a valid move, make the move
    const isValidMove = gameState.validMoves.some(move => 
      positionEquals(move, position)
    );

    if (isValidMove) {
      makeMove(gameState.selectedCell, position);
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
          gameId: gameState.gameId,
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

    // 🚀 OPTIMISTIC UPDATE: Move piece immediately on client
    const newBoard: (Piece | null)[][] = gameState.board.map(row => [...row]);
    const movingPiece = newBoard[from.row][from.col];
    
    if (movingPiece) {
      // Save current state for potential rollback
      serverStateRef.current = gameState;
      pendingMoveRef.current = { from, to };
      
      // Apply move optimistically
      newBoard[to.row][to.col] = movingPiece;
      newBoard[from.row][from.col] = null;
      
      // Update state immediately (instant visual feedback!)
      setGameState(prev => ({
        ...prev,
        board: newBoard,
        selectedCell: null,
        validMoves: [],
        lastMove: { from, to },
      }));
    }

    // Send to server for validation (background)
    send('/app/game/move', {
      gameId: gameState.gameId,
      from: { row: from.row, col: from.col },
      to: { row: to.row, col: to.col },
      promotion,
    });
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
  };
};
