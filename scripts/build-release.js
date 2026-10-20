const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const releaseDir = path.join(root, 'release');
const outputFile = path.join(releaseDir, 'English-Forge-英语锻造所.html');

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function inlineScript(source) {
  return source.replace(/<\/script/gi, '<\\/script');
}

function replaceOnce(html, search, replacement, label) {
  if (!html.includes(search)) {
    throw new Error(`构建单文件版失败：找不到 ${label}`);
  }
  return html.replace(search, replacement);
}

const css = read('styles.css');
const vocabulary = read('assets/vocabulary.js');
const curriculum = read('data/curriculum.js');
const appSource = read('app.js');
const icon = read('assets/icon.svg');
const highFrequencyLicense = read('data/source/HIGH-FREQUENCY-LICENSE.txt');
const examLicense = read('data/source/exam/LICENSE.txt');
let html = read('index.html');

html = replaceOnce(
  html,
  '<link rel="manifest" href="manifest.webmanifest">',
  '',
  'PWA manifest'
);
html = replaceOnce(
  html,
  '<link rel="icon" href="assets/icon.svg" type="image/svg+xml">',
  `<link rel="icon" href="data:image/svg+xml;base64,${Buffer.from(icon).toString('base64')}">`,
  '站点图标'
);
html = replaceOnce(
  html,
  '<link rel="stylesheet" href="styles.css">',
  `<style>\n${css}\n</style>`,
  '样式表'
);
html = replaceOnce(
  html,
  '<script src="assets/vocabulary.js"></script>',
  `<script>\n${inlineScript(vocabulary)}\n</script>`,
  '词库脚本'
);
html = replaceOnce(
  html,
  '<script src="data/curriculum.js"></script>',
  `<script>\n${inlineScript(curriculum)}\n</script>`,
  '课程脚本'
);
html = replaceOnce(
  html,
  '<script src="app.js"></script>',
  `<script>\n${inlineScript(appSource)}\n</script>`,
  '应用脚本'
);

const licenseNotice = [
  'English Forge standalone build. All study data stays in this browser.',
  '',
  'High-frequency vocabulary license:',
  highFrequencyLicense.trim(),
  '',
  'Exam vocabulary license:',
  examLicense.trim()
].join('\n').replace(/--/g, '- -');
html = html.replace('<!doctype html>', `<!doctype html>\n<!--\n${licenseNotice}\n-->`);

fs.mkdirSync(releaseDir, { recursive: true });
fs.writeFileSync(outputFile, html);

console.log(
  `Generated ${path.relative(root, outputFile)}: ${(Buffer.byteLength(html) / 1024 / 1024).toFixed(2)} MB`
);
