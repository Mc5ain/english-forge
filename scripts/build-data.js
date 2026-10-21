const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const sourceFile = path.join(root, 'data/source/30k-explained.txt');
const outputFile = path.join(root, 'assets/vocabulary.js');
const BASE_WORD_LIMIT = 6000;
const EXAM_SOURCES = {
  junior: { file: 'junior-high.txt', label: '初中' },
  high: { file: 'high-school.txt', label: '高考' },
  cet4: { file: 'cet4.txt', label: '四级' },
  cet6: { file: 'cet6.txt', label: '六级' },
  kaoyan: { file: 'kaoyan.txt', label: '考研' },
  toefl: { file: 'toefl.txt', label: '托福' },
  sat: { file: 'sat.txt', label: 'SAT' }
};

const lines = fs.readFileSync(sourceFile, 'utf8').split(/\r?\n/);
const records = [];
let current = null;

function normalizeSpace(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function cleanPhonetic(value) {
  const groups = String(value || '')
    .replace(/^\/|\/$/g, '')
    .trim()
    .split(/\s{2,}/)
    .map(normalizeSpace)
    .filter(Boolean);
  const unique = [];
  const seen = new Set();
  for (const group of groups) {
    const tokens = group.split(' ').filter(Boolean);
    const cleaned = [...new Set(tokens)].join(' ').replace(/\s*;\s*/g, '; ');
    const key = cleaned.replace(/\s*;\s*/g, ';').replace(/:$/, '').toLowerCase();
    if (key && !seen.has(key)) {
      seen.add(key);
      unique.push(cleaned);
    }
  }
  return unique.join(' · ');
}

function extractPos(meaning) {
  const labels = {
    n: '名词',
    v: '动词',
    vt: '及物动词',
    vi: '不及物动词',
    adj: '形容词',
    adv: '副词',
    prep: '介词',
    pron: '代词',
    conj: '连词',
    art: '冠词',
    num: '数词',
    aux: '助动词',
    int: '感叹词',
    abbr: '缩写',
    det: '限定词',
    modal: '情态动词'
  };
  const found = [];
  for (const match of meaning.matchAll(/(?:^|,)(n|vt|vi|v|adj|adv|prep|pron|conj|art|num|aux|int|abbr|det|modal)\./g)) {
    const label = labels[match[1]];
    if (label && !found.includes(label)) found.push(label);
  }
  return found.slice(0, 3).join(' / ') || '词条';
}

function cleanMeaning(meaning) {
  return normalizeSpace(meaning)
    .replace(/^[\s,;:]+/, '')
    .replace(/,n\. \([^)]*\)人名[^,]*/g, '')
    .replace(/(?:,|；)\[互联网\][^,]*/g, '')
    .replace(/\s+,/g, ',');
}

function shortMeaning(meaning) {
  const chunks = meaning.split(/,(?=(?:n|v|vt|vi|adj|adv|prep|pron|conj|art|num|aux|int|abbr|det|modal)\.)/);
  let summary = chunks.slice(0, 2).join(',');
  if (summary.length <= 105) return summary;
  const clipped = summary.slice(0, 105);
  const boundary = Math.max(clipped.lastIndexOf('；'), clipped.lastIndexOf(','));
  summary = boundary >= 42 ? clipped.slice(0, boundary) : clipped;
  return summary.replace(/[，,；;]\s*$/, '');
}

function parseSenses(meaning) {
  const marker = '(?:modal|prep|pron|conj|abbr|adj|adv|aux|det|art|num|int|vt|vi|n|v)';
  return meaning
    .split(new RegExp(`,(?=${marker}\\.)`))
    .map(chunk => {
      const match = chunk.trim().match(new RegExp(`^(${marker})\\.\\s*(.+)$`));
      return match
        ? { pos: `${match[1]}.`, text: match[2].trim() }
        : { pos: '', text: chunk.trim() };
    })
    .filter(sense => sense.text);
}

function bandForRank(rank) {
  if (rank <= 800) return { key: 'foundation', label: '基础高频', color: '#5eead4' };
  if (rank <= 2000) return { key: 'everyday', label: '日常核心', color: '#60a5fa' };
  if (rank <= 3500) return { key: 'campus', label: '校园进阶', color: '#c084fc' };
  if (rank <= 5000) return { key: 'academic', label: '学术拓展', color: '#fbbf24' };
  return { key: 'advanced', label: '高阶表达', color: '#fb7185' };
}

function loadExamTags() {
  const tags = new Map();
  for (const [key, source] of Object.entries(EXAM_SOURCES)) {
    const file = path.join(root, 'data/source/exam', source.file);
    const entries = fs.readFileSync(file, 'utf8').split(/\r?\n/);
    for (const entry of entries) {
      const word = normalizeSpace(entry.split('\t')[0]).toLowerCase();
      if (!/^[a-z][a-z' .-]*$/.test(word)) continue;
      if (!tags.has(word)) tags.set(word, []);
      const exams = tags.get(word);
      if (!exams.includes(key)) exams.push(key);
    }
  }
  return tags;
}

const examTags = loadExamTags();

for (const rawLine of lines) {
  const line = rawLine.trim();
  if (!current) {
    const match = line.match(/^([A-Za-z][A-Za-z' .-]*)\s+(\d+)$/);
    if (match) {
      current = {
        word: normalizeSpace(match[1]).toLowerCase(),
        rank: Number(match[2]),
        phonetic: '',
        meaning: ''
      };
    }
    continue;
  }
  if (!current.phonetic) {
    current.phonetic = line.trim();
    continue;
  }
  current.meaning = cleanMeaning(line);
  if (current.word && current.meaning) records.push(current);
  current = null;
}

const seen = new Set();
const words = records
  .filter(record => {
    const key = record.word.replace(/\s+/g, ' ').trim().toLowerCase();
    if (!key || seen.has(key) || !record.meaning) return false;
    seen.add(key);
    return true;
  })
  .filter(record => record.rank <= BASE_WORD_LIMIT || examTags.has(record.word))
  .map((record, index) => {
    const band = bandForRank(record.rank);
    const short = shortMeaning(record.meaning);
    const shortSenses = parseSenses(short).slice(0, 2);
    return {
      id: `w${String(index + 1).padStart(4, '0')}`,
      word: record.word,
      phonetic: cleanPhonetic(record.phonetic),
      meaning: record.meaning,
      shortSenses,
      pos: extractPos(record.meaning),
      rank: record.rank,
      band: band.key,
      bandLabel: band.label,
      bandColor: band.color,
      exams: examTags.get(record.word) || []
    };
  });

if (words.length < 10000) {
  throw new Error(`词库生成不足：仅解析出 ${words.length} 个词条`);
}
for (const key of Object.keys(EXAM_SOURCES)) {
  if (!words.some(word => word.exams.includes(key))) {
    throw new Error(`考试分类缺少词条：${key}`);
  }
}

const payload = {
  version: '1.0.0',
  source: {
    name: 'high-frequency-vocabulary',
    repository: 'https://github.com/arstgit/high-frequency-vocabulary',
    license: 'MIT',
    rankSource: 'Peter Norvig / Google Web Trillion Word Corpus',
    exams: {
      repository: 'https://github.com/KyleBing/english-vocabulary',
      license: 'BSD-3-Clause'
    }
  },
  exams: Object.fromEntries(
    Object.entries(EXAM_SOURCES).map(([key, value]) => [key, value.label])
  ),
  bands: {
    foundation: { label: '基础高频', range: '1–800', color: '#5eead4' },
    everyday: { label: '日常核心', range: '801–2000', color: '#60a5fa' },
    campus: { label: '校园进阶', range: '2001–3500', color: '#c084fc' },
    academic: { label: '学术拓展', range: '3501–5000', color: '#fbbf24' },
    advanced: { label: '高阶表达', range: '5001+', color: '#fb7185' }
  },
  words
};

fs.writeFileSync(
  outputFile,
  `window.ENGLISH_VOCAB = ${JSON.stringify(payload)};\n`
);

console.log(`Generated ${path.relative(root, outputFile)}: ${words.length} words`);
