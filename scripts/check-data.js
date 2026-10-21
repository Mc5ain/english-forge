const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { curriculum } = require('../data/curriculum');

const root = path.resolve(__dirname, '..');
const context = { window: {} };
vm.createContext(context);
vm.runInContext(
  fs.readFileSync(path.join(root, 'assets/vocabulary.js'), 'utf8'),
  context
);

const data = context.window.ENGLISH_VOCAB;
const words = data.words;
const errors = [];
  const seen = new Set();

function check(condition, message) {
  if (!condition) errors.push(message);
}

check(words.length >= 10000, `词库应包含基础高频词和考试词，当前仅 ${words.length} 条`);
check(new Set(words.map(word => word.id)).size === words.length, '存在重复词条 ID');
for (const word of words) {
  check(Boolean(word.word && word.meaning && word.pos), `词条字段缺失：${word.id}`);
  check(Boolean(word.phonetic), `音标缺失：${word.word}`);
  const phoneticParts = word.phonetic.split(/\s+/).filter(Boolean);
  check(
    !(phoneticParts.length >= 3 && phoneticParts.every(part => part === phoneticParts[0])),
    `音标重复：${word.word}`
  );
  check(Array.isArray(word.shortSenses) && word.shortSenses.length > 0, `结构化释义缺失：${word.id}`);
  check(
    word.shortSenses.reduce((sum, sense) => sum + sense.text.length, 0) <= word.meaning.length,
    `词条摘要异常：${word.id}`
  );
  check(!seen.has(word.word), `存在重复单词：${word.word}`);
  seen.add(word.word);
  check(Number.isInteger(word.rank) && word.rank > 0, `词频序号异常：${word.word}`);
  check(Array.isArray(word.exams), `考试标签缺失：${word.word}`);
  check(Array.isArray(word.textbooks), `教材标签缺失：${word.word}`);
}
check(words[0].word === 'the', '第一个高频词应为 the');
check(words.every((word, index) => index === 0 || word.rank >= words[index - 1].rank), '词频顺序错误');
for (const exam of ['junior', 'high', 'cet4', 'cet6', 'kaoyan', 'toefl', 'sat']) {
  check(words.some(word => word.exams.includes(exam)), `考试分类为空：${exam}`);
}
for (const textbook of ['xln1', 'xln2', 'xln3', 'xln4']) {
  check(words.some(word => word.textbooks.includes(textbook)), `教材分类为空：${textbook}`);
}
check(curriculum.grammar.length >= 24, '语法课程少于 24 节');
check(curriculum.reading.length >= 10, '分级阅读少于 10 篇');
check(curriculum.listening.length >= 60, '听写/影子跟读句库少于 60 句');
check(curriculum.speaking.length >= 30, '口语训练句库少于 30 句');
check(curriculum.phrases.length >= 80, '高频短语少于 80 个');

for (const lesson of curriculum.grammar) {
  check(Boolean(lesson.id && lesson.title && lesson.summary), `语法课字段缺失：${lesson.id}`);
  check(Array.isArray(lesson.examples) && lesson.examples.length >= 2, `语法例句不足：${lesson.id}`);
  check(Array.isArray(lesson.questions) && lesson.questions.length >= 3, `语法练习不足：${lesson.id}`);
}

for (const article of curriculum.reading) {
  check(Boolean(article.id && article.title && article.text), `阅读文章字段缺失：${article.id}`);
  check(article.paragraphs.length >= 3, `阅读段落不足：${article.id}`);
  check(article.questions.length >= 3, `阅读理解题不足：${article.id}`);
}

if (errors.length) {
  console.error(errors.map(error => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log(
  `Data check passed: ${words.length} words, ${curriculum.grammar.length} grammar lessons, ` +
  `${curriculum.reading.length} reading articles, ${curriculum.listening.length} listening drills, ` +
  `${curriculum.speaking.length} speaking drills.`
);
