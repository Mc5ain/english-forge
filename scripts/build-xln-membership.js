const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const inputFile = process.argv[2];
const outputFile = path.join(root, 'data/source/xln-membership.tsv');

if (!inputFile) {
  throw new Error('Usage: node scripts/build-xln-membership.js <new-horizon-text.txt>');
}

const posPattern = '(?:n|vt|vi|v|a|ad|adj|adv|prep|conj|pron|num|int)\\s*\\.';
const headwordPattern = new RegExp(
  `^([A-Za-z][A-Za-z'’\\-()]*(?:\\s+[A-Za-z][A-Za-z'’\\-()]*)?)\\s+(?=${posPattern})`,
  'i'
);
const entries = new Map();
let book = 0;
let unit = 0;

for (const rawLine of fs.readFileSync(inputFile, 'utf8').split(/\r?\n/)) {
  const line = rawLine.trim();
  let match = line.match(/^BOOK\s*([1-4])\s*Unit\s*(\d+)/i);
  if (match) {
    book = Number(match[1]);
    unit = Number(match[2]);
    continue;
  }
  match = line.match(/^Unit\s*(\d+)/i);
  if (match) {
    unit = Number(match[1]);
    continue;
  }
  if (!book || !unit) continue;
  match = line.match(headwordPattern);
  if (!match) continue;
  const word = match[1]
    .replace(/\([^)]*\)/g, '')
    .replace(/’/g, "'")
    .trim()
    .toLowerCase();
  if (!word || word.includes(' ')) continue;
  if (!entries.has(word)) {
    entries.set(word, { books: new Set(), units: new Set() });
  }
  const entry = entries.get(word);
  entry.books.add(`xln${book}`);
  entry.units.add(`xln${book}-u${unit}`);
}

const lines = [...entries.entries()]
  .sort(([wordA], [wordB]) => wordA.localeCompare(wordB))
  .map(([word, entry]) => [
    word,
    [...entry.books].sort().join(','),
    [...entry.units].sort().join(',')
  ].join('\t'));

fs.writeFileSync(
  outputFile,
  `# word\tbooks\tunits\n${lines.join('\n')}\n`
);

console.log(`Generated ${path.relative(root, outputFile)}: ${entries.size} headwords`);
