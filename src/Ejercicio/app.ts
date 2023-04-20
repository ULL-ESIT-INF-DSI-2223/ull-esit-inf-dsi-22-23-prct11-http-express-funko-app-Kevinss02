import express from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readCommand } from './commands.js';
import {spawn} from 'child_process';
import fs from 'fs';

export const app = express();

const __dirname = join(dirname(fileURLToPath(import.meta.url)), '../public');
app.use(express.static(__dirname));

app.get('/execmd', (req, res) => {
  if (!req.query.cmd) {
    res.status(400).json({
      error: 'A command title has to be provided',
    });
  } else {
      const args = req.query.args?.toString().split(/\s+/);
      const command = spawn(req.query.cmd.toString(), args);
      let commandOutput = '';
      command.stdout.on('data', (piece) => commandOutput += piece);

      // command.stderr.on : a trozos
  
    command.on('close', () => {
        const jsonToWrite = {
          "cmd": req.query.cmd?.toString(),
          "output": commandOutput
        }
        console.log(jsonToWrite);
        fs.writeFile('public/execmd/commands.json', JSON.stringify(jsonToWrite), (err) => {
          if (err) {
            console.error('Something went wrong when writing JSON file');
            res.status(500).json({
              error: err,
            });
          }
      });

      readCommand(req.query.cmd as string, (err, data) => {
        if (err) {
          res.status(500).json({
            error: err,
          });
        } else if (!data!.success) {
          res.status(500).json({
            error: `Not a valid command`,
          });
        } else {
          res.status(200).json({
            output: data!.command,
          });
        }
      });
    });

    command.on("error", (error) => {
      res.status(500).json({ error: error });
    })
  }
});

// Ruta por defecto que devuelve un código de respuesta 404: Siempre al final
app.get('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(3000, () => {
  console.log('Server is up on port 3000');
});