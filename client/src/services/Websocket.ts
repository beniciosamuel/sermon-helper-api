import { Socket, io } from 'socket.io-client';

export class Websocket {
  connection: Socket;

  constructor() {
    // Use environment variable for WebSocket URL, fallback to localhost for development
    const wsUrl = process.env.REACT_APP_WS_URL || 'http://localhost:3000';
    this.connection = io(wsUrl);
  }

  static getInstance() {
    return new Websocket();
  }

  async disconnect() {
    this.connection.disconnect();
  }

  on(event: string, callback: (...args: any[]) => void) {
    this.connection.on(event, callback);
  }

  emit(event: string, ...args: any[]) {
    this.connection.emit(event, ...args);
  }
}
