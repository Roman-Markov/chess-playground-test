import type { Position } from './Position';
import type { PieceType } from './Piece';

export interface Move {
  from: Position;
  to: Position;
  promotion?: PieceType;
}

export interface MoveResult {
  valid: boolean;
  message?: string;
}
