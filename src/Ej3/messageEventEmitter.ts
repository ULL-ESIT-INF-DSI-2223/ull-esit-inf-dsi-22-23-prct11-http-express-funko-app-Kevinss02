import net from 'net';
import { EventEmitter } from 'events';

export type messageEventEmitterTypeOptions = {
  emitterType: 'client' | 'server';
}

export class MessageEventEmitter extends EventEmitter {
  constructor(public connection: net.Socket, public emitterType?: messageEventEmitterTypeOptions) {
    super();

    let wholeData = '';
    connection.on('data', (dataChunk) => {
      wholeData += dataChunk;

      let messageLimit = wholeData.indexOf('\n');
      while (messageLimit !== -1) {
        const message = wholeData.substring(0, messageLimit);
        wholeData = wholeData.substring(messageLimit + 1);
        if (this.emitterType?.emitterType === 'client') {
          this.emit('response', JSON.parse(message));
        } else if (this.emitterType?.emitterType === 'server') {
          this.emit('request', JSON.parse(message));
        } else {
          this.emit('message', JSON.parse(message));
        }
        messageLimit = wholeData.indexOf('\n');
      }
    });
  }

  public write(type: string, message?: string) {
    this.connection.write(JSON.stringify({ type: type, message: message }) + '\n');
  }
}
