export interface Position {
  row: number;
  col: number;
}

export const positionEquals = (a: Position, b: Position): boolean => {
  return a.row === b.row && a.col === b.col;
};

export const positionToString = (pos: Position): string => {
  return `${String.fromCharCode(97 + pos.col)}${pos.row + 1}`;
};
