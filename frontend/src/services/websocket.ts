import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export class WebSocketService {
  private client: Client | null = null;
  private url: string;

  constructor(url: string = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws') {
    this.url = url;
  }

  connect(onConnect: () => void, onError: (error: any) => void): void {
    this.client = new Client({
      webSocketFactory: () => new SockJS(this.url) as any,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('WebSocket connected');
        onConnect();
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        onError(frame);
      },
      onWebSocketError: (error) => {
        console.error('WebSocket error:', error);
        onError(error);
      },
    });

    this.client.activate();
  }

  disconnect(): void {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
  }

  subscribe(destination: string, callback: (message: any) => void): void {
    if (!this.client) {
      throw new Error('WebSocket not connected');
    }

    this.client.subscribe(destination, (message) => {
      const body = JSON.parse(message.body);
      callback(body);
    });
  }

  send(destination: string, body: any): void {
    if (!this.client) {
      throw new Error('WebSocket not connected');
    }

    this.client.publish({
      destination,
      body: JSON.stringify(body),
    });
  }

  isConnected(): boolean {
    return this.client?.connected ?? false;
  }
}

export default WebSocketService;
