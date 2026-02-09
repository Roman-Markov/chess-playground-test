export type PieceColor = 'WHITE' | 'BLACK';

export type PieceType = 'KING' | 'QUEEN' | 'ROOK' | 'BISHOP' | 'KNIGHT' | 'PAWN';

export interface Piece {
  color: PieceColor;
  type: PieceType;
}
