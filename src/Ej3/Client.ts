import {connect} from 'net';
import yargs from 'yargs';
import chalk from 'chalk';
import { hideBin } from 'yargs/helpers';
import { IFunkoData } from './Funko.js';
import {MessageEventEmitter, messageEventEmitterTypeOptions} from './messageEventEmitter.js';

const emitterType: messageEventEmitterTypeOptions = { emitterType: 'client' }
const client = new MessageEventEmitter(connect({port: 60300}), emitterType);



client.on('error', (error) => {
  console.error(chalk.red('Error in client connection:'), error);
});

client.on('response', (response) => {
  if (response.type === 'validConnection') {
    console.log(chalk.green(`Connection established`));
  } else if (response.type === 'add' || 'update' || 'remove' || 'read' || 'list') { 
    const output = JSON.parse(response.message.toString());
    console.log(output.output);
  } else {
    console.error(chalk.red(`Message type ${response.type} is not valid`));
  }
});

const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 add --id [string] --name [string] --desc [string] --type [string] --genre [string] --franchise [string] --franchiseNumber [number] --isExclusive [boolean] --specialFeatures [string] --marketValue [number] --user [string]')
  .example('$0 add --id 123 --name Batman --desc "Batman funko pop" --type POP --genre Superhero --franchise DC --franchiseNumber 1 --isExclusive true --specialfeatures "Glow-in-the-dark" --marketValue 25 --user Juan' , 'Adds a new Funko')
  .strict(true)
  .command({
    command: 'add',
    describe: 'Add a Funko to the list',
    builder: {
        id: {
            describe: 'ID of the Funko',
            demandOption: true,
            type: 'string'
        },
        name: {
            describe: 'Name of the Funko',
            demandOption: true,
            type: 'string'
        },
        desc: {
            describe: 'Description of the Funko',
            demandOption: true,
            type: 'string'
        },
        type: {
            describe: 'Type of the Funko',
            demandOption: true,
            type: 'string'
        },
        genre: {
            describe: 'Genre of the Funko',
            demandOption: true,
            type: 'string'
        },
        franchise: {
            describe: 'Franchise of the Funko',
            demandOption: true,
            type: 'string'
        },
        franchiseNumber: {
            describe: 'Number of the Funko in the franchise',
            demandOption: true,
            type: 'number'
        },
        isExclusive: {
            describe: 'Is the Funko exclusive?',
            demandOption: true,
            type: 'boolean'
        },
        specialFeatures: {
            describe: 'Special features of the Funko',
            demandOption: true,
            type: 'string'
        },
        marketValue: {
            describe: 'Value of the Funko',
            demandOption: true,
            type: 'number'
        },
        user: {
            describe: 'Username of the user',
            demandOption: true,
            type: 'string'
        }
    },
    handler: function(argv) {
        const funkoData: IFunkoData = {
            id: argv.id,
            name: argv.name,
            desc: argv.desc,
            type: argv.type,
            genre: argv.genre,
            franchise: argv.franchise,
            franchiseNumber: argv.franchiseNumber,
            isExclusive: argv.isExclusive,
            specialFeatures: argv.specialFeatures,
            marketValue: argv.marketValue
        };
        client.write("add", JSON.stringify({'user': argv.user, 'funkoData': funkoData}));
    }    
  })
  .command({
    command: 'update',
    describe: 'Modifies a Funko from the list',
    builder: {
        funkoID: {
          describe: 'ID of the Funko to be modified',
          demandOption: true,
          type: 'string'
        },
        id: {
            describe: 'ID of the Funko',
            demandOption: true,
            type: 'string'
        },
        name: {
            describe: 'Name of the Funko',
            demandOption: true,
            type: 'string'
        },
        desc: {
            describe: 'Description of the Funko',
            demandOption: true,
            type: 'string'
        },
        type: {
            describe: 'Type of the Funko',
            demandOption: true,
            type: 'string'
        },
        genre: {
            describe: 'Genre of the Funko',
            demandOption: true,
            type: 'string'
        },
        franchise: {
            describe: 'Franchise of the Funko',
            demandOption: true,
            type: 'string'
        },
        franchiseNumber: {
            describe: 'Number of the Funko in the franchise',
            demandOption: true,
            type: 'number'
        },
        isExclusive: {
            describe: 'Is the Funko exclusive?',
            demandOption: true,
            type: 'boolean'
        },
        specialFeatures: {
            describe: 'Special features of the Funko',
            demandOption: true,
            type: 'string'
        },
        marketValue: {
            describe: 'Value of the Funko',
            demandOption: true,
            type: 'number'
        },
        user: {
            describe: 'Username of the user',
            demandOption: true,
            type: 'string'
        }
    },
    handler: function(argv) {
        const funkoData: IFunkoData = {
            id: argv.id,
            name: argv.name,
            desc: argv.desc,
            type: argv.type,
            genre: argv.genre,
            franchise: argv.franchise,
            franchiseNumber: argv.franchiseNumber,
            isExclusive: argv.isExclusive,
            specialFeatures: argv.specialFeatures,
            marketValue: argv.marketValue
        };
        client.write("update", JSON.stringify({'user': argv.user, 'funkoID': argv.funkoID, 'funkoData': funkoData}));
    }
  })
  .command({
    command: 'remove',
    describe: 'Removes a Funko from the list',
    builder: {
        id: {
            describe: 'ID of the Funko',
            demandOption: true,
            type: 'string'
        },
        user: {
            describe: 'Username of the user',
            demandOption: true,
            type: 'string'
        }
    },
    handler: function(argv) {
      client.write("remove", JSON.stringify({'user': argv.user, 'funkoID': argv.id}))
    }
  })
  .command({
    command: 'read',
    describe: 'Shows selected Funko\'s data',
    builder: {
        id: {
            describe: 'ID of the Funko',
            demandOption: true,
            type: 'string'
        },
        user: {
            describe: 'Username of the user',
            demandOption: true,
            type: 'string'
        }
    },
    handler: function(argv) {
      client.write("read", JSON.stringify({'user': argv.user, 'funkoID': argv.id}));
    }
  })
  .command({
    command: 'list',
    describe: 'Shows all Funko\'s system stored data',
    builder: {
        user: {
            describe: 'Username of the user',
            demandOption: true,
            type: 'string'
        }
    },
    handler: function(argv) {
      client.write("list", JSON.stringify({'user': argv.user}))
    }
  })
  .argv;
