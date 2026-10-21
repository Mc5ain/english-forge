const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const vocabulary = fs.readFileSync(path.join(root, 'assets/vocabulary.js'), 'utf8');
const curriculum = fs.readFileSync(path.join(root, 'data/curriculum.js'), 'utf8');
const appSource = fs.readFileSync(path.join(root, 'app.js'), 'utf8');

function createApp(hash = '#home') {
  const dom = new JSDOM(html, {
    url: `http://localhost:4174/${hash}`,
    runScripts: 'outside-only',
    pretendToBeVisual: true
  });
  const { window } = dom;
  window.scrollTo = () => {};
  window.HTMLDialogElement.prototype.showModal = function showModal() {
    this.open = true;
  };
  window.HTMLDialogElement.prototype.close = function close() {
    this.open = false;
  };
  window.eval(vocabulary);
  window.eval(curriculum);
  window.eval(appSource);
  return { dom, window, document: window.document };
}

function click(window, selector) {
  const element = window.document.querySelector(selector);
  if (!element) throw new Error(`找不到可点击元素：${selector}`);
  element.dispatchEvent(new window.MouseEvent('click', {
    bubbles: true,
    cancelable: true
  }));
  return element;
}

function keydown(window, key) {
  window.document.dispatchEvent(new window.KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true
  }));
  return document.querySelector('#app').innerHTML;
}

function check(condition, message) {
  if (!condition) throw new Error(message);
}

const { window, document } = createApp();
const app = () => document.querySelector('#app').innerHTML;

check(app().includes('今天，让英语'), '首页应完成渲染');
check(app().includes('/ 20 ACTIONS'), '首页应显示默认每日目标');
check(
  document.querySelector('#nav-vocab-count').textContent === window.ENGLISH_VOCAB.words.length.toLocaleString('en-US'),
  '侧栏应显示完整词库数量'
);
check(app().includes('PERSONAL COACH') && app().includes('完成一轮主动提取'), '首页应给出个性化训练建议');

click(window, '[data-coach-primary]');
check(app().includes('RETRIEVE THE MEANING'), '主动回忆训练应显示英文提示');
check(document.querySelector('[data-nav="vocab"]').classList.contains('active'), '从教练入口进入训练后词汇导航应同步高亮');
check(window.location.hash === '#vocab', '从教练入口进入训练后地址应同步');
keydown(window, ' ');
check(app().includes('data-grade="1"') && app().includes('data-grade="5"'), '揭示单词后应显示四档评分');
check(app().includes('1</kbd> 忘记') && app().includes('4</kbd> 很熟'), '评分区应显示键盘快捷键');
check(Boolean(document.querySelector('.exam-tag')), '单词卡应显示所属考试标签');
const firstWordRank = Number(
  (document.querySelector('.word-pos').textContent.match(/#(\d+)/) || [])[1]
);
check(firstWordRank >= 800, '默认新词应从日常核心及以上开始，而不是 on、by 等基础功能词');
const definitionRows = document.querySelectorAll('.definition-row');
check(definitionRows.length >= 1, '单词卡释义应按词性拆行');
check(
  Array.from(definitionRows).every(row => row.textContent.trim().length <= 100),
  '单词卡单条释义不应过长'
);
keydown(window, '3');
check(app().includes('2 / 20'), '评分后应进入下一个词');
const savedState = JSON.parse(window.localStorage.getItem('english_forge_state_v1'));
check(Object.keys(savedState.records).length === 1, '评分应写入学习记录');
check(savedState.activity.items.length === 1, '评分应计入今日有效动作');
const dueWordId = Object.keys(savedState.records)[0];
savedState.records[dueWordId].dueAt = Date.now() - 1000;
window.localStorage.setItem('english_forge_state_v1', JSON.stringify(savedState));
window.dispatchEvent(new window.StorageEvent('storage', {
  key: 'english_forge_state_v1'
}));

click(window, '[data-exit-session]');
click(window, '[data-nav="review"]');
check(app().includes('1 now due') || document.querySelector('#app').textContent.includes('现在到期'), '到期词应出现在复习页');
click(window, '[data-start-word="review"]');
check(app().includes('1 / 1') && app().includes('错题回炉'), '未答错但已到期的词也应进入复习队列');
click(window, '[data-exit-session]');
check(app().includes('词汇分类') && app().includes('看英文，选中文') && app().includes('看中文，选英文'), '词汇页应提供分类和新增选择题模式');
check(document.querySelectorAll('[data-vocab-exam]').length >= 7, '词汇页应提供高考、四六级、考研等考试分类');
check(Boolean(document.querySelector('[data-vocab-exam="none"]')), '词汇页应提供未分类考试词筛选');
check(app().includes('考试词库覆盖') && document.querySelectorAll('.exam-overview-grid .exam-overview-card').length === 7, '词汇页应显示七类考试覆盖进度');
check(document.querySelectorAll('[data-vocab-textbook]').length >= 5, '词汇页应提供新视野 1-4 册教材分类');
check(document.querySelectorAll('.textbook-overview-grid .exam-overview-card').length === 4, '词汇页应显示新视野四册覆盖进度');
click(window, '[data-vocab-textbook="xln1"]');
check(JSON.parse(window.localStorage.getItem('english_forge_profile_v1')).textbook === 'xln1', '新视野册别筛选应持久化');
check(document.querySelector('[data-vocab-textbook="xln1"]').classList.contains('active'), '当前教材分类应高亮');
click(window, '[data-vocab-textbook="all"]');
click(window, '[data-vocab-exam="cet6"]');
const examFilterProfile = JSON.parse(window.localStorage.getItem('english_forge_profile_v1'));
check(examFilterProfile.exam === 'cet6', '考试词库筛选应持久化');
check(document.querySelector('[data-vocab-exam="cet6"]').classList.contains('active'), '当前考试分类应高亮');
click(window, '[data-vocab-exam="all"]');
click(window, '[data-vocab-pos="verb"]');
const filteredProfile = JSON.parse(window.localStorage.getItem('english_forge_profile_v1'));
check(filteredProfile.pos === 'verb', '词性筛选应持久化');
check(document.querySelector('[data-vocab-pos="verb"]').classList.contains('active'), '当前词性筛选应高亮');
click(window, '[data-vocab-pos="all"]');
click(window, '[data-start-word="meaning-choice"]');
check(app().includes('CHOOSE THE MEANING') && document.querySelectorAll('[data-word-choice]').length === 4, '看英选义应显示四个选项');
click(window, '[data-word-choice]');
check(app().includes('选择正确') || app().includes('选择错误'), '选择后应立即显示判断结果');
click(window, '[data-next-word]');
check(app().includes('2 / 20') && app().includes('看英选义'), '选择题应正常推进');
click(window, '[data-exit-session]');
click(window, '[data-nav="listening"]');
check(app().includes('听写整句'), '听力页应正常渲染');
const listeningInput = document.querySelector('#listening-answer');
listeningInput.value = 'I usually review my notes before class';
click(window, '[data-check-listening]');
check(app().includes('匹配度 100%'), '正确听写应显示完整匹配');
const scrambledInput = document.querySelector('#listening-answer');
scrambledInput.value = 'class before notes my review usually I';
click(window, '[data-check-listening]');
check(!app().includes('匹配度 100%'), '词序错误不应获得完整匹配');
check(app().includes('顺序或搭配'), '听写反馈应指出顺序或搭配问题');

click(window, '[data-nav="reading"]');
check(app().includes('The First Week at University'), '阅读列表应包含入门文章');
click(window, '[data-open-article="first-week"]');
check(Boolean(document.querySelector('[data-reading-quiz]')), '阅读文章应正常打开');
click(window, '[data-lookup-word="confidence"]');
check(app().includes('WORD LOOKUP'), '点词查义应显示词典侧栏');
click(window, '.lookup-panel [data-toggle-favorite]');
check(document.querySelector('.lookup-panel').textContent.includes('★ 已收藏'), '阅读查词收藏后应显示已收藏');
click(window, '.lookup-panel [data-toggle-favorite]');
check(document.querySelector('.lookup-panel').textContent.includes('☆ 收藏'), '取消收藏后阅读侧栏应恢复');
click(window, '[data-lookup-word="arrived"]');
check(document.querySelector('.lookup-panel').textContent.includes('对应词条 arrive'), '过去式点词应回退到基础词条');

const readingForm = document.querySelector('[data-reading-quiz]');
['0', '2', '1'].forEach((answer, index) => {
  const radio = readingForm.querySelector(`input[name="read-${index}"][value="${answer}"]`);
  radio.checked = true;
});
readingForm.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
check(app().includes('得分 2 / 3'), '阅读题答错后应显示实际得分');

click(window, '[data-close-article]');
click(window, '[data-nav="home"]');
check(app().includes('回炉一道语篇错题'), '首页教练应把语篇错题纳入后续建议');
click(window, '[data-nav="review"]');
check(app().includes('阅读与语法错题') && app().includes('The First Week at University'), '阅读错题应进入统一复习页');
click(window, '[data-open-article="first-week"][data-question-index="0"]');
check(Boolean(document.querySelector('.question.focused')), '从复习页进入时应定位并突出原错题');
check(document.querySelector('[data-nav="reading"]').classList.contains('active'), '从复习页打开文章后阅读导航应同步高亮');
check(window.location.hash === '#reading', '从复习页打开文章后地址应同步');
const retryReadingForm = document.querySelector('[data-reading-quiz]');
['1', '2', '1'].forEach((answer, index) => {
  const radio = retryReadingForm.querySelector(`input[name="read-${index}"][value="${answer}"]`);
  radio.checked = true;
});
retryReadingForm.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
check(app().includes('得分 3 / 3'), '阅读错题重做正确后应更新得分');
click(window, '[data-close-article]');
click(window, '[data-nav="review"]');
check(app().includes('暂时没有语篇错题'), '阅读题答对后应自动移出错题队列');

click(window, '[data-nav="grammar"]');
check(app().includes('语法不是术语'), '语法列表应正常渲染');
click(window, '[data-open-lesson="be-verbs"]');
check(app().includes('be 动词：am / is / are'), '语法课程应正常打开');
const lessonForm = document.querySelector('[data-lesson-quiz]');
['0', '2', '0'].forEach((answer, index) => {
  const radio = lessonForm.querySelector(`input[name="lesson-${index}"][value="${answer}"]`);
  radio.checked = true;
});
lessonForm.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
check(app().includes('得分 2 / 3'), '语法答错后应显示实际得分');
click(window, '[data-close-lesson]');
click(window, '[data-nav="review"]');
check(app().includes('GRAMMAR') && app().includes('be 动词'), '语法错题应进入统一复习页');
click(window, '[data-open-lesson="be-verbs"][data-question-index="0"]');
check(document.querySelector('[data-nav="grammar"]').classList.contains('active'), '从复习页打开语法课后导航应同步高亮');
const retryLessonForm = document.querySelector('[data-lesson-quiz]');
['1', '2', '0'].forEach((answer, index) => {
  const radio = retryLessonForm.querySelector(`input[name="lesson-${index}"][value="${answer}"]`);
  radio.checked = true;
});
retryLessonForm.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
check(app().includes('得分 3 / 3'), '语法错题重做正确后应更新得分');
click(window, '[data-close-lesson]');

click(window, '[data-nav="dictionary"]');
const search = document.querySelector('#dictionary-search');
search.value = 'student';
search.dispatchEvent(new window.Event('input', { bubbles: true }));
check(app().includes('student'), '词典搜索应返回 student');
const dictionaryExam = document.querySelector('#dictionary-exam');
check(dictionaryExam && dictionaryExam.options.length >= 8, '词典应支持按考试分类筛选');
const dictionaryTextbook = document.querySelector('#dictionary-textbook');
check(dictionaryTextbook && dictionaryTextbook.options.length >= 6, '词典应支持按新视野册别筛选');
search.value = 'access';
search.dispatchEvent(new window.Event('input', { bubbles: true }));
dictionaryExam.value = 'cet4';
dictionaryExam.dispatchEvent(new window.Event('change', { bubbles: true }));
check(app().includes('access'), '四级筛选下应能查到四级词 access');
dictionaryExam.value = 'all';
dictionaryExam.dispatchEvent(new window.Event('change', { bubbles: true }));
search.value = 'ability';
search.dispatchEvent(new window.Event('input', { bubbles: true }));
dictionaryTextbook.value = 'xln1';
dictionaryTextbook.dispatchEvent(new window.Event('change', { bubbles: true }));
check(app().includes('ability'), '新视野第 1 册筛选下应能查到 ability');
dictionaryTextbook.value = 'all';
dictionaryTextbook.dispatchEvent(new window.Event('change', { bubbles: true }));
search.value = 'student';
search.dispatchEvent(new window.Event('input', { bubbles: true }));
click(window, '[data-toggle-favorite]');
click(window, '[data-nav="vocab"]');
check(app().includes('复习收藏词 · 1'), '收藏词应出现专项训练入口');
click(window, '[data-vocab-status="favorite"]');
const favoriteFilterProfile = JSON.parse(window.localStorage.getItem('english_forge_profile_v1'));
check(favoriteFilterProfile.status === 'favorite', '学习状态筛选应持久化');
check(document.querySelector('[data-vocab-status="favorite"]').classList.contains('active'), '当前状态筛选应高亮');
click(window, '[data-vocab-status="all"]');
click(window, '[data-start-word="focus"]');
check(app().includes('收藏专项'), '收藏词专项训练应正常启动');
click(window, '[data-reveal-word]');
click(window, '[data-grade="4"]');
check(
  app().includes('SESSION COMPLETE'),
  `收藏词训练完成后应显示总结，当前页面：${app().replace(/\s+/g, ' ').slice(0, 500)}`
);

click(window, '[data-open-settings]');
click(window, '[data-daily-goal="30"]');
const profile = JSON.parse(window.localStorage.getItem('english_forge_profile_v1'));
check(profile.dailyGoal === 30, '每日目标设置应持久化');
click(window, '[data-theme-option="light"]');
check(document.documentElement.dataset.theme === 'light', '浅色主题应立即应用');
check(window.localStorage.getItem('english_forge_theme') === 'light', '主题设置应持久化');
click(window, '[data-theme-option="dark"]');

console.log('App interaction check passed: coach recommendations, classified vocabulary, six training modes, SRS review, favorite flow, dictation scoring, morphology lookup, mistake replay, dictionary search and settings.');
