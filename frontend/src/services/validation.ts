import type { Piece, PieceColor, PieceType } from '../types/Piece';
import { type Position, positionEquals } from '../types/Position';
import type { GameState } from '../types/GameState';

/**
 * Check if a position is valid on the 6x6 board
 */
const isValidPosition = (pos: Position): boolean => {
  return pos.row >= 0 && pos.row < 6 && pos.col >= 0 && pos.col < 6;
};

/**
 * Check if a position is empty
 */
const isEmpty = (pos: Position, board: (Piece | null)[][]): boolean => {
  return board[pos.row]?.[pos.col] === null;
};

/**
 * Check if a position has an opponent's piece
 */
const isOpponentPiece = (pos: Position, color: PieceColor, board: (Piece | null)[][]): boolean => {
  const piece = board[pos.row]?.[pos.col];
  return piece !== null && piece.color !== color;
};

/**
 * Check if a position has own piece
 */
const isOwnPiece = (pos: Position, color: PieceColor, board: (Piece | null)[][]): boolean => {
  const piece = board[pos.row]?.[pos.col];
  return piece !== null && piece.color === color;
};

/**
 * Get positions in a direction until blocked
 */
const getPositionsInDirection = (
  from: Position,
  rowDelta: number,
  colDelta: number,
  board: (Piece | null)[][],
  color: PieceColor
): Position[] => {
  const positions: Position[] = [];
  let row = from.row + rowDelta;
  let col = from.col + colDelta;

  while (row >= 0 && row < 6 && col >= 0 && col < 6) {
    const pos: Position = { row, col };
    
    if (isEmpty(pos, board)) {
      positions.push(pos);
    } else if (isOpponentPiece(pos, color, board)) {
      positions.push(pos);
      break;
    } else {
      break;
    }

    row += rowDelta;
    col += colDelta;
  }

  return positions;
};

/**
 * Get valid moves for a piece (basic validation, doesn't check for check)
 */
export const getPieceValidMoves = (
  from: Position,
  piece: Piece,
  board: (Piece | null)[][]
): Position[] => {
  const moves: Position[] = [];

  switch (piece.type) {
    case 'KING':
      // King moves one square in any direction
      const kingDirections = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1],
      ];
      for (const [rowDelta, colDelta] of kingDirections) {
        const pos: Position = { row: from.row + rowDelta, col: from.col + colDelta };
        if (isValidPosition(pos) && !isOwnPiece(pos, piece.color, board)) {
          moves.push(pos);
        }
      }
      break;

    case 'QUEEN':
      // Queen moves like rook + bishop
      const queenDirections = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1],
      ];
      for (const [rowDelta, colDelta] of queenDirections) {
        moves.push(...getPositionsInDirection(from, rowDelta, colDelta, board, piece.color));
      }
      break;

    case 'ROOK':
      // Rook moves horizontally and vertically
      const rookDirections = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      for (const [rowDelta, colDelta] of rookDirections) {
        moves.push(...getPositionsInDirection(from, rowDelta, colDelta, board, piece.color));
      }
      break;

    case 'BISHOP':
      // Bishop moves diagonally
      const bishopDirections = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
      for (const [rowDelta, colDelta] of bishopDirections) {
        moves.push(...getPositionsInDirection(from, rowDelta, colDelta, board, piece.color));
      }
      break;

    case 'KNIGHT':
      // Knight moves in L-shape
      const knightMoves = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1],
      ];
      for (const [rowDelta, colDelta] of knightMoves) {
        const pos: Position = { row: from.row + rowDelta, col: from.col + colDelta };
        if (isValidPosition(pos) && !isOwnPiece(pos, piece.color, board)) {
          moves.push(pos);
        }
      }
      break;

    case 'PAWN':
      const direction = piece.color === 'WHITE' ? 1 : -1;
      const startRow = piece.color === 'WHITE' ? 1 : 4;

      // Move forward one square
      const oneAhead: Position = { row: from.row + direction, col: from.col };
      if (isValidPosition(oneAhead) && isEmpty(oneAhead, board)) {
        moves.push(oneAhead);

        // Move forward two squares from starting position
        if (from.row === startRow) {
          const twoAhead: Position = { row: from.row + 2 * direction, col: from.col };
          if (isEmpty(twoAhead, board)) {
            moves.push(twoAhead);
          }
        }
      }

      // Capture diagonally
      for (const colDelta of [-1, 1]) {
        const capturePos: Position = { row: from.row + direction, col: from.col + colDelta };
        if (isValidPosition(capturePos) && isOpponentPiece(capturePos, piece.color, board)) {
          moves.push(capturePos);
        }
      }
      break;
  }

  return moves;
};

/**
 * Check if a move is valid
 */
export const isValidMove = (from: Position, to: Position, gameState: GameState): boolean => {
  const piece = gameState.board[from.row]?.[from.col];
  
  if (!piece) return false;
  if (piece.color !== gameState.currentPlayer) return false;

  const validMoves = getPieceValidMoves(from, piece, gameState.board);
  return validMoves.some(move => positionEquals(move, to));
};

/**
 * Get all legal moves for a piece (client-side approximation)
 * Note: This doesn't check for check/checkmate, server validation is authoritative
 */
export const getLegalMoves = (position: Position, gameState: GameState): Position[] => {
  const piece = gameState.board[position.row]?.[position.col];
  
  if (!piece || piece.color !== gameState.currentPlayer) {
    return [];
  }

  return getPieceValidMoves(position, piece, gameState.board);
};
