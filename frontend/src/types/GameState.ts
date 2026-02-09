import type { Piece, PieceColor } from './Piece';
import type { Position } from './Position';
import type { Move } from './Move';

export type GameStatus = 'ACTIVE' | 'CHECK' | 'CHECKMATE' | 'STALEMATE';

export interface GameState {
  gameId: string;
  board: (Piece | null)[][];
  currentPlayer: PieceColor;
  status: GameStatus;
  lastMove?: Move;
  selectedCell: Position | null;
  validMoves: Position[];
}
