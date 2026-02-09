import type { Piece } from '../types/Piece';

export const PIECE_SYMBOLS: Record<string, string> = {
  // Используем залитые черные символы для обоих цветов (перекрашиваются через CSS)
  'WHITE-KING': '♚',    // Залитый символ
  'WHITE-QUEEN': '♛',   // Залитый символ
  'WHITE-ROOK': '♜',    // Залитый символ
  'WHITE-BISHOP': '♝',  // Залитый символ
  'WHITE-KNIGHT': '♞',  // Залитый символ
  'WHITE-PAWN': '♟',    // Залитый символ
  'BLACK-KING': '♚',
  'BLACK-QUEEN': '♛',
  'BLACK-ROOK': '♜',
  'BLACK-BISHOP': '♝',
  'BLACK-KNIGHT': '♞',
  'BLACK-PAWN': '♟',
};

export const getPieceSymbol = (piece: Piece): string => {
  const key = `${piece.color}-${piece.type}`;
  return PIECE_SYMBOLS[key] || '';
};
