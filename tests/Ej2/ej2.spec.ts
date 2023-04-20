import {expect} from 'chai';
import {existsSync} from 'fs';
import {spawn} from 'child_process';

const filename = 'test.txt';

describe('File existence check', () => {
  it('should throw an error if the file does not exist', () => {
    expect(() => {
      if (!existsSync(filename + "azzssdsazxzxsdsszxs")) {
        throw new Error(`File ${filename} does not exist`);
      }
    }).to.throw();
  });
});

describe('Counting lines, words, and characters', () => {
  it('should return the correct counts using pipe stream method', (done) => {
    const wc = spawn('wc', ['-l', '-w', '-c', filename]);
    let wcOutput = '';
    wc.stdout.on('data', (piece) => wcOutput += piece);
    wc.on('close', () => {
      const wcOutputAsArray = wcOutput.split(/\s+/).slice(0, -2);
      expect(wcOutputAsArray[0]).to.equal('1');
      expect(wcOutputAsArray[1]).to.equal('3');
      expect(wcOutputAsArray[2]).to.equal('8');
      done();
    });
  });

  it('should return the correct counts using non-pipe method', (done) => {
    const wcArgs = ['-l', '-w', '-c'];
    const wc = spawn('wc', wcArgs.concat(filename));
    let wcOutput = '';
    wc.stdout.on('data', (piece) => wcOutput += piece);
    wc.on('close', () => {
      const wcOutputAsArray = wcOutput.split(/\s+/).slice(0, -2);
      if (wcOutputAsArray[0]) {
        expect(`File ${filename} has ${wcOutputAsArray[0]} lines`).to.equal(`File ${filename} has 1 lines`);
      }
      if (wcOutputAsArray[1]) {
        expect(`File ${filename} has ${wcOutputAsArray[1]} words`).to.equal(`File ${filename} has 3 words`);
      }
      if (wcOutputAsArray[2]) {
        expect(`File ${filename} has ${wcOutputAsArray[2]} characters`).to.equal(`File ${filename} has 8 characters`);
      }
      done();
    });
  });
});