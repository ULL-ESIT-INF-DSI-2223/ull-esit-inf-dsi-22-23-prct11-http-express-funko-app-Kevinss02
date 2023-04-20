import express from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readNote } from './notes.js';

const app = express();

const __dirname = join(dirname(fileURLToPath(import.meta.url)), '../public');
app.use(express.static(__dirname));

app.get('/notes', (req, res) => {
  if (!req.query.title) {
    res.send({
      error: 'A title has to be provided',
    });
  } else {
    readNote(req.query.title as string, (err, data) => {
      if (err) {
        res.send({
          error: err,
        });
      } else if (!data!.success) {
        res.send({
          error: `No note was found`,
        });
      } else {
        res.send({
          notes: data!.notes,
        });
      }
    });
  }
});

app.listen(3000, () => {
  console.log('Server is up on port 3000');
});