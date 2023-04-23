import fs from 'fs';
export const readCommand = (title, cb) => {
    loadCommand((err, data) => {
        if (err) {
            cb(err, undefined);
        }
        else if (data) {
            const foundCommand = JSON.parse(data);
            const response = {
                type: 'read',
                success: foundCommand ? true : false,
                command: foundCommand ? foundCommand : undefined,
            };
            cb(undefined, response);
        }
    });
};
const loadCommand = (cb) => {
    fs.readFile('public/execmd/commands.json', (err, data) => {
        if (err) {
            cb(`Error reading commands file: ${err.message}`, undefined);
        }
        else {
            cb(undefined, data.toString());
        }
    });
};
