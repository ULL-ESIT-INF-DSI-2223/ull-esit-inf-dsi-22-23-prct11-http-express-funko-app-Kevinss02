import {existsSync} from 'fs'; 
import yargs from 'yargs';
import chalk from "chalk"
import { spawn } from 'child_process';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv))
  .usage(chalk.blue('Usage: $0 [options] filename'))
  .example(chalk.green('$0 -lwc file.txt'), 'Count lines, words and characters in file.txt')
  .options({
    l: { type: 'boolean', describe: 'Count number of lines' },
    w: { type: 'boolean', describe: 'Count number of words' },
    c: { type: 'boolean', describe: 'Count number of characters' },
    p: { type: 'boolean', describe: 'Using pipe Stream Method'},
  })
  .demandCommand(1, chalk.red('Filename is required'))
  .parseSync()

const filename = argv._[0].toString();
const countLines = argv.l;
const countWords = argv.w;
const countChars = argv.c;
const pipeMethod = argv.p;

if (filename) {
  if (!existsSync(filename)) {
    console.error(chalk.red(`File ${filename} does not exist`));
    process.exit(1);
  }
}

const wcArgs = [];
if (countLines) wcArgs.push('-l');
if (countWords) wcArgs.push('-w');
if (countChars) wcArgs.push('-c');

if (wcArgs.length === 0) {
  console.error(chalk.red('Please specify at least one of this option (-l, -w, -c)'));
  process.exit(1);
}

const wc = spawn('wc', wcArgs.concat(filename));

if (pipeMethod) { 
  wc.stdout.pipe(process.stdout); 
} else {
  let wcOutput = '';
  wc.stdout.on('data', (piece) => wcOutput += piece);
  wc.on('close', () => {
    let wcOutputAsArray = wcOutput.split(/\s+/).slice(0, -2);
    if (wcOutputAsArray[0]) console.log(`File helloworld.txt has ${wcOutputAsArray[0]} lines`);
    if (wcOutputAsArray[1]) console.log(`File helloworld.txt has ${wcOutputAsArray[1]} words`);
    if (wcOutputAsArray[2]) console.log(`File helloworld.txt has ${wcOutputAsArray[2]} characters`);
  });
}