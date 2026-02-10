import type { Piece, PieceColor } from '../types/Piece';
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
 * Check if a move is valid (includes en passant)
 */
export const isValidMove = (from: Position, to: Position, gameState: GameState): boolean => {
  const piece = gameState.board[from.row]?.[from.col];

  if (!piece) return false;
  if (piece.color !== gameState.currentPlayer) return false;

  const validMoves = getLegalMoves(from, gameState);
  return validMoves.some(move => positionEquals(move, to));
};

/**
 * Check if last move was a pawn double move
 */
const isPawnDoubleMove = (lastMove: GameState['lastMove']): boolean => {
  if (!lastMove) return false;
  return Math.abs(lastMove.to.row - lastMove.from.row) === 2;
};

/**
 * Check if a square is attacked by a given color (can any piece of that color move to the square?)
 */
const isSquareAttacked = (
  target: Position,
  board: (Piece | null)[][],
  byColor: PieceColor
): boolean => {
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 6; col++) {
      const p = board[row]?.[col];
      if (p && p.color === byColor) {
        const moves = getPieceValidMoves({ row, col }, p, board);
        if (moves.some((m) => m.row === target.row && m.col === target.col)) return true;
      }
    }
  }
  return false;
};

/**
 * Apply a move to a board copy (including en passant: remove captured pawn)
 */
const applyMoveToBoard = (
  from: Position,
  to: Position,
  piece: Piece,
  board: (Piece | null)[][],
  gameState: GameState
): (Piece | null)[][] => {
  const next = board.map((r) => [...r]);
  next[to.row][to.col] = piece;
  next[from.row][from.col] = null;
  if (piece.type === 'PAWN' && to.col !== from.col && gameState.lastMove && isPawnDoubleMove(gameState.lastMove)) {
    const lastMove = gameState.lastMove!;
    const passedOverRow = Math.floor((lastMove.from.row + lastMove.to.row) / 2);
    if (to.row === passedOverRow && to.col === lastMove.to.col) {
      const capturedRow = piece.color === 'WHITE' ? to.row - 1 : to.row + 1;
      next[capturedRow][to.col] = null;
    }
  }
  return next;
};

/**
 * Find king position of a color on the board
 */
const findKing = (board: (Piece | null)[][], color: PieceColor): Position | null => {
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 6; col++) {
      const p = board[row]?.[col];
      if (p && p.type === 'KING' && p.color === color) return { row, col };
    }
  }
  return null;
};

/**
 * Check if the given board has our king in check
 */
const isKingInCheck = (board: (Piece | null)[][], ourColor: PieceColor): boolean => {
  const kingPos = findKing(board, ourColor);
  if (!kingPos) return false;
  const opponentColor = ourColor === 'WHITE' ? 'BLACK' : 'WHITE';
  return isSquareAttacked(kingPos, board, opponentColor);
};

/**
 * Get all legal moves for a piece (client-side)
 * Filters out moves that would leave the king in check. Server validation is authoritative.
 */
export const getLegalMoves = (position: Position, gameState: GameState): Position[] => {
  const piece = gameState.board[position.row]?.[position.col];

  if (!piece || piece.color !== gameState.currentPlayer) {
    return [];
  }

  let moves = getPieceValidMoves(position, piece, gameState.board);

  if (piece.type === 'PAWN' && gameState.lastMove && isPawnDoubleMove(gameState.lastMove)) {
    const lastMove = gameState.lastMove!;
    const passedOverRow = Math.floor((lastMove.from.row + lastMove.to.row) / 2);
    const ourRowOk = position.row === lastMove.to.row;
    if (ourRowOk && Math.abs(lastMove.to.col - position.col) === 1) {
      moves.push({ row: passedOverRow, col: lastMove.to.col });
    }
  }

  const ourColor = piece.color;
  moves = moves.filter((to) => {
    const boardAfter = applyMoveToBoard(position, to, piece, gameState.board, gameState);
    return !isKingInCheck(boardAfter, ourColor);
  });

  return moves;
};
