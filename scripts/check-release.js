const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const root = path.resolve(__dirname, '..');
const releaseFile = path.join(root, 'release/English-Forge-英语锻造所.html');
const html = fs.readFileSync(releaseFile, 'utf8');
const offlineHtml = fs.readFileSync(path.join(root, 'offline.html'), 'utf8');
const browserErrors = [];
const virtualConsole = new VirtualConsole();
virtualConsole.on('jsdomError', error => browserErrors.push(error));

if (!html.includes('window.ENGLISH_VOCAB') || !html.includes('window.ENGLISH_CURRICULUM')) {
  throw new Error('单文件版缺少词库或课程数据');
}
if (!offlineHtml.includes('window.ENGLISH_VOCAB') || !offlineHtml.includes('window.ENGLISH_CURRICULUM')) {
  throw new Error('公网单文件备用版缺少词库或课程数据');
}
if (/<script[^>]+src=|<link[^>]+stylesheet/.test(html)) {
  throw new Error('单文件版仍包含外部脚本或样式依赖');
}

const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  url: 'http://localhost/english-forge.html',
  virtualConsole
});

function check(condition, message) {
  if (!condition) throw new Error(message);
}

const app = () => dom.window.document.querySelector('#app').innerHTML;
check(app().includes('今天，让英语'), '单文件版首页未正常渲染');
check(app().includes('/ 20 ACTIONS'), '单文件版每日目标显示异常');
dom.window.scrollTo = () => {};
const vocabButton = dom.window.document.querySelector('[data-nav="vocab"]');
vocabButton.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true }));
check(app().includes('选择训练方式'), '单文件版词汇页交互异常');
check(browserErrors.length === 0, `单文件版运行时错误：${browserErrors.map(error => error.message).join('; ')}`);

console.log('Standalone check passed: self-contained assets, home rendering and vocabulary navigation.');
