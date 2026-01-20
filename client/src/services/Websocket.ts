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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(event: string, callback: (...args: any[]) => void) {
    this.connection.on(event, callback);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emit(event: string, ...args: any[]) {
    this.connection.emit(event, ...args);
  }
}
