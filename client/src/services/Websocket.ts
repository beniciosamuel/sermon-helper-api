import { Socket, io } from 'socket.io-client';

export class Websocket {
  connection: Socket;

  constructor() {
    this.connection = io('http://localhost:3000');
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
