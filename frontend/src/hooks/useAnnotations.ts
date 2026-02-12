import { useState, useEffect, useCallback } from 'react';
import type { Annotation } from '../types/Annotation';
import { useWebSocket } from './useWebSocket';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export function useAnnotations(gameId: string) {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const { subscribe, send } = useWebSocket();

  useEffect(() => {
    if (!gameId) return;
    // Initial fetch
    fetch(`${apiUrl}/api/games/${gameId}/annotations`)
      .then((r) => (r.ok ? r.json() : []))
      .then((list: Annotation[]) => setAnnotations(Array.isArray(list) ? list : []))
      .catch(() => setAnnotations([]));
  }, [gameId]);

  useEffect(() => {
    if (!gameId) return;
    subscribe(`/topic/game/${gameId}/annotations`, (message: any) => {
      if (message.annotation) {
        setAnnotations((prev) => [...prev, message.annotation]);
      } else if (message.position !== undefined || message.from !== undefined) {
        // Annotation removed
        setAnnotations((prev) =>
          prev.filter((a) => {
            if (a.type === 'CIRCLE' && message.position)
              return !(a.to.row === message.position.row && a.to.col === message.position.col);
            if (a.type === 'ARROW' && message.from && message.to)
              return !(
                a.from?.row === message.from.row &&
                a.from?.col === message.from.col &&
                a.to.row === message.to.row &&
                a.to.col === message.to.col
              );
            return true;
          })
        );
      } else if (message.gameId && !message.annotation) {
        // Annotations cleared
        setAnnotations([]);
      }
    });
  }, [gameId, subscribe]);

  const addAnnotation = useCallback(
    async (annotation: Annotation) => {
      const res = await fetch(`${apiUrl}/api/games/${gameId}/annotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: annotation.type,
          from: annotation.from ?? null,
          to: annotation.to,
          color: annotation.color,
        }),
      });
      if (res.ok) setAnnotations((prev) => [...prev, annotation]);
    },
    [gameId]
  );

  const removeAnnotation = useCallback(
    async (position?: { row: number; col: number }, from?: { row: number; col: number }, to?: { row: number; col: number }) => {
      const res = await fetch(`${apiUrl}/api/games/${gameId}/annotations`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position: position ?? null, from: from ?? null, to: to ?? null }),
      });
      if (res.ok) {
        setAnnotations((prev) => {
          if (position) return prev.filter((a) => !(a.type === 'CIRCLE' && a.to.row === position.row && a.to.col === position.col));
          if (from && to) return prev.filter((a) => !(a.type === 'ARROW' && a.from?.row === from.row && a.from?.col === from.col && a.to.row === to.row && a.to.col === to.col));
          return prev;
        });
      }
    },
    [gameId]
  );

  const clearAll = useCallback(async () => {
    const res = await fetch(`${apiUrl}/api/games/${gameId}/annotations/all`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { error?: string }).error || res.statusText);
    }
    setAnnotations([]);
  }, [gameId]);

  return { annotations, addAnnotation, removeAnnotation, clearAll };
}
