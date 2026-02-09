import { useState, useEffect } from 'react';
import type { GameState } from '../types/GameState';
import { type Position, positionEquals } from '../types/Position';
import { useWebSocket } from './useWebSocket';

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

  const { connected, subscribe, send } = useWebSocket();

  useEffect(() => {
    if (connected && gameState.gameId) {
      // Subscribe to game updates
      subscribe(`/topic/game/${gameState.gameId}`, (message: any) => {
        if (message.gameState) {
          setGameState(prev => ({
            ...prev,
            board: message.gameState.board,
            currentPlayer: message.gameState.currentPlayer,
            status: message.gameState.status,
            lastMove: message.gameState.lastMove,
            selectedCell: null,
            validMoves: [],
          }));
        }
      });

      // Subscribe to legal moves updates
      subscribe(`/topic/game/${gameState.gameId}/legal-moves`, (message: any) => {
        if (message.legalMoves) {
          setGameState(prev => ({
            ...prev,
            validMoves: message.legalMoves,
          }));
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
        setGameState(prev => ({
          ...prev,
          selectedCell: position,
        }));
        
        // Request legal moves from server
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
      setGameState(prev => ({
        ...prev,
        selectedCell: position,
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
