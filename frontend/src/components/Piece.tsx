import type { Piece as PieceData } from '../types/Piece';
import { getPieceSymbol } from '../utils/pieceSymbols';

interface PieceProps {
  piece: PieceData;
  draggable?: boolean;
}

export const Piece = ({ piece, draggable = true }: PieceProps) => {
  const symbol = getPieceSymbol(piece);

  return (
    <div className={`chess-piece ${piece.color}`} draggable={draggable}>
      {symbol}
    </div>
  );
};
