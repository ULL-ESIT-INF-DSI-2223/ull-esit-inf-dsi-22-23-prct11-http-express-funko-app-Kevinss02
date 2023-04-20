import fs from 'fs';
export const readNote = (title, cb) => {
    loadNotes((err, data) => {
        if (err) {
            cb(err, undefined);
        }
        else if (data) {
            const notes = JSON.parse(data);
            const foundNote = notes.find((note) => note.title === title);
            const response = {
                type: 'read',
                success: foundNote ? true : false,
                notes: foundNote ? [foundNote] : undefined,
            };
            cb(undefined, response);
        }
    });
};
const loadNotes = (cb) => {
    fs.readFile('public/notes/notes.json', (err, data) => {
        if (err) {
            cb(`Error reading notes file: ${err.message}`, undefined);
        }
        else {
            cb(undefined, data.toString());
        }
    });
};
