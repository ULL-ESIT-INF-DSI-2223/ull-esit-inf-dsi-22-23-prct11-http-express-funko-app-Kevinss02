import net from 'net';
import chalk from 'chalk';
import { MessageEventEmitter, messageEventEmitterTypeOptions} from './messageEventEmitter.js';
import { FunkoCollectionManager } from './FunkoCollectionManager.js';
import { Funko, FunkoGenre, FunkoType } from './Funko.js';

net.createServer((socket) => {
    const emitterType: messageEventEmitterTypeOptions = { emitterType: 'server'}
    const server = new MessageEventEmitter(socket, emitterType);
    console.log(chalk.green('A client has connected.'));

    server.write("validConnection");

    server.on('request', (request) => {
      try {  
        const inputMessage = JSON.parse(request.message.toString());
        const manager = new FunkoCollectionManager(inputMessage.user);
  
        if (request.type === 'add') {
          const newFunko = new Funko("", "", "", FunkoType.POP, FunkoGenre.ANIMATION, "", 0, false, "", 0).parse(inputMessage.funkoData);
          const outputMessage = manager.addFunko(newFunko);
          server.write('add', JSON.stringify({output: outputMessage}));
        } else if (request.type === 'update') {
          const newFunko = new Funko("", "", "", FunkoType.POP, FunkoGenre.ANIMATION, "", 0, false, "", 0).parse(inputMessage.funkoData);
          const outputMessage = manager.modifyFunko(inputMessage.funkoID, newFunko);
          server.write('update', JSON.stringify({output: outputMessage}));
        } else if (request.type === 'read') {
          const outputMessage = manager.showFunko(inputMessage.funkoID);
          server.write('read', JSON.stringify({output: outputMessage}));
        } else if (request.type === 'list') {
          const outputMessage = manager.listFunkos();
          server.write('list', JSON.stringify({output: outputMessage}));
        } else if (request.type === 'remove') {
          const outputMessage = manager.removeFunko(inputMessage.funkoID);
          server.write('remove', JSON.stringify({output: outputMessage}));
        } else {
          console.log(chalk.red(`Invalid request type ${request.type}`));
        }
        server.connection.end();
      } catch (error) {
        console.error(chalk.red(`Invalid JSON message received: ${request.message.toString()}`));
        server.write('error', JSON.stringify({output: chalk.red(`Invalid JSON message sended: ${request.message.toString()}`)}));
        server.connection.end();
      }
    });

    server.connection.on('close', () => {
      console.log(chalk.green('A client has disconnected.'));
    });
  }).listen(60300, () => {
    console.log(chalk.green('Waiting for clients to connect.'));
});

