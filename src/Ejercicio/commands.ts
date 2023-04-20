import fs from 'fs';
import {Command, ResponseType} from './types.js';

export const readCommand = (title: string,
    cb: (err: string | undefined, res: ResponseType | undefined) => void) => {
  loadCommand((err, data) => {
    if (err) {
      cb(err, undefined);
    } else if (data) {
      const foundCommand: Command = JSON.parse(data);
      const response: ResponseType = {
        type: 'read',
        success: foundCommand?true:false,
        command: foundCommand?foundCommand:undefined,
      };
      cb(undefined, response);
    }
  });
};

const loadCommand = (
    cb: (err: string | undefined, data: string | undefined) => void) => {
  fs.readFile('public/execmd/commands.json', (err, data) => {
    if (err) {
      cb(`Error reading commands file: ${err.message}`, undefined);
    } else {
      cb(undefined, data.toString());
    }
  });
};