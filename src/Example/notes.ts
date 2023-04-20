import fs from 'fs';
import {Note, ResponseType} from './types.js';

export const readNote = (title: string,
    cb: (err: string | undefined, res: ResponseType | undefined) => void) => {
  loadNotes((err, data) => {
    if (err) {
      cb(err, undefined);
    } else if (data) {
      const notes: Note[] = JSON.parse(data);
      const foundNote = notes.find((note) => note.title === title);
      const response: ResponseType = {
        type: 'read',
        success: foundNote?true:false,
        notes: foundNote?[foundNote]:undefined,
      };
      cb(undefined, response);
    }
  });
};

const loadNotes = (
    cb: (err: string | undefined, data: string | undefined) => void) => {
  fs.readFile('public/notes/notes.json', (err, data) => {
    if (err) {
      cb(`Error reading notes file: ${err.message}`, undefined);
    } else {
      cb(undefined, data.toString());
    }
  });
};
