import { useState, type DragEvent } from 'react';
import type { Position } from '../types/Position';

export const useDragAndDrop = () => {
  const [draggedFrom, setDraggedFrom] = useState<Position | null>(null);

  const onDragStart = (e: DragEvent, position: Position) => {
    setDraggedFrom(position);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (e: DragEvent, _position: Position): Position | null => {
    e.preventDefault();
    const from = draggedFrom;
    setDraggedFrom(null);
    return from;
  };

  const onDragEnd = () => {
    setDraggedFrom(null);
  };

  return {
    draggedFrom,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
  };
};
