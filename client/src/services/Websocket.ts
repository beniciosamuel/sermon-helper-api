import { Socket, io } from 'socket.io-client';
import { secrets } from './Secrets';

export class Websocket {
  connection: Socket;

  private constructor(wsUrl: string) {
    this.connection = io(wsUrl);
  }

  static async getInstance(): Promise<Websocket> {
    const wsUrl = await secrets.getWsUrl();
    return new Websocket(wsUrl);
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
