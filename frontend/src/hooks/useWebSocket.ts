import { useEffect, useRef, useState } from 'react';
import WebSocketService from '../services/websocket';

export const useWebSocket = (url?: string) => {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<any>(null);
  const wsService = useRef<WebSocketService | null>(null);

  useEffect(() => {
    wsService.current = new WebSocketService(url);

    wsService.current.connect(
      () => {
        setConnected(true);
        setError(null);
      },
      (err) => {
        setConnected(false);
        setError(err);
      }
    );

    return () => {
      wsService.current?.disconnect();
    };
  }, [url]);

  const subscribe = (destination: string, callback: (message: any) => void) => {
    if (wsService.current) {
      wsService.current.subscribe(destination, callback);
    }
  };

  const send = (destination: string, body: any) => {
    if (wsService.current) {
      wsService.current.send(destination, body);
    }
  };

  return { connected, error, subscribe, send };
};
