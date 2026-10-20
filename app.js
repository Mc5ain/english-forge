(() => {
  const VOCAB = window.ENGLISH_VOCAB;
  const WORDS = VOCAB.words;
  const CURRICULUM = window.ENGLISH_CURRICULUM;
  const WORD_MAP = new Map(WORDS.map(word => [word.id, word]));
  const BY_WORD = new Map(WORDS.map(word => [word.word.toLowerCase(), word]));
  const STORAGE_KEY = 'english_forge_state_v1';
  const PROFILE_KEY = 'english_forge_profile_v1';
  const SESSION_KEY = 'english_forge_word_session_v1';
  const THEME_KEY = 'english_forge_theme';
  const DAY_MS = 86400000;
  const VIEWS = [
    'home', 'vocab', 'review', 'listening', 'speaking',
    'reading', 'grammar', 'dictionary', 'progress', 'more'
  ];
  const VIEW_META = {
    home: ['TODAY\'S MISSION', '把英语练成能力'],
    vocab: ['VOCABULARY ENGINE', '每个词都要能被真正提取'],
    review: ['MEMORY CONTROL', '把遗忘变成复习信号'],
    listening: ['LISTEN & SHADOW', '听清、模仿、再说出来'],
    speaking: ['SPEAKING LAB', '从敢开口到说清楚'],
    reading: ['EXTENSIVE READING', '在真实语境里吸收表达'],
    grammar: ['GRAMMAR LAB', '理解结构，而不是背口诀'],
    dictionary: ['OFFLINE DICTIONARY', '基础高频与考试词汇随查随听'],
    progress: ['LEARNING SIGNAL', '只看能推动行动的指标'],
    more: ['TRAINING MAP', '选择下一项训练']
  };
  const POS_FILTERS = [
    { key: 'all', label: '全部' },
    { key: 'noun', label: '名词' },
    { key: 'verb', label: '动词' },
    { key: 'adjective', label: '形容词' },
    { key: 'adverb', label: '副词' },
    { key: 'preposition', label: '介词' },
    { key: 'conjunction', label: '连词' },
    { key: 'pronoun', label: '代词' },
    { key: 'other', label: '其他' }
  ];
  const EXAM_FILTERS = [
    { key: 'all', label: '全部' },
    ...Object.entries(VOCAB.exams || {}).map(([key, label]) => ({ key, label }))
  ];
  const STATUS_FILTERS = [
    { key: 'all', label: '全部' },
    { key: 'new', label: '未学习' },
    { key: 'learning', label: '学习中' },
    { key: 'weak', label: '易错' },
    { key: 'mastered', label: '已掌握' },
    { key: 'favorite', label: '已收藏' }
  ];

  const app = document.querySelector('#app');
  const toastNode = document.querySelector('#toast');
  const settingsDialog = document.querySelector('#settings-dialog');
  const importInput = document.querySelector('#import-file');

  const defaultProfile = {
    dailyGoal: 20,
    band: 'all',
    exam: 'all',
    pos: 'all',
    status: 'all',
    accent: 'en-US',
    rate: 0.9
  };

  function readProfile() {
    try {
      const value = JSON.parse(localStorage.getItem(PROFILE_KEY));
      return {
        dailyGoal: [10, 20, 30].includes(Number(value && value.dailyGoal))
          ? Number(value.dailyGoal)
          : defaultProfile.dailyGoal,
        band: value && (value.band === 'all' || VOCAB.bands[value.band])
          ? value.band
          : defaultProfile.band,
        exam: value && EXAM_FILTERS.some(item => item.key === value.exam)
          ? value.exam
          : defaultProfile.exam,
        pos: value && POS_FILTERS.some(item => item.key === value.pos)
          ? value.pos
          : defaultProfile.pos,
        status: value && STATUS_FILTERS.some(item => item.key === value.status)
          ? value.status
          : defaultProfile.status,
        accent: value && ['en-US', 'en-GB'].includes(value.accent)
          ? value.accent
          : defaultProfile.accent,
        rate: value && [0.72, 0.9, 1.08].includes(Number(value.rate))
          ? Number(value.rate)
          : defaultProfile.rate
      };
    } catch {
      return { ...defaultProfile };
    }
  }

  function readTheme() {
    try {
      const value = localStorage.getItem(THEME_KEY);
      return ['dark', 'light'].includes(value) ? value : 'dark';
    } catch {
      return 'dark';
    }
  }

  function applyTheme(value, persist = true) {
    theme = value === 'light' ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.content = theme === 'light' ? '#f3f2e9' : '#09110f';
    if (persist) {
      try {
        localStorage.setItem(THEME_KEY, theme);
      } catch {
        // The visual setting still applies for this session if storage is unavailable.
      }
    }
    updateSettingsControls();
  }

  let profile = readProfile();
  let theme = readTheme();
  let stateCache = null;
  let stateCacheDate = '';
  let currentView = viewFromHash();
  let wordSession = null;
  let listeningIndex = 0;
  let listeningRevealed = false;
  let listeningFeedback = null;
  let speakingIndex = 0;
  let speakingRecognition = null;
  let speakingRecording = false;
  let speakingStartedAt = 0;
  let speakingResult = null;
  let readingState = null;
  let lessonState = null;
  const dictionaryState = { query: '', band: 'all', exam: 'all', limit: 60 };

  function dateKey(date = new Date()) {
    const value = date;
    return [
      value.getFullYear(),
      String(value.getMonth() + 1).padStart(2, '0'),
      String(value.getDate()).padStart(2, '0')
    ].join('-');
  }

  function previousDateKey(offset = 1) {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - offset);
    return dateKey(date);
  }

  function viewFromHash() {
    const view = location.hash.replace(/^#/, '');
    return VIEWS.includes(view) ? view : 'home';
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function defaultState() {
    return {
      records: {},
      favorites: {},
      activity: { date: dateKey(), items: [] },
      history: {},
      streak: { current: 0, longest: 0, lastDate: '' },
      lessons: {},
      articles: {},
      questionMistakes: {}
    };
  }

  function normalizeRecord(record) {
    if (!record || typeof record !== 'object') return null;
    const number = (value, fallback = 0) => {
      const numeric = Number(value);
      return Number.isFinite(numeric) && numeric >= 0 ? numeric : fallback;
    };
    return {
      interval: number(record.interval),
      repetition: number(record.repetition),
      ease: clamp(number(record.ease, 2.5), 1.3, 3.5),
      dueAt: number(record.dueAt),
      seen: number(record.seen),
      correct: number(record.correct),
      wrong: number(record.wrong),
      lastSeenAt: number(record.lastSeenAt),
      lastGrade: number(record.lastGrade)
    };
  }

  function ensureDailyState(state) {
    const today = dateKey();
    if (!state.activity || typeof state.activity !== 'object' || Array.isArray(state.activity)) {
      state.activity = { date: today, items: [] };
    }
    if (state.activity.date !== today) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(String(state.activity.date))) {
        state.history[state.activity.date] = {
          count: Array.isArray(state.activity.items) ? state.activity.items.length : 0
        };
      }
      state.activity = { date: today, items: [] };
    }
    if (!Array.isArray(state.activity.items)) state.activity.items = [];
    state.activity.items = [...new Set(state.activity.items.filter(item => typeof item === 'string'))];
    Object.keys(state.history)
      .sort()
      .slice(0, -400)
      .forEach(key => delete state.history[key]);
  }

  function loadState() {
    const today = dateKey();
    if (stateCache && stateCacheDate === today) return stateCache;
    let state;
    try {
      state = JSON.parse(localStorage.getItem(STORAGE_KEY));
    } catch {
      state = null;
    }
    if (!state || typeof state !== 'object' || Array.isArray(state)) state = defaultState();
    if (!state.records || typeof state.records !== 'object' || Array.isArray(state.records)) {
      state.records = {};
    }
    const records = {};
    Object.entries(state.records).forEach(([id, record]) => {
      const normalized = normalizeRecord(record);
      if (WORD_MAP.has(id) && normalized) records[id] = normalized;
    });
    state.records = records;
    if (!state.favorites || typeof state.favorites !== 'object' || Array.isArray(state.favorites)) {
      state.favorites = {};
    }
    if (!state.history || typeof state.history !== 'object' || Array.isArray(state.history)) {
      state.history = {};
    }
    if (!state.lessons || typeof state.lessons !== 'object') state.lessons = {};
    if (!state.articles || typeof state.articles !== 'object') state.articles = {};
    const questionMistakes = {};
    if (state.questionMistakes &&
        typeof state.questionMistakes === 'object' &&
        !Array.isArray(state.questionMistakes)) {
      Object.entries(state.questionMistakes).forEach(([key, value]) => {
        if (!parseQuestionMistakeKey(key) || !value || typeof value !== 'object') return;
        questionMistakes[key] = {
          wrong: Math.max(1, Number(value.wrong) || 1),
          lastAt: Math.max(0, Number(value.lastAt) || 0)
        };
      });
    }
    state.questionMistakes = questionMistakes;
    if (!state.streak || typeof state.streak !== 'object') {
      state.streak = { current: 0, longest: 0, lastDate: '' };
    }
    ensureDailyState(state);
    stateCache = state;
    stateCacheDate = today;
    return state;
  }

  function parseQuestionMistakeKey(key) {
    const match = String(key || '').match(/^(reading|grammar):([a-z0-9-]+):(\d+)$/);
    if (!match) return null;
    const [, type, sourceId, indexText] = match;
    const questionIndex = Number(indexText);
    const source = type === 'reading'
      ? CURRICULUM.reading.find(item => item.id === sourceId)
      : CURRICULUM.grammar.find(item => item.id === sourceId);
    if (!source ||
        !Number.isInteger(questionIndex) ||
        questionIndex < 0 ||
        questionIndex >= source.questions.length) {
      return null;
    }
    return {
      type,
      sourceId,
      questionIndex,
      source,
      question: source.questions[questionIndex]
    };
  }

  function questionMistakeList(state = loadState()) {
    return Object.entries(state.questionMistakes || {})
      .map(([key, value]) => {
        const parsed = parseQuestionMistakeKey(key);
        return parsed ? {
          ...parsed,
          key,
          wrong: Math.max(1, Number(value.wrong) || 1),
          lastAt: Math.max(0, Number(value.lastAt) || 0)
        } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.wrong - a.wrong || b.lastAt - a.lastAt);
  }

  function recordQuestionResult(state, type, sourceId, questionIndex, correct) {
    const key = `${type}:${sourceId}:${questionIndex}`;
    if (correct) {
      delete state.questionMistakes[key];
      return;
    }
    const previous = state.questionMistakes[key];
    state.questionMistakes[key] = {
      wrong: Math.max(1, Number(previous && previous.wrong) || 0) + 1,
      lastAt: Date.now()
    };
  }

  function saveState(state) {
    ensureDailyState(state);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    stateCache = state;
    stateCacheDate = dateKey();
    updateChrome();
  }

  function saveProfile() {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }

  function markStudyDay(state) {
    const today = dateKey();
    if (state.streak.lastDate === today) return;
    state.streak.current = state.streak.lastDate === previousDateKey()
      ? Number(state.streak.current || 0) + 1
      : 1;
    state.streak.longest = Math.max(Number(state.streak.longest || 0), state.streak.current);
    state.streak.lastDate = today;
  }

  function markActivity(type, id) {
    const state = loadState();
    ensureDailyState(state);
    const key = `${type}:${id}`;
    if (!state.activity.items.includes(key)) state.activity.items.push(key);
    markStudyDay(state);
    saveState(state);
  }

  function activeStreak(state) {
    const last = state.streak.lastDate;
    return last === dateKey() || last === previousDateKey()
      ? Number(state.streak.current || 0)
      : 0;
  }

  function dueWords() {
    const state = loadState();
    return WORDS.filter(word => {
      const record = state.records[word.id];
      return record && record.dueAt <= Date.now();
    });
  }

  function weakWords() {
    const state = loadState();
    return WORDS
      .filter(word => state.records[word.id] && state.records[word.id].wrong > 0)
      .sort((a, b) => {
        const ra = state.records[a.id];
        const rb = state.records[b.id];
        return rb.wrong - ra.wrong || ra.correct - rb.correct || rb.lastSeenAt - ra.lastSeenAt;
      });
  }

  function favoriteWords() {
    const state = loadState();
    return WORDS.filter(word => state.favorites[word.id]);
  }

  function reviewWords() {
    const state = loadState();
    const now = Date.now();
    return WORDS
      .filter(word => {
        const record = state.records[word.id];
        return record && (record.dueAt <= now || record.wrong > 0);
      })
      .sort((a, b) => {
        const ra = state.records[a.id];
        const rb = state.records[b.id];
        const aDue = ra.dueAt <= now ? 0 : 1;
        const bDue = rb.dueAt <= now ? 0 : 1;
        return aDue - bDue || rb.wrong - ra.wrong || ra.dueAt - rb.dueAt || ra.lastSeenAt - rb.lastSeenAt;
      });
  }

  function bandWords() {
    const state = loadState();
    return WORDS.filter(word => {
      if (profile.band !== 'all' && word.band !== profile.band) return false;
      if (profile.exam !== 'all' && !word.exams.includes(profile.exam)) return false;
      if (!matchesPartOfSpeech(word, profile.pos)) return false;
      return matchesLearningStatus(word, profile.status, state);
    });
  }

  function matchesPartOfSpeech(word, filter) {
    if (filter === 'all') return true;
    const pos = word.pos;
    const checks = {
      noun: () => pos.includes('名词'),
      verb: () => pos.includes('动词'),
      adjective: () => pos.includes('形容词'),
      adverb: () => pos.includes('副词'),
      preposition: () => pos.includes('介词'),
      conjunction: () => pos.includes('连词'),
      pronoun: () => pos.includes('代词')
    };
    if (checks[filter]) return checks[filter]();
    return !pos.includes('名词') &&
      !pos.includes('动词') &&
      !pos.includes('形容词') &&
      !pos.includes('副词') &&
      !pos.includes('介词') &&
      !pos.includes('连词') &&
      !pos.includes('代词');
  }

  function matchesLearningStatus(word, filter, state) {
    if (filter === 'all') return true;
    const record = state.records[word.id];
    if (filter === 'new') return !record;
    if (filter === 'favorite') return Boolean(state.favorites[word.id]);
    if (!record) return false;
    if (filter === 'weak') return record.wrong > 0;
    if (filter === 'mastered') return record.repetition >= 4;
    if (filter === 'learning') return record.repetition < 4;
    return true;
  }

  function countWordsForFilter(type, value) {
    const state = loadState();
    return WORDS.filter(word => {
      const bandMatch = type === 'band'
        ? value === 'all' || word.band === value
        : profile.band === 'all' || word.band === profile.band;
      const examMatch = type === 'exam'
        ? value === 'all' || word.exams.includes(value)
        : profile.exam === 'all' || word.exams.includes(profile.exam);
      const posMatch = matchesPartOfSpeech(word, type === 'pos' ? value : profile.pos);
      const statusMatch = matchesLearningStatus(word, type === 'status' ? value : profile.status, state);
      return bandMatch && examMatch && posMatch && statusMatch;
    }).length;
  }

  function examBadgeMarkup(word) {
    const keys = (word.exams || []).filter(key => VOCAB.exams[key]);
    if (!keys.length) return '';
    const visible = keys.slice(0, 4);
    const overflow = keys.length - visible.length;
    return `
      <div class="exam-tag-row">
        ${visible.map(key => `<span class="exam-tag">${escapeHtml(VOCAB.exams[key])}</span>`).join('')}
        ${overflow > 0 ? `<span class="exam-tag">+${overflow}</span>` : ''}
      </div>
    `;
  }

  function examProgress() {
    const state = loadState();
    return Object.entries(VOCAB.exams || {}).map(([key, label]) => {
      const words = WORDS.filter(word => word.exams.includes(key));
      const learned = words.filter(word => state.records[word.id]).length;
      const mastered = words.filter(word => {
        const record = state.records[word.id];
        return record && record.repetition >= 4;
      }).length;
      return {
        key,
        label,
        total: words.length,
        learned,
        mastered,
        percent: words.length ? Math.round((learned / words.length) * 100) : 0
      };
    });
  }

  function wordQueue(limit, mode = 'mixed') {
    const state = loadState();
    const source = mode === 'review'
      ? reviewWords()
      : mode === 'focus'
        ? favoriteWords()
        : bandWords();
    const due = source
      .filter(word => state.records[word.id] && state.records[word.id].dueAt <= Date.now())
      .sort((a, b) => state.records[a.id].dueAt - state.records[b.id].dueAt);
    const fresh = source
      .filter(word => !state.records[word.id])
      .sort((a, b) => a.rank - b.rank);
    const preferredStart = profile.band !== 'all'
      ? 0
      : {
          junior: 0,
          high: 350,
          cet4: 800,
          cet6: 1200,
          kaoyan: 1200,
          toefl: 1200,
          sat: 1200
        }[profile.exam] || 800;
    const preferredFresh = fresh.filter(word => word.rank >= preferredStart);
    const remainingFresh = fresh.filter(word => word.rank < preferredStart);
    const later = source
      .filter(word => state.records[word.id] && state.records[word.id].dueAt > Date.now())
      .sort((a, b) => state.records[a.id].lastSeenAt - state.records[b.id].lastSeenAt);
    const pool = mode === 'review'
      ? due.concat(later)
      : due.concat(preferredFresh, remainingFresh, later);
    return pool.slice(0, limit);
  }

  function reviewWord(id, grade) {
    const state = loadState();
    const previous = state.records[id] || {
      interval: 0,
      repetition: 0,
      ease: 2.5,
      dueAt: 0,
      seen: 0,
      correct: 0,
      wrong: 0,
      lastSeenAt: 0,
      lastGrade: 0
    };
    let repetition = previous.repetition;
    let interval = previous.interval;
    let ease = previous.ease;
    if (grade === 1) {
      repetition = 0;
      interval = 0;
      ease = Math.max(1.3, ease - 0.2);
    } else if (grade === 3) {
      repetition += 1;
      interval = interval <= 0 ? 1 : Math.max(1, interval * 1.35);
      ease = Math.max(1.3, ease - 0.05);
    } else if (grade === 4) {
      repetition += 1;
      interval = interval <= 0 ? 1 : interval * 2;
      ease = Math.min(3.5, ease + 0.04);
    } else {
      repetition += 1;
      interval = interval <= 0 ? 2 : interval * 2.6;
      ease = Math.min(3.5, ease + 0.12);
    }
    const dueAt = grade === 1
      ? Date.now() + 10 * 60000
      : Date.now() + Math.max(1, Math.round(interval)) * DAY_MS;
    state.records[id] = {
      interval,
      repetition,
      ease,
      dueAt,
      seen: previous.seen + 1,
      correct: previous.correct + (grade >= 3 ? 1 : 0),
      wrong: previous.wrong + (grade === 1 ? 1 : 0),
      lastSeenAt: Date.now(),
      lastGrade: grade
    };
    markActivity('word', id);
    saveState(state);
    return state.records[id];
  }

  function toggleFavorite(id) {
    if (!WORD_MAP.has(id)) return false;
    const state = loadState();
    const active = !state.favorites[id];
    if (active) state.favorites[id] = Date.now();
    else delete state.favorites[id];
    saveState(state);
    return active;
  }

  function speak(text, rate = profile.rate) {
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
      showToast('当前浏览器不支持语音朗读');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = profile.accent;
    utterance.rate = rate;
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(item => item.lang.replace('_', '-') === profile.accent) ||
      voices.find(item => item.lang.toLowerCase().startsWith('en'));
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  }

  function showToast(message) {
    toastNode.textContent = message;
    toastNode.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toastNode.classList.remove('show'), 2000);
  }

  function updateChrome() {
    const state = loadState();
    const due = dueWords().length;
    document.querySelector('#sidebar-streak').textContent = activeStreak(state);
    const navVocabCount = document.querySelector('#nav-vocab-count');
    if (navVocabCount) navVocabCount.textContent = WORDS.length.toLocaleString('en-US');
    const navDue = document.querySelector('#nav-due-count');
    if (navDue) navDue.textContent = `${due} due`;
    const meta = VIEW_META[currentView] || VIEW_META.home;
    document.querySelector('#view-kicker').textContent = meta[0];
    document.querySelector('#view-title').textContent = meta[1];
    document.querySelectorAll('[data-nav]').forEach(button => {
      const active = button.dataset.nav === currentView;
      button.classList.toggle('active', active);
      if (active) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
    updateSettingsControls();
  }

  function setView(view, syncHash = true) {
    if (!VIEWS.includes(view)) view = 'home';
    currentView = view;
    readingState = null;
    lessonState = null;
    if (syncHash && location.hash !== `#${view}`) history.pushState({ view }, '', `#${view}`);
    updateChrome();
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function activateView(view, syncHash = true) {
    if (!VIEWS.includes(view) || currentView === view) return;
    currentView = view;
    if (syncHash && location.hash !== `#${view}`) history.pushState({ view }, '', `#${view}`);
    updateChrome();
  }

  function render() {
    if (currentView === 'home') renderHome();
    else if (currentView === 'vocab') renderVocab();
    else if (currentView === 'review') renderReview();
    else if (currentView === 'listening') renderListening();
    else if (currentView === 'speaking') renderSpeaking();
    else if (currentView === 'reading') renderReading();
    else if (currentView === 'grammar') renderGrammar();
    else if (currentView === 'dictionary') renderDictionary();
    else if (currentView === 'progress') renderProgress();
    else renderMore();
  }

  function todayCounts() {
    const items = loadState().activity.items;
    return {
      total: items.length,
      words: items.filter(item => item.startsWith('word:')).length,
      listening: items.filter(item => item.startsWith('listen:')).length,
      speaking: items.filter(item => item.startsWith('speak:')).length,
      reading: items.filter(item => item.startsWith('read:')).length,
      grammar: items.filter(item => item.startsWith('grammar:')).length
    };
  }

  function weekly() {
    const state = loadState();
    const labels = ['日', '一', '二', '三', '四', '五', '六'];
    const days = [];
    for (let offset = 6; offset >= 0; offset -= 1) {
      const date = new Date();
      date.setHours(12, 0, 0, 0);
      date.setDate(date.getDate() - offset);
      const key = dateKey(date);
      const count = key === state.activity.date
        ? state.activity.items.length
        : Number(state.history[key] && state.history[key].count) || 0;
      days.push({ key, label: labels[date.getDay()], count, today: key === state.activity.date });
    }
    return days;
  }

  function bandProgress() {
    const state = loadState();
    return Object.entries(VOCAB.bands).map(([key, band]) => {
      const words = WORDS.filter(word => word.band === key);
      const learned = words.filter(word => state.records[word.id]).length;
      return {
        key,
        ...band,
        total: words.length,
        learned,
        percent: words.length ? Math.round((learned / words.length) * 100) : 0
      };
    });
  }

  function startWordSession(mode) {
    wordSession = restoreWordSession();
    if (!wordSession || wordSession.mode !== mode) {
      const queueMode = mode === 'review' || mode === 'focus' ? mode : 'mixed';
      const queue = wordQueue(profile.dailyGoal, queueMode);
      if (!queue.length) {
        wordSession = null;
        sessionStorage.removeItem(SESSION_KEY);
        renderVocab();
        showToast('当前词汇分类没有可训练内容');
        return;
      }
      wordSession = {
        mode,
        queue: queue.map(word => word.id),
        index: 0,
        revealed: mode === 'recognize' || mode === 'recall' ? false : false,
        answered: false,
        correct: 0,
        lastCorrect: null,
        score: 0,
        weak: 0
      };
    }
    saveWordSession();
    renderVocab();
  }

  function saveWordSession() {
    if (!wordSession) {
      sessionStorage.removeItem(SESSION_KEY);
      return;
    }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(wordSession));
  }

  function restoreWordSession() {
    try {
      const session = JSON.parse(sessionStorage.getItem(SESSION_KEY));
      if (!session ||
          !['recognize', 'recall', 'spelling', 'listening', 'meaning-choice', 'english-choice', 'review', 'focus'].includes(session.mode) ||
          !Array.isArray(session.queue) ||
          !session.queue.length ||
          session.queue.some(id => !WORD_MAP.has(id)) ||
          session.index >= session.queue.length) {
        sessionStorage.removeItem(SESSION_KEY);
        return null;
      }
      return session;
    } catch {
      return null;
    }
  }

  function coachPlan(state, counts, dueCount) {
    const plan = [];
    const seen = new Set();
    const questions = questionMistakeList(state);
    const weakCount = weakWords().length;
    const favorites = Object.keys(state.favorites).length;
    const wordTarget = Math.max(5, Math.ceil(profile.dailyGoal * 0.5));
    const add = (key, title, reason, label, attrs, tone = '') => {
      if (seen.has(key)) return;
      seen.add(key);
      plan.push({ key, title, reason, label, attrs, tone });
    };

    if (dueCount > 0) {
      add(
        'due',
        '先把到期词取回来',
        `${dueCount} 个词已经进入遗忘临界点。现在复习一次，比继续学新词收益更高。`,
        `复习 ${dueCount} 个到期词`,
        'data-start-word="review"',
        'urgent'
      );
    }
    if (questions.length > 0) {
      const first = questions[0];
      const attrs = first.type === 'reading'
        ? `data-open-article="${first.sourceId}" data-question-index="${first.questionIndex}"`
        : `data-open-lesson="${first.sourceId}" data-question-index="${first.questionIndex}"`;
      add(
        'questions',
        '回炉一道语篇错题',
        `还有 ${questions.length} 道阅读或语法题没有真正过关。回到原题找证据。`,
        '回到错题',
        attrs,
        'urgent'
      );
    }
    if (counts.words < wordTarget) {
      add(
        'words',
        '完成一轮主动提取',
        `今天完成 ${counts.words} 个词，建议至少练到 ${wordTarget} 个。不要只看答案。`,
        counts.words ? '继续词汇训练' : '开始词汇训练',
        'data-start-word="recall"'
      );
    }
    if (counts.listening === 0) {
      add(
        'listening',
        '让耳朵先进入英语',
        '今天还没有听觉输入。完成一句听写，找出你漏掉的连读和词尾。',
        '做一句听写',
        'data-nav="listening"'
      );
    }
    if (counts.speaking === 0) {
      add(
        'speaking',
        '把理解变成连续输出',
        '认识不等于说得出。用给定框架连续说 30 秒，再回看转写。',
        '开口 30 秒',
        'data-nav="speaking"'
      );
    }
    if (!counts.reading && !counts.grammar) {
      add(
        'reading',
        '进入一段真实语境',
        '词汇需要被句子连接。读一篇短文，先理解整体，再处理生词。',
        '打开一篇文章',
        'data-nav="reading"'
      );
    } else if (!counts.grammar) {
      add(
        'grammar',
        '检查一条承重结构',
        '今天还没有语法训练。用三道题检查一个结构是否真的能识别。',
        '做语法检查',
        'data-nav="grammar"'
      );
    }
    if (weakCount > 0) {
      add(
        'weak',
        '再取回反复出错的词',
        `${weakCount} 个词曾经答错。短间隔重取一次，比重新看释义更有效。`,
        '继续错词复习',
        'data-start-word="review"'
      );
    }
    if (favorites > 0) {
      add(
        'favorites',
        '把收藏词转成主动记忆',
        `${favorites} 个重点词正在等待一次真正的回忆训练。`,
        '开始收藏专项',
        'data-start-word="focus"'
      );
    }
    if (counts.total < profile.dailyGoal) {
      add(
        'goal',
        '还差几步完成今天',
        `今天已有 ${counts.total} 个有效动作，距离目标还差 ${profile.dailyGoal - counts.total} 个。`,
        '继续今日训练',
        'data-nav="more"'
      );
    }
    if (plan.length === 0) {
      add(
        'complete',
        '今天已经完成闭环',
        '目标动作已经完成。可以做一轮收藏巩固，或直接休息，让记忆完成沉淀。',
        '查看学习数据',
        'data-nav="progress"',
        'complete'
      );
    }
    return plan.slice(0, 3);
  }

  function renderHome() {
    const state = loadState();
    const counts = todayCounts();
    const due = dueWords().length;
    const learned = Object.keys(state.records).length;
    const mastered = Object.values(state.records).filter(record => record.repetition >= 4).length;
    const attempts = Object.values(state.records).reduce(
      (sum, record) => sum + record.correct + record.wrong,
      0
    );
    const correct = Object.values(state.records).reduce((sum, record) => sum + record.correct, 0);
    const accuracy = attempts ? Math.round((correct / attempts) * 100) : null;
    const progress = clamp(Math.round((counts.total / profile.dailyGoal) * 100), 0, 100);
    const week = weekly();
    const max = Math.max(1, ...week.map(day => day.count));
    const coach = coachPlan(state, counts, due);
    const phrase = CURRICULUM.phrases[new Date().getDate() % CURRICULUM.phrases.length];
    const missions = [
      { type: 'word', icon: 'Aa', title: '词汇主动回忆', copy: `${counts.words} 个词已练 · ${due} 个到期`, time: '12 MIN', view: 'vocab', done: counts.words > 0 },
      { type: 'listen', icon: ')))', title: '听写与影子跟读', copy: counts.listening ? `${counts.listening} 句已完成` : '训练真实语流，而不是只看文字', time: '8 MIN', view: 'listening', done: counts.listening > 0 },
      { type: 'speak', icon: '◌', title: '口语输出', copy: counts.speaking ? `${counts.speaking} 个任务已完成` : '把认识变成说得出', time: '6 MIN', view: 'speaking', done: counts.speaking > 0 },
      { type: 'read', icon: '¶', title: '语境输入', copy: counts.reading || counts.grammar ? '阅读或语法训练已启动' : '一篇短文或一节语法', time: '5 MIN', view: counts.reading ? 'reading' : 'grammar', done: counts.reading > 0 || counts.grammar > 0 }
    ];
    app.innerHTML = `
      <section class="view">
        <div class="home-hero">
          <div class="hero-copy">
            <span class="eyebrow">DAILY MISSION · ${dateKey()}</span>
            <h1>今天，让英语<br><em>真正发生。</em></h1>
            <div class="hero-recommendation">
              <span>PERSONAL COACH</span>
              <strong>${escapeHtml(coach[0].title)}</strong>
            </div>
            <p>${escapeHtml(coach[0].reason)}</p>
            <div class="hero-actions">
              <button class="primary-button" ${coach[0].attrs} data-coach-primary>${escapeHtml(coach[0].label)} →</button>
              <button class="secondary-button" data-nav="more">训练地图</button>
            </div>
            ${coach.length > 1 ? `
              <div class="hero-coach-next">
                <span>接着</span>
                ${coach.slice(1).map((item, index) => `
                  <button ${item.attrs} data-coach-step>
                    <b>${String(index + 2).padStart(2, '0')}</b>${escapeHtml(item.title)}
                  </button>
                `).join('')}
              </div>
            ` : ''}
          </div>
          <div class="hero-ring-wrap">
            <div class="hero-ring" style="--progress:${progress * 3.6}deg">
              <div class="hero-ring-copy">
                <strong>${counts.total}</strong>
                <span>/ ${profile.dailyGoal} ACTIONS</span>
              </div>
            </div>
          </div>
        </div>

        <div class="stats-row">
          <div class="stat-card"><strong>${learned}</strong><span>已进入记忆系统</span></div>
          <div class="stat-card"><strong>${due}</strong><span>现在到期</span></div>
          <div class="stat-card"><strong>${mastered}</strong><span>长期稳定词</span></div>
          <div class="stat-card"><strong>${accuracy === null ? '—' : `${accuracy}%`}</strong><span>累计主动回忆正确率</span></div>
        </div>

        <div class="home-content">
          <div class="panel panel-pad">
            <div class="panel-head">
              <div><span class="eyebrow">TODAY'S TRAINING</span><h2>今日四项训练</h2><p>每一项都写入同一个学习记录与连续天数。</p></div>
              <strong class="lime">${progress}%</strong>
            </div>
            <div class="mission-list">
              ${missions.map(mission => `
                <button class="mission-item${mission.done ? ' done' : ''}" data-nav="${mission.view}">
                  <span class="mission-icon">${mission.done ? '✓' : escapeHtml(mission.icon)}</span>
                  <span class="mission-copy"><strong>${escapeHtml(mission.title)}</strong><small>${escapeHtml(mission.copy)}</small></span>
                  <span class="mission-time">${mission.time}</span>
                </button>
              `).join('')}
            </div>
          </div>

          <div>
            <div class="panel panel-pad">
              <div class="panel-head">
                <div><span class="eyebrow">CONSISTENCY</span><h2>最近 7 天</h2></div>
                <strong class="gold">${week.reduce((sum, day) => sum + day.count, 0)}</strong>
              </div>
              <div class="week-chart" aria-label="最近七天学习动作">
                ${week.map(day => `
                  <div class="week-day${day.today ? ' today' : ''}" title="${day.key}: ${day.count}">
                    <div class="week-bar-wrap"><div class="week-bar" style="height:${Math.max(4, Math.round((day.count / max) * 100))}%"></div></div>
                    <strong>${day.count || ''}</strong>
                    <small>${day.label}</small>
                  </div>
                `).join('')}
              </div>
            </div>
            <div class="expression-card" style="margin-top:14px">
              <span class="eyebrow">PHRASE OF THE DAY</span>
              <h3>${escapeHtml(phrase.en)}</h3>
              <p>${escapeHtml(phrase.zh)} · ${escapeHtml(phrase.usage)}</p>
              <button class="text-button" style="margin-top:10px" data-action="speak" data-speak="${escapeHtml(phrase.en)}">🔊 听发音</button>
            </div>
          </div>
        </div>

        <div class="section-head">
          <div><h2>词库推进</h2><p>基础高频与考试词分开筛选，不把所有内容混成一团。</p></div>
          <button class="text-button" data-nav="vocab">打开词汇引擎 →</button>
        </div>
        <div class="panel panel-pad">
          <div class="level-meter">
            ${bandProgress().map(band => `
              <div class="level-row">
                <span>${escapeHtml(band.label)}</span>
                <div class="level-track"><div class="level-fill" style="width:${band.percent}%;--band-color:${band.color}"></div></div>
                <span>${band.learned}/${band.total}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `;
  }

  function renderVocab() {
    if (wordSession) {
      renderWordSession();
      return;
    }
    const state = loadState();
    const due = dueWords().length;
    const weak = weakWords().length;
    const filteredWords = bandWords();
    const filteredCount = filteredWords.length;
    const newInBand = filteredWords.filter(word => !state.records[word.id]).length;
    const favorites = Object.keys(state.favorites).length;
    const canTrain = filteredCount > 0;
    app.innerHTML = `
      <section class="view">
        <div class="page-intro">
          <div>
            <span class="eyebrow">VOCABULARY ENGINE</span>
            <h1>不要“看过”，要能主动取出。</h1>
            <p>${due} 个词已经到期，当前分类有 ${filteredCount} 个词、其中 ${newInBand} 个新词。选择提取方式开始；答错会自动进入短周期复习。</p>
          </div>
          <button class="secondary-button" data-nav="dictionary">⌕ 查词库</button>
        </div>

        <section class="vocab-filters panel">
          <div class="vocab-filter-head">
            <div><span class="eyebrow">WORD ATLAS</span><h2>词汇分类</h2></div>
            <strong>${filteredCount} <span>WORDS</span></strong>
          </div>
          <div class="filter-group">
            <span>考试</span>
            <div class="filter-chips">
              ${EXAM_FILTERS.map(item => `<button class="${profile.exam === item.key ? 'active' : ''}" data-vocab-exam="${item.key}">${item.label} <small>${countWordsForFilter('exam', item.key)}</small></button>`).join('')}
            </div>
          </div>
          <div class="filter-group">
            <span>词频</span>
            <div class="filter-chips">
              <button class="${profile.band === 'all' ? 'active' : ''}" data-vocab-band="all">全部 <small>${countWordsForFilter('band', 'all')}</small></button>
              ${Object.entries(VOCAB.bands).map(([key, band]) => `<button class="${profile.band === key ? 'active' : ''}" data-vocab-band="${key}">${escapeHtml(band.label)} <small>${countWordsForFilter('band', key)}</small></button>`).join('')}
            </div>
          </div>
          <div class="filter-group">
            <span>词性</span>
            <div class="filter-chips">
              ${POS_FILTERS.map(item => `<button class="${profile.pos === item.key ? 'active' : ''}" data-vocab-pos="${item.key}">${item.label} <small>${countWordsForFilter('pos', item.key)}</small></button>`).join('')}
            </div>
          </div>
          <div class="filter-group">
            <span>状态</span>
            <div class="filter-chips">
              ${STATUS_FILTERS.map(item => `<button class="${profile.status === item.key ? 'active' : ''}" data-vocab-status="${item.key}">${item.label} <small>${countWordsForFilter('status', item.key)}</small></button>`).join('')}
            </div>
          </div>
        </section>

        ${canTrain ? '' : `
          <div class="filter-empty">
            这个组合暂时没有词。换一个词频、词性或学习状态再开始。
          </div>
        `}

        <div class="vocab-console">
          <div class="panel panel-pad">
            <div class="panel-head">
              <div><span class="eyebrow">CHOOSE YOUR CHALLENGE</span><h2>选择训练方式</h2><p>同一批词，用不同方向提取。</p></div>
            </div>
            <div class="mode-grid">
              <button class="mode-card featured" data-start-word="recall">
                <span class="mode-letter">EN</span><span class="arrow">↗</span>
                <h3>看英文，想中文</h3>
                <p>最核心的阅读理解方向。先回想，再揭晓并按真实难度评分。</p>
              </button>
              <button class="mode-card" data-start-word="recognize">
                <span class="mode-letter">中</span><span class="arrow">↗</span>
                <h3>看中文，提取英文</h3>
                <p>反向回忆更难，能暴露“认识但说不出”的假掌握。</p>
              </button>
              <button class="mode-card" data-start-word="meaning-choice" ${canTrain ? '' : 'disabled'}>
                <span class="mode-letter">EN?</span><span class="arrow">↗</span>
                <h3>看英文，选中文</h3>
                <p>四选一快速辨认。适合新词刚进入记忆系统时建立第一层连接。</p>
              </button>
              <button class="mode-card" data-start-word="english-choice" ${canTrain ? '' : 'disabled'}>
                <span class="mode-letter">中?</span><span class="arrow">↗</span>
                <h3>看中文，选英文</h3>
                <p>从相近词中提取正确英文，训练辨认速度和反向连接。</p>
              </button>
              <button class="mode-card" data-start-word="spelling">
                <span class="mode-letter">A_</span><span class="arrow">↗</span>
                <h3>拼写挑战</h3>
                <p>根据中文释义拼出英文，训练产出与拼写准确度。</p>
              </button>
              <button class="mode-card" data-start-word="listening">
                <span class="mode-letter">)))</span><span class="arrow">↗</span>
                <h3>听音写词</h3>
                <p>只播放读音，不看英文，把语音和拼写重新绑定。</p>
              </button>
            </div>
          </div>

          <div>
            <div class="panel panel-pad">
              <span class="eyebrow">THIS SESSION</span>
              <div class="quick-stack" style="margin-top:15px">
                <div class="quick-stat"><span>每日目标</span><strong>${profile.dailyGoal}</strong></div>
                <div class="quick-stat"><span>当前分类词数</span><strong>${filteredCount}</strong></div>
                <div class="quick-stat"><span>当前分类新词</span><strong>${newInBand}</strong></div>
                <div class="quick-stat"><span>到期复习</span><strong>${due}</strong></div>
                <div class="quick-stat"><span>待巩固错词</span><strong>${weak}</strong></div>
                <div class="quick-stat"><span>重点收藏</span><strong>${favorites}</strong></div>
              </div>
              ${weak ? '<button class="secondary-button wide" style="margin-top:12px" data-nav="review">进入错题与到期复习</button>' : ''}
              ${favorites ? `<button class="secondary-button wide" style="margin-top:9px" data-start-word="focus">复习收藏词 · ${favorites}</button>` : ''}
            </div>
          </div>
        </div>

        <div class="section-head">
          <div><h2>考试词库覆盖</h2><p>点击任一考试切换训练范围，进度按已经进入记忆系统的词计算。</p></div>
        </div>
        <div class="exam-overview-grid">
          ${examProgress().map(exam => `
            <button class="exam-overview-card${profile.exam === exam.key ? ' active' : ''}" data-vocab-exam="${exam.key}">
              <span>${escapeHtml(exam.label)}</span>
              <strong>${exam.percent}%</strong>
              <small>${exam.learned} / ${exam.total} 已学 · ${exam.mastered} 已掌握</small>
              <div class="exam-overview-track"><i style="width:${exam.percent}%"></i></div>
            </button>
          `).join('')}
        </div>

        <div class="section-head">
          <div><h2>阶段掌握度</h2><p>“已接触”不等于“已掌握”，这里显示进入记忆系统的比例。</p></div>
          <button class="text-button" data-open-settings>调整词库阶段 →</button>
        </div>
        <div class="panel panel-pad">
          <div class="level-meter">
            ${bandProgress().map(band => `
              <div class="level-row">
                <span>${escapeHtml(band.label)}</span>
                <div class="level-track"><div class="level-fill" style="width:${band.percent}%;--band-color:${band.color}"></div></div>
                <span>${band.percent}%</span>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `;
  }

  function currentSessionWord() {
    return wordSession && WORD_MAP.get(wordSession.queue[wordSession.index]);
  }

  function currentChoiceWords(word) {
    if (wordSession.choiceWordId !== word.id || !Array.isArray(wordSession.choiceIds)) {
      const candidates = bandWords().filter(candidate =>
        candidate.id !== word.id &&
        candidate.meaning !== word.meaning
      );
      const pool = candidates.length >= 3 ? candidates : WORDS.filter(candidate =>
        candidate.id !== word.id &&
        candidate.meaning !== word.meaning
      );
      const options = [word.id];
      while (options.length < 4 && pool.length) {
        const pick = pool[Math.floor(Math.random() * pool.length)];
        if (!options.includes(pick.id)) options.push(pick.id);
      }
      options.sort(() => Math.random() - 0.5);
      wordSession.choiceWordId = word.id;
      wordSession.choiceIds = options;
      saveWordSession();
    }
    return wordSession.choiceIds.map(id => WORD_MAP.get(id)).filter(Boolean);
  }

  function renderWordSession() {
    if (!wordSession) {
      renderVocab();
      return;
    }
    if (wordSession.index >= wordSession.queue.length) {
      const total = wordSession.queue.length;
      const score = wordSession.correct || wordSession.score || 0;
      const weak = wordSession.weak || 0;
      const nextMode = wordSession.mode === 'focus' ? 'focus' : 'review';
      app.innerHTML = `
        <section class="view session-shell">
          <div class="empty-state panel">
            <div class="empty-symbol">✓</div>
            <span class="eyebrow">SESSION COMPLETE</span>
            <h2>这一轮已经进入记忆系统</h2>
            <p>完成 ${total} 项，主动提取正确 ${score} 项，${weak} 项会优先回到复习队列。</p>
            <div class="button-row">
              <button class="primary-button" data-start-word="${nextMode}">${nextMode === 'focus' ? '继续收藏词训练' : '继续错题复习'}</button>
              <button class="secondary-button" data-exit-session>回到词汇引擎</button>
            </div>
          </div>
        </section>
      `;
      return;
    }
    const word = currentSessionWord();
    const state = loadState();
    const favorite = Boolean(state.favorites[word.id]);
    const mode = wordSession.mode;
    const isTyped = mode === 'spelling' || mode === 'listening';
    const isChoice = mode === 'meaning-choice' || mode === 'english-choice';
    const promptIsMeaning = mode === 'recognize' || isTyped;
    const progress = Math.round((wordSession.index / wordSession.queue.length) * 100);
    let front = '';
    if (wordSession.answered) {
      front = `
        <div class="word-card-word">${escapeHtml(word.word)}</div>
        <div class="word-phonetic">/${escapeHtml(word.phonetic)}/</div>
        <div class="word-pos">${escapeHtml(word.pos)} · #${word.rank}</div>
        ${examBadgeMarkup(word)}
        <div class="word-meaning-reveal">${escapeHtml(word.shortMeaning || word.meaning)}</div>
        <div class="word-card-actions">
          <button class="speak-button" data-action="speak" data-speak="${escapeHtml(word.word)}">🔊 听单词</button>
          <button class="speak-button" data-toggle-favorite="${escapeHtml(word.id)}">${favorite ? '★ 已收藏' : '☆ 收藏'}</button>
        </div>
      `;
    } else if (isChoice) {
      const choiceWords = currentChoiceWords(word);
      front = `
        <span class="eyebrow">${mode === 'meaning-choice' ? 'CHOOSE THE MEANING' : 'CHOOSE THE ENGLISH'}</span>
        <div class="word-card-word${mode === 'english-choice' ? ' meaning' : ''}">${escapeHtml(mode === 'meaning-choice' ? word.word : word.shortMeaning || word.meaning)}</div>
        ${mode === 'meaning-choice' ? `<div class="word-phonetic">/${escapeHtml(word.phonetic)}/</div>` : ''}
        <div class="word-pos">${escapeHtml(word.pos)} · ${escapeHtml(word.bandLabel)} · #${word.rank}</div>
        ${examBadgeMarkup(word)}
        <div class="word-choice-grid">
          ${choiceWords.map(option => `
            <button data-word-choice="${option.id}">${escapeHtml(mode === 'meaning-choice' ? option.shortMeaning || option.meaning : option.word)}</button>
          `).join('')}
        </div>
      `;
    } else if (isTyped) {
      front = `
        <span class="eyebrow">${mode === 'listening' ? 'LISTEN & TYPE' : 'SPELLING CHALLENGE'}</span>
        <div class="word-card-word meaning">${mode === 'listening' ? '听发音，写出单词' : escapeHtml(word.shortMeaning || word.meaning)}</div>
        ${mode === 'listening' ? `<div class="word-card-actions"><button class="speak-button" data-action="speak" data-speak="${escapeHtml(word.word)}">🔊 再听一次</button></div>` : ''}
        <div class="word-band" style="--band-color:${word.bandColor}">${escapeHtml(word.bandLabel)}</div>
      `;
    } else if (wordSession.revealed) {
      front = promptIsMeaning
        ? `<div class="word-card-word">${escapeHtml(word.word)}</div><div class="word-phonetic">/${escapeHtml(word.phonetic)}/</div><div class="word-pos">${escapeHtml(word.pos)} · #${word.rank}</div>${examBadgeMarkup(word)}<div class="word-meaning-reveal">${escapeHtml(word.shortMeaning || word.meaning)}</div><div class="word-card-actions"><button class="speak-button" data-action="speak" data-speak="${escapeHtml(word.word)}">🔊 听发音</button><button class="speak-button" data-toggle-favorite="${escapeHtml(word.id)}">${favorite ? '★ 已收藏' : '☆ 收藏'}</button></div>`
        : `<div class="word-card-word">${escapeHtml(word.word)}</div><div class="word-phonetic">/${escapeHtml(word.phonetic)}/</div><div class="word-meaning-reveal">${escapeHtml(word.shortMeaning || word.meaning)}</div><div class="word-pos">${escapeHtml(word.pos)} · ${escapeHtml(word.bandLabel)}</div><div class="word-card-actions"><button class="speak-button" data-action="speak" data-speak="${escapeHtml(word.word)}">🔊 听发音</button><button class="speak-button" data-toggle-favorite="${escapeHtml(word.id)}">${favorite ? '★ 已收藏' : '☆ 收藏'}</button></div>`;
    } else {
      front = promptIsMeaning
        ? `<span class="eyebrow">RETRIEVE THE ENGLISH</span><div class="word-card-word meaning">${escapeHtml(word.shortMeaning || word.meaning)}</div><div class="word-pos">${escapeHtml(word.pos)} · ${escapeHtml(word.bandLabel)}</div><div class="word-band">先在脑中提取英文</div>`
        : `<span class="eyebrow">RETRIEVE THE MEANING</span><div class="word-card-word">${escapeHtml(word.word)}</div><div class="word-phonetic">/${escapeHtml(word.phonetic)}/</div><div class="word-card-actions"><button class="speak-button" data-action="speak" data-speak="${escapeHtml(word.word)}">🔊 听发音</button></div><div class="word-band" style="--band-color:${word.bandColor}">${escapeHtml(word.bandLabel)} · #${word.rank}</div>`;
    }
    app.innerHTML = `
      <section class="view session-shell">
        <div class="session-top">
          <span class="session-count">${wordSession.index + 1} / ${wordSession.queue.length} · ${sessionModeLabel(mode)}</span>
          <div class="session-top-right">
            <button class="text-button" data-exit-session>退出本轮</button>
          </div>
        </div>
        <div class="session-progress"><div style="width:${progress}%"></div></div>
        <div class="word-card">${front}</div>
        ${wordSession.answered && isChoice ? renderWordChoiceFeedback() : wordSession.answered && !isTyped ? `
          <div class="grade-grid">
            <button class="grade-button again" data-grade="1"><strong>忘记</strong><small>10 分钟后</small></button>
            <button class="grade-button hard" data-grade="3"><strong>困难</strong><small>短间隔</small></button>
            <button class="grade-button good" data-grade="4"><strong>记得</strong><small>正常推进</small></button>
            <button class="grade-button easy" data-grade="5"><strong>很熟</strong><small>拉长间隔</small></button>
          </div>
          <div class="keyboard-hint"><kbd>1</kbd> 忘记 · <kbd>2</kbd> 困难 · <kbd>3</kbd> 记得 · <kbd>4</kbd> 很熟</div>
        ` : isTyped ? renderTypedWordControls() : `
          <div class="typed-actions" style="margin-top:14px">
            <button class="primary-button" data-reveal-word>看答案</button>
            <button class="secondary-button" data-action="speak" data-speak="${escapeHtml(word.word)}">先听发音</button>
          </div>
        `}
      </section>
    `;
  }

  function renderTypedWordControls() {
    if (!wordSession.answered) {
      return `
        <div class="typed-card">
          <input id="word-answer" class="typed-input" type="text" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="输入英文单词">
          <div class="typed-actions">
            <button class="primary-button" data-check-word>检查答案</button>
            <button class="secondary-button" data-reveal-word>不会，显示答案</button>
          </div>
        </div>
      `;
    }
    const word = currentSessionWord();
    const favorite = Boolean(loadState().favorites[word.id]);
    const lastCorrect = Boolean(wordSession.lastCorrect);
    return `
      <div class="feedback ${lastCorrect ? 'good' : 'bad'}">
        <strong>${lastCorrect ? '提取正确' : '这次没有答对'}</strong>
        ${lastCorrect ? '系统已按“记得”安排下一次复习。' : `正确答案是 ${escapeHtml(word.word)}，已进入短周期复习。`}
      </div>
      <div class="typed-actions" style="margin-top:10px">
        <button class="primary-button" data-next-word>下一项</button>
        <button class="secondary-button" data-toggle-favorite="${escapeHtml(word.id)}">${favorite ? '★ 已收藏' : '☆ 收藏这个词'}</button>
      </div>
    `;
  }

  function renderWordChoiceFeedback() {
    const word = currentSessionWord();
    const favorite = Boolean(loadState().favorites[word.id]);
    const lastCorrect = Boolean(wordSession.lastCorrect);
    return `
      <div class="feedback ${lastCorrect ? 'good' : 'bad'}">
        <strong>${lastCorrect ? '选择正确' : '选择错误'}</strong>
        ${lastCorrect ? '连接已经建立。下一项继续保持主动提取。' : `正确答案是 ${escapeHtml(word.word)}：${escapeHtml(word.shortMeaning || word.meaning)}`}
      </div>
      <div class="typed-actions" style="margin-top:10px">
        <button class="primary-button" data-next-word>下一项</button>
        <button class="secondary-button" data-toggle-favorite="${escapeHtml(word.id)}">${favorite ? '★ 已收藏' : '☆ 收藏这个词'}</button>
      </div>
    `;
  }

  function sessionModeLabel(mode) {
    return {
      recall: '看英想中',
      recognize: '看中想英',
      'meaning-choice': '看英选义',
      'english-choice': '看义选词',
      spelling: '拼写',
      listening: '听写',
      review: '错题回炉',
      focus: '收藏专项'
    }[mode] || '训练';
  }

  function revealCurrentWord() {
    if (!wordSession || wordSession.answered) return;
    wordSession.revealed = true;
    wordSession.answered = true;
    saveWordSession();
    renderWordSession();
  }

  function gradeCurrentWord(grade) {
    if (!wordSession || !wordSession.answered) return;
    const word = currentSessionWord();
    reviewWord(word.id, grade);
    wordSession.lastCorrect = grade >= 3;
    if (grade >= 3) wordSession.correct = (wordSession.correct || 0) + 1;
    else wordSession.weak = (wordSession.weak || 0) + 1;
    wordSession.index += 1;
    wordSession.answered = false;
    wordSession.revealed = false;
    wordSession.lastCorrect = null;
    saveWordSession();
    renderWordSession();
  }

  function checkTypedWord() {
    if (!wordSession || wordSession.answered) return;
    const input = document.querySelector('#word-answer');
    const word = currentSessionWord();
    const answer = normalize(input && input.value);
    if (!answer) {
      showToast('先输入答案');
      return;
    }
    wordSession.answered = true;
    wordSession.revealed = true;
    wordSession.lastCorrect = answer === normalize(word.word);
    if (wordSession.lastCorrect) wordSession.correct = (wordSession.correct || 0) + 1;
    else wordSession.weak = (wordSession.weak || 0) + 1;
    reviewWord(word.id, wordSession.lastCorrect ? 4 : 1);
    saveWordSession();
    renderWordSession();
  }

  function chooseWordAnswer(id) {
    if (!wordSession || wordSession.answered) return;
    const word = currentSessionWord();
    wordSession.answered = true;
    wordSession.revealed = true;
    wordSession.lastCorrect = id === word.id;
    if (wordSession.lastCorrect) wordSession.correct = (wordSession.correct || 0) + 1;
    else wordSession.weak = (wordSession.weak || 0) + 1;
    reviewWord(word.id, wordSession.lastCorrect ? 4 : 1);
    saveWordSession();
    renderWordSession();
  }

  function nextWord() {
    if (!wordSession) return;
    wordSession.index += 1;
    wordSession.answered = false;
    wordSession.revealed = false;
    wordSession.lastCorrect = null;
    saveWordSession();
    renderWordSession();
  }

  function renderReview() {
    const state = loadState();
    const weak = weakWords().slice(0, 100);
    const due = dueWords();
    const questionMistakes = questionMistakeList(state);
    const firstQuestionMistake = questionMistakes[0];
    const totalWrong = weak.reduce((sum, word) => sum + state.records[word.id].wrong, 0);
    const firstQuestionAttributes = firstQuestionMistake
      ? firstQuestionMistake.type === 'reading'
        ? `data-open-article="${firstQuestionMistake.sourceId}" data-question-index="${firstQuestionMistake.questionIndex}"`
        : `data-open-lesson="${firstQuestionMistake.sourceId}" data-question-index="${firstQuestionMistake.questionIndex}"`
      : '';
    app.innerHTML = `
      <section class="view">
        <div class="page-intro">
          <div>
            <span class="eyebrow">MEMORY CONTROL</span>
            <h1>复习不是重看，是再次主动取回。</h1>
            <p>系统把到期词和真正答错过的词排在一起。每次正确只会降低风险，不会假装遗忘从未发生。</p>
          </div>
          <div class="button-row">
            <button class="primary-button" data-start-word="review" ${due.length || weak.length ? '' : 'disabled'}>开始词汇复习</button>
            ${firstQuestionMistake ? `<button class="secondary-button" ${firstQuestionAttributes}>回炉语篇错题 · ${questionMistakes.length}</button>` : ''}
          </div>
        </div>
        <div class="review-summary four">
          <div><strong>${due.length}</strong><span>现在到期</span></div>
          <div><strong>${weak.length}</strong><span>错词待巩固</span></div>
          <div><strong>${questionMistakes.length}</strong><span>语篇错题</span></div>
          <div><strong>${totalWrong}</strong><span>词汇错误次数</span></div>
        </div>
        <div class="panel panel-pad">
          <div class="panel-head">
            <div><span class="eyebrow">WEAK SIGNAL</span><h2>优先处理这些词</h2><p>按错误次数和最近表现排序。</p></div>
            <span class="live-pill"><i></i> LIVE QUEUE</span>
          </div>
          ${weak.length ? `
            <div class="word-table">
              ${weak.slice(0, 50).map(word => {
                const record = state.records[word.id];
                return `
                  <div class="word-row">
                    <div class="word-row-main">
                      <div class="word-row-title"><strong>${escapeHtml(word.word)}</strong><span>/${escapeHtml(word.phonetic)}/</span><span>${escapeHtml(word.bandLabel)}</span></div>
                      <div class="word-row-meaning">${escapeHtml(word.meaning)}</div>
                    </div>
                    <div class="word-row-tools">
                      <span class="chip">错 ${record.wrong}</span>
                      <button class="icon-mini" data-action="speak" data-speak="${escapeHtml(word.word)}" aria-label="朗读">🔊</button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          ` : `
            <div class="empty-state" style="min-height:320px">
              <div class="empty-symbol">✓</div>
              <h2>目前没有错词</h2>
              <p>去完成一轮词汇训练或听写，答错的内容会自动进入这里。</p>
              <button class="primary-button" data-start-word="recall">开始词汇训练</button>
            </div>
          `}
        </div>
        <div class="panel panel-pad" id="question-mistakes" style="margin-top:20px">
          <div class="panel-head">
            <div><span class="eyebrow">CONTEXT REPLAY</span><h2>阅读与语法错题</h2><p>回到原题重新作答；答对后，这道题会自动移出回炉队列。</p></div>
            <span class="live-pill"><i></i> ${questionMistakes.length} QUESTIONS</span>
          </div>
          ${questionMistakes.length ? `
            <div class="question-mistake-list">
              ${questionMistakes.map(item => {
                const openAttributes = item.type === 'reading'
                  ? `data-open-article="${item.sourceId}"`
                  : `data-open-lesson="${item.sourceId}"`;
                return `
                  <button class="question-mistake-row" ${openAttributes} data-question-index="${item.questionIndex}">
                    <span class="question-mistake-type">${item.type === 'reading' ? 'READ' : 'GRAMMAR'}</span>
                    <span class="question-mistake-copy">
                      <strong>${escapeHtml(item.source.title)}</strong>
                      <small>第 ${item.questionIndex + 1} 题 · ${escapeHtml(item.question.prompt)}</small>
                    </span>
                    <span class="question-mistake-count">错 ${item.wrong} 次</span>
                    <span class="question-mistake-arrow">›</span>
                  </button>
                `;
              }).join('')}
            </div>
          ` : `
            <div class="empty-state" style="min-height:180px">
              <div class="empty-symbol">✓</div>
              <h2>暂时没有语篇错题</h2>
              <p>阅读理解和语法检查中答错的问题会自动收集到这里。</p>
            </div>
          `}
        </div>
      </section>
    `;
  }

  function renderListening() {
    const item = CURRICULUM.listening[listeningIndex];
    const total = CURRICULUM.listening.length;
    app.innerHTML = `
      <section class="view">
        <div class="page-intro">
          <div>
            <span class="eyebrow">LISTEN & SHADOW</span>
            <h1>先把声音听清，再让嘴巴跟上。</h1>
            <p>每句训练分三步：听、写、模仿。听写不要求一次全对，关键是暴露你漏掉的语音细节。</p>
          </div>
          <span class="live-pill"><i></i> ${total} DRILLS</span>
        </div>
        <div class="listen-layout">
          <div class="panel listen-stage">
            <span class="listen-counter">DRILL ${listeningIndex + 1} / ${total} · ${escapeHtml(item.focus)}</span>
            <div class="listen-sentence${listeningRevealed ? '' : ' hidden-text'}">${escapeHtml(item.en)}</div>
            ${listeningRevealed ? `<div class="listen-translation">${escapeHtml(item.zh)}</div>` : `<div class="listen-translation">先不看文字，播放一遍，抓住你能听懂的词。</div>`}
            <div class="listen-controls">
              <button class="primary-button" data-action="speak" data-speak="${escapeHtml(item.en)}">▶ 正常速度</button>
              <button class="secondary-button" data-action="speak-slow" data-speak="${escapeHtml(item.en)}">◐ 慢速</button>
              <button class="secondary-button" data-listening-reveal>${listeningRevealed ? '隐藏文字' : '显示文字'}</button>
            </div>
            <div class="typed-card">
              <input id="listening-answer" class="typed-input" type="text" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="听写整句，或先写关键词">
              <div class="typed-actions">
                <button class="primary-button" data-check-listening>检查听写</button>
                <button class="secondary-button" data-mark-shadowing>完成跟读</button>
              </div>
            </div>
            ${listeningFeedback ? `
              <div class="feedback ${listeningFeedback.score >= 0.65 ? 'good' : 'bad'}">
                <strong>匹配度 ${Math.round(listeningFeedback.score * 100)}%</strong>
                ${listeningFeedback.message}
              </div>
            ` : ''}
            <div class="button-row" style="margin-top:15px">
              <button class="ghost-button" data-listening-prev>← 上一句</button>
              <button class="ghost-button" data-listening-next>下一句 →</button>
            </div>
          </div>
          <div class="listen-side">
            <div class="panel panel-pad">
              <span class="eyebrow">SHADOWING PROTOCOL</span>
              <div class="shadow-steps" style="margin-top:14px">
                <div class="shadow-step"><span>1</span><div>闭眼听一遍，只抓整体节奏和重音。</div></div>
                <div class="shadow-step"><span>2</span><div>再听一遍，写下关键词，随后补齐句子。</div></div>
                <div class="shadow-step"><span>3</span><div>看着文字跟读两遍，尽量贴合停顿与重音。</div></div>
                <div class="shadow-step"><span>4</span><div>隐藏文字，再复述一遍。</div></div>
              </div>
            </div>
            <div class="drill-tip"><strong>本句抓手</strong>${escapeHtml(item.tip)}</div>
            <div class="panel panel-pad">
              <span class="eyebrow">YOUR VOICE</span>
              <p style="margin:12px 0 0;color:var(--muted);font-size:11px;line-height:1.7">朗读不是越快越好。先保证词尾辅音、句子重音和停顿清楚，再提升速度。</p>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function listeningSimilarity(answer, expected) {
    const answerWords = normalize(answer).split(' ').filter(Boolean);
    const expectedWords = normalize(expected).split(' ').filter(Boolean);
    if (!answerWords.length || !expectedWords.length) {
      return { score: 0, missing: expectedWords };
    }
    const previous = new Array(expectedWords.length + 1).fill(0);
    for (const answerWord of answerWords) {
      let diagonal = 0;
      for (let index = 1; index <= expectedWords.length; index += 1) {
        const old = previous[index];
        previous[index] = answerWord === expectedWords[index - 1]
          ? diagonal + 1
          : Math.max(previous[index], previous[index - 1]);
        diagonal = old;
      }
    }
    const matched = previous[expectedWords.length];
    const recall = matched / expectedWords.length;
    const precision = matched / answerWords.length;
    const remaining = new Map();
    answerWords.forEach(word => remaining.set(word, (remaining.get(word) || 0) + 1));
    const missing = expectedWords.filter(word => {
      const count = remaining.get(word) || 0;
      if (count > 0) {
        remaining.set(word, count - 1);
        return false;
      }
      return true;
    });
    return {
      score: clamp(recall * 0.8 + precision * 0.2, 0, 1),
      missing: [...new Set(missing)]
    };
  }

  function checkListening() {
    const input = document.querySelector('#listening-answer');
    const item = CURRICULUM.listening[listeningIndex];
    const result = listeningSimilarity(input && input.value, item.en);
    const score = result.score;
    const missingText = result.missing.length
      ? ` 还需要补上：${result.missing.slice(0, 5).join('、')}。`
      : score < 0.85
        ? ' 单词大多找到了，但顺序或搭配仍与原句不一致。'
        : '';
    listeningRevealed = true;
    listeningFeedback = {
      score,
      message: score >= 0.85
        ? `整句结构基本完整。再跟读两遍，把弱读和连读变成习惯。${missingText}`
        : score >= 0.5
          ? `你抓住了部分内容。注意对照原句，重点补上漏掉的词和词尾。${missingText}`
          : `这次漏掉较多。先慢速听两遍，再逐段写，不要一次追完整句。${missingText}`
    };
    markActivity('listen', listeningIndex);
    renderListening();
  }

  function moveListening(delta) {
    listeningIndex = (listeningIndex + delta + CURRICULUM.listening.length) % CURRICULUM.listening.length;
    listeningRevealed = false;
    listeningFeedback = null;
    renderListening();
  }

  function speechRecognitionClass() {
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  }

  function renderSpeaking() {
    const item = CURRICULUM.speaking[speakingIndex];
    const supported = Boolean(speechRecognitionClass());
    app.innerHTML = `
      <section class="view">
        <div class="page-intro">
          <div>
            <span class="eyebrow">SPEAKING LAB</span>
            <h1>不追求完美口音，先做到信息完整。</h1>
            <p>按提示连续说 30–60 秒。浏览器只在本地识别你的声音；评分是流利度参考，不是专业口语分数。</p>
          </div>
          <span class="live-pill"><i></i> ${CURRICULUM.speaking.length} PROMPTS</span>
        </div>
        <div class="speak-layout">
          <div class="panel speaking-card">
            <span class="eyebrow">PROMPT ${speakingIndex + 1} / ${CURRICULUM.speaking.length}</span>
            <div class="speaking-prompt">${escapeHtml(item.prompt)}</div>
            <div class="speaking-zh">${escapeHtml(item.zh)}</div>
            <div class="speaking-frame">${escapeHtml(item.frame)}</div>
            <div class="button-row">
              <button class="record-button${speakingRecording ? ' recording' : ''}" data-action="record-speaking">
                <span>${speakingRecording ? '■' : '●'}</span>${speakingRecording ? '停止录音' : supported ? '开始说' : '当前浏览器不支持语音识别'}
              </button>
              <button class="secondary-button" data-action="speak" data-speak="${escapeHtml(item.prompt)}">🔊 听题目</button>
            </div>
            ${speakingResult ? `
              <div class="transcript-box">${escapeHtml(speakingResult.transcript || '没有识别到清晰语音。换一个安静环境，靠近麦克风再试。')}</div>
              <div class="metric-grid">
                <div class="metric"><strong>${speakingResult.words}</strong><span>识别词数</span></div>
                <div class="metric"><strong>${speakingResult.wpm}</strong><span>词 / 分钟</span></div>
                <div class="metric"><strong>${speakingResult.score}</strong><span>完整度参考</span></div>
              </div>
              <div class="feedback ${speakingResult.score >= 65 ? 'good' : ''}">
                <strong>${speakingResult.feedback}</strong>
                这里评估的是“是否持续输出、句子是否成形”，不能替代人工发音纠音。
              </div>
            ` : ''}
          </div>
          <div class="listen-side">
            <div class="drill-tip"><strong>本次抓手</strong>${escapeHtml(item.tips)}</div>
            <div class="panel panel-pad">
              <span class="eyebrow">SPEAKING RULES</span>
              <div class="shadow-steps" style="margin-top:14px">
                <div class="shadow-step"><span>1</span><div>先用框架说完整，不中途停下来改语法。</div></div>
                <div class="shadow-step"><span>2</span><div>卡住时换简单词，不要让句子停住。</div></div>
                <div class="shadow-step"><span>3</span><div>回看转写，只挑一个最影响理解的错误修正。</div></div>
                <div class="shadow-step"><span>4</span><div>再说一遍，目标比上一轮更连贯。</div></div>
              </div>
            </div>
            <div class="button-row">
              <button class="ghost-button" data-speaking-prev>← 上一题</button>
              <button class="ghost-button" data-speaking-next>下一题 →</button>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function startSpeakingRecognition() {
    const Recognition = speechRecognitionClass();
    if (!Recognition) {
      showToast('请使用 Safari 最新版或 Chrome 体验语音识别');
      return;
    }
    if (speakingRecording) {
      if (speakingRecognition) speakingRecognition.stop();
      return;
    }
    speakingResult = null;
    speakingStartedAt = Date.now();
    speakingRecording = true;
    const recognition = new Recognition();
    speakingRecognition = recognition;
    recognition.lang = profile.accent;
    recognition.continuous = true;
    recognition.interimResults = true;
    let transcript = '';
    recognition.onresult = event => {
      transcript = Array.from(event.results).map(result => result[0].transcript).join(' ');
    };
    recognition.onerror = event => {
      speakingRecording = false;
      if (event.error !== 'no-speech') showToast(`语音识别未完成：${event.error}`);
      renderSpeaking();
    };
    recognition.onend = () => {
      speakingRecording = false;
      const seconds = Math.max(1, (Date.now() - speakingStartedAt) / 1000);
      const words = normalize(transcript).split(' ').filter(Boolean).length;
      const wpm = words ? Math.round((words / seconds) * 60) : 0;
      const score = clamp(Math.round(
        Math.min(1, words / 30) * 55 +
        Math.min(1, seconds / 20) * 20 +
        (words >= 8 ? 15 : 5)
      ), 0, 95);
      speakingResult = {
        transcript: transcript.trim(),
        words,
        wpm,
        score,
        feedback: words >= 30
          ? '输出长度不错，信息量足够。下一步注意少用填充词，让句子更集中。'
          : words >= 12
            ? '已经形成连续表达。下一轮尝试多给一个原因或例子。'
            : '输出偏短。先用提示框架补成 3–4 句，不要只回答一个词。'
      };
      markActivity('speak', speakingIndex);
      renderSpeaking();
    };
    try {
      recognition.start();
      renderSpeaking();
    } catch {
      speakingRecording = false;
      showToast('无法启动麦克风，请检查浏览器权限');
    }
  }

  function moveSpeaking(delta) {
    speakingIndex = (speakingIndex + delta + CURRICULUM.speaking.length) % CURRICULUM.speaking.length;
    speakingResult = null;
    renderSpeaking();
  }

  function renderReading() {
    if (readingState) {
      renderArticle();
      return;
    }
    const state = loadState();
    app.innerHTML = `
      <section class="view">
        <div class="page-intro">
          <div>
            <span class="eyebrow">EXTENSIVE READING</span>
            <h1>读故事，不从第一页背词典。</h1>
            <p>每篇文章都能点词查义。先理解整体，再处理生词和题目；不要一开始就逐词翻译。</p>
          </div>
          <span class="live-pill"><i></i> ${CURRICULUM.reading.length} ARTICLES</span>
        </div>
        <div class="article-grid">
          ${CURRICULUM.reading.map((article, index) => `
            <button class="article-card" data-open-article="${article.id}" data-index="${String(index + 1).padStart(2, '0')}">
              <div class="article-meta"><span>${escapeHtml(article.level)}</span><span>·</span><span>${escapeHtml(article.topic)}</span><span>·</span><span>${escapeHtml(article.time)}</span>${state.articles[article.id] ? '<span>· ✓ 已完成</span>' : ''}</div>
              <h3>${escapeHtml(article.title)}</h3>
              <p>${escapeHtml(article.paragraphs[0].slice(0, 105))}…</p>
            </button>
          `).join('')}
        </div>
      </section>
    `;
  }

  function tokenizeArticle(text) {
    return text.split(/([A-Za-z]+(?:['’-][A-Za-z]+)*)/g).map(part => {
      if (!/^[A-Za-z]/.test(part)) return escapeHtml(part);
      const key = part.toLowerCase().replace('’', "'");
      return `<button class="lookup-word" data-lookup-word="${escapeHtml(key)}">${escapeHtml(part)}</button>`;
    }).join('');
  }

  function findDictionaryEntry(form) {
    const key = String(form || '').toLowerCase().replace('’', "'");
    const exact = BY_WORD.get(key);
    if (exact) return { entry: exact, form: key };
    const candidates = [];
    const add = value => {
      if (value && value.length >= 2 && !candidates.includes(value)) candidates.push(value);
    };
    if (key.endsWith("'s")) add(key.slice(0, -2));
    if (key.endsWith('ies')) add(`${key.slice(0, -3)}y`);
    if (key.endsWith('ied')) add(`${key.slice(0, -3)}y`);
    if (key.endsWith('ed')) {
      add(key.slice(0, -2));
      add(key.slice(0, -1));
      if (/([b-df-hj-np-tv-z])\1ed$/.test(key)) add(key.slice(0, -3));
    }
    if (key.endsWith('ing')) {
      add(key.slice(0, -3));
      add(`${key.slice(0, -3)}e`);
      if (/([b-df-hj-np-tv-z])\1ing$/.test(key)) add(key.slice(0, -4));
    }
    if (key.endsWith('es')) add(key.slice(0, -2));
    if (key.endsWith('s')) add(key.slice(0, -1));
    const entry = candidates.map(candidate => BY_WORD.get(candidate)).find(Boolean);
    return entry ? { entry, form: key } : null;
  }

  function renderArticle() {
    const article = CURRICULUM.reading.find(item => item.id === readingState.id);
    if (!article) {
      readingState = null;
      renderReading();
      return;
    }
    const lookupResult = readingState.lookup ? findDictionaryEntry(readingState.lookup) : null;
    const lookup = lookupResult && lookupResult.entry;
    const state = loadState();
    const completed = Boolean(state.articles[article.id]);
    const favorite = Boolean(lookup && state.favorites[lookup.id]);
    const focusQuestion = Number.isInteger(readingState.focusQuestion)
      ? readingState.focusQuestion
      : null;
    app.innerHTML = `
      <section class="view">
        <div class="session-top">
          <button class="text-button" data-close-article>← 返回阅读列表</button>
          <span class="session-count">${escapeHtml(article.level)} · ${escapeHtml(article.topic)} · ${escapeHtml(article.time)} ${completed ? '· ✓ 已完成' : ''}</span>
        </div>
        <div class="article-layout">
          <article class="panel article-body">
            <span class="eyebrow">ARTICLE</span>
            <h1>${escapeHtml(article.title)}</h1>
            <div class="article-text">
              ${article.paragraphs.map(paragraph => `<p>${tokenizeArticle(paragraph)}</p>`).join('')}
            </div>
            <form class="question-block" data-reading-quiz>
              <span class="eyebrow">CHECK UNDERSTANDING</span>
              <h2>理解检查</h2>
              ${article.questions.map((question, qIndex) => `
                <div class="question${focusQuestion === qIndex ? ' focused' : ''}" id="read-question-${qIndex}">
                  <p>${qIndex + 1}. ${escapeHtml(question.prompt)}</p>
                  <div class="option-list">
                    ${question.options.map((option, optionIndex) => {
                      const selected = readingState.answers && readingState.answers[qIndex] === optionIndex;
                      let className = 'option';
                      if (readingState.submitted && optionIndex === question.answer) className += ' correct';
                      if (readingState.submitted && selected && optionIndex !== question.answer) className += ' wrong';
                      return `<label class="${className}"><input type="radio" name="read-${qIndex}" value="${optionIndex}" ${selected ? 'checked' : ''} ${readingState.submitted ? 'disabled' : ''}>${escapeHtml(option)}</label>`;
                    }).join('')}
                  </div>
                  ${readingState.submitted ? `<div class="feedback ${readingState.answers[qIndex] === question.answer ? 'good' : 'bad'}" style="margin-top:9px;padding:11px"><strong>${readingState.answers[qIndex] === question.answer ? '正确' : '需要重看原文'}</strong>${escapeHtml(question.explanation)}</div>` : ''}
                </div>
              `).join('')}
              <div class="button-row" style="margin-top:16px">
                <button class="primary-button" type="submit">${readingState.submitted ? '再次检查' : '提交答案'}</button>
                ${readingState.submitted ? '<button class="secondary-button" type="button" data-reset-reading-quiz>重做题目</button>' : ''}
              </div>
              ${readingState.submitted ? `<div class="feedback good" style="margin-top:13px"><strong>得分 ${readingState.score} / ${article.questions.length}</strong>${readingState.score === article.questions.length ? '整篇理解准确，可以尝试只保留一个生词。' : '回到原文定位证据，不要凭印象改答案。'}</div>` : ''}
            </form>
          </article>
          <aside class="lookup-panel">
            ${lookup ? `
              <span class="eyebrow">WORD LOOKUP</span>
              <h3>${escapeHtml(lookup.word)}</h3>
              ${lookupResult.form !== lookup.word ? `<div class="lookup-form">文中形式 ${escapeHtml(lookupResult.form)} · 对应词条 ${escapeHtml(lookup.word)}</div>` : ''}
              <div class="phonetic">/${escapeHtml(lookup.phonetic)}/</div>
              <div class="word-pos">${escapeHtml(lookup.pos)} · ${escapeHtml(lookup.bandLabel)} · #${lookup.rank}</div>
              ${examBadgeMarkup(lookup)}
              <div class="meaning">${escapeHtml(lookup.meaning)}</div>
              <div class="button-row">
                <button class="speak-button" data-action="speak" data-speak="${escapeHtml(lookup.word)}">🔊 听发音</button>
                <button class="speak-button" data-toggle-favorite="${lookup.id}">${favorite ? '★ 已收藏' : '☆ 收藏'}</button>
              </div>
            ` : `
              <span class="eyebrow">CLICK TO LOOK UP</span>
              <h3 style="margin-top:10px">点正文里的英文词</h3>
              <div class="meaning">先根据上下文猜测意思，再点开确认。这样查词不会打断阅读理解。</div>
              <div class="chip-row">${article.vocabulary.map(word => `<button class="chip" data-lookup-word="${escapeHtml(word.toLowerCase())}">${escapeHtml(word)}</button>`).join('')}</div>
            `}
          </aside>
        </div>
      </section>
    `;
    if (focusQuestion !== null && readingState) {
      const target = document.querySelector(`#read-question-${focusQuestion}`);
      readingState.focusQuestion = null;
      if (target) window.scrollTo({ top: target.offsetTop - 90, behavior: 'smooth' });
    }
  }

  function submitReadingQuiz(form) {
    const article = CURRICULUM.reading.find(item => item.id === readingState.id);
    const data = new FormData(form);
    const answers = {};
    let score = 0;
    article.questions.forEach((question, index) => {
      const value = Number(data.get(`read-${index}`));
      answers[index] = Number.isInteger(value) ? value : -1;
    });
    if (Object.values(answers).includes(-1)) {
      showToast('先完成全部题目再提交');
      return;
    }
    readingState.answers = answers;
    readingState.submitted = true;
    const state = loadState();
    article.questions.forEach((question, index) => {
      const correct = answers[index] === question.answer;
      if (correct) score += 1;
      recordQuestionResult(state, 'reading', article.id, index, correct);
    });
    readingState.score = score;
    state.articles[article.id] = Math.max(Number(state.articles[article.id]) || 0, score);
    saveState(state);
    if (score >= Math.ceil(article.questions.length * 0.67)) markActivity('read', article.id);
    renderArticle();
    window.scrollTo({ top: document.querySelector('.question-block').offsetTop - 90, behavior: 'smooth' });
    showToast(`阅读题得分 ${score} / ${article.questions.length}`);
  }

  function renderGrammar() {
    if (lessonState) {
      renderLesson();
      return;
    }
    const state = loadState();
    app.innerHTML = `
      <section class="view">
        <div class="page-intro">
          <div>
            <span class="eyebrow">GRAMMAR LAB</span>
            <h1>语法不是术语，是句子的承重结构。</h1>
            <p>24 个核心专题，每节只抓一条规则、三个例句和三道即时检查。先理解，再用在说写里。</p>
          </div>
          <span class="live-pill"><i></i> ${CURRICULUM.grammar.length} LESSONS</span>
        </div>
        <div class="more-grid">
          ${CURRICULUM.grammar.map((lesson, index) => `
            <button class="more-card" data-open-lesson="${lesson.id}">
              <span class="nav-icon">${String(index + 1).padStart(2, '0')}</span>
              <div class="article-meta"><span>${lesson.level}</span><span>·</span><span>${state.lessons[lesson.id] ? `✓ ${state.lessons[lesson.id]}/3` : '未完成'}</span></div>
              <h3>${escapeHtml(lesson.title)}</h3>
              <p>${escapeHtml(lesson.summary.slice(0, 74))}…</p>
            </button>
          `).join('')}
        </div>
      </section>
    `;
  }

  function renderLesson() {
    const lesson = CURRICULUM.grammar.find(item => item.id === lessonState.id);
    if (!lesson) {
      lessonState = null;
      renderGrammar();
      return;
    }
    const state = loadState();
    const focusQuestion = Number.isInteger(lessonState.focusQuestion)
      ? lessonState.focusQuestion
      : null;
    app.innerHTML = `
      <section class="view">
        <div class="session-top">
          <button class="text-button" data-close-lesson>← 返回语法列表</button>
          <span class="session-count">GRAMMAR / ${escapeHtml(lesson.level)} / ${state.lessons[lesson.id] ? `最佳 ${state.lessons[lesson.id]}/3` : '尚未完成'}</span>
        </div>
        <div class="lesson-layout">
          <div class="panel lesson-content">
            <span class="eyebrow">CORE RULE</span>
            <h1>${escapeHtml(lesson.title)}</h1>
            <p class="lesson-summary">${escapeHtml(lesson.summary)}</p>
            <div class="formula-box">${escapeHtml(lesson.formula)}</div>
            <div class="example-list">
              ${lesson.examples.map(example => `
                <div class="example">
                  <div><strong>${escapeHtml(example.en)}</strong><span>${escapeHtml(example.zh)}</span></div>
                  <button class="icon-mini" data-action="speak" data-speak="${escapeHtml(example.en)}">🔊</button>
                </div>
              `).join('')}
            </div>
            <form class="question-block" data-lesson-quiz>
              <span class="eyebrow">QUICK CHECK</span>
              <h2>即时检查</h2>
              ${lesson.questions.map((question, qIndex) => `
                <div class="question${focusQuestion === qIndex ? ' focused' : ''}" id="lesson-question-${qIndex}">
                  <p>${qIndex + 1}. ${escapeHtml(question.prompt)}</p>
                  <div class="option-list">
                    ${question.options.map((option, optionIndex) => {
                      const selected = lessonState.answers && lessonState.answers[qIndex] === optionIndex;
                      let className = 'option';
                      if (lessonState.submitted && optionIndex === question.answer) className += ' correct';
                      if (lessonState.submitted && selected && optionIndex !== question.answer) className += ' wrong';
                      return `<label class="${className}"><input type="radio" name="lesson-${qIndex}" value="${optionIndex}" ${selected ? 'checked' : ''} ${lessonState.submitted ? 'disabled' : ''}>${escapeHtml(option)}</label>`;
                    }).join('')}
                  </div>
                  ${lessonState.submitted ? `<div class="feedback ${lessonState.answers[qIndex] === question.answer ? 'good' : 'bad'}" style="margin-top:9px;padding:11px"><strong>${lessonState.answers[qIndex] === question.answer ? '正确' : '再检查规则'}</strong>${escapeHtml(question.explanation)}</div>` : ''}
                </div>
              `).join('')}
              <div class="button-row" style="margin-top:16px">
                <button class="primary-button" type="submit">检查答案</button>
                ${lessonState.submitted ? '<button class="secondary-button" type="button" data-reset-lesson-quiz>重新作答</button>' : ''}
              </div>
              ${lessonState.submitted ? `<div class="feedback good" style="margin-top:13px"><strong>得分 ${lessonState.score} / ${lesson.questions.length}</strong>${lessonState.score >= 2 ? '这一条结构已经能识别。下一步要把它用进自己的句子。' : '回看公式与例句，再答一次。'}</div>` : ''}
            </form>
          </div>
          <aside class="lesson-nav">
            ${CURRICULUM.grammar.map((item, index) => `
              <button class="${item.id === lesson.id ? 'active' : ''}" data-open-lesson="${item.id}">
                <span class="lesson-number">${String(index + 1).padStart(2, '0')}</span>
                <span><strong>${escapeHtml(item.title)}</strong><small>${item.level}</small></span>
                <span>${state.lessons[item.id] ? '✓' : '›'}</span>
              </button>
            `).join('')}
          </aside>
        </div>
      </section>
    `;
    if (focusQuestion !== null && lessonState) {
      const target = document.querySelector(`#lesson-question-${focusQuestion}`);
      lessonState.focusQuestion = null;
      if (target) window.scrollTo({ top: target.offsetTop - 90, behavior: 'smooth' });
    }
  }

  function submitLessonQuiz(form) {
    const lesson = CURRICULUM.grammar.find(item => item.id === lessonState.id);
    const data = new FormData(form);
    const answers = {};
    let score = 0;
    lesson.questions.forEach((question, index) => {
      const value = Number(data.get(`lesson-${index}`));
      answers[index] = Number.isInteger(value) ? value : -1;
    });
    if (Object.values(answers).includes(-1)) {
      showToast('先完成全部题目再检查');
      return;
    }
    lessonState.answers = answers;
    lessonState.submitted = true;
    const state = loadState();
    lesson.questions.forEach((question, index) => {
      const correct = answers[index] === question.answer;
      if (correct) score += 1;
      recordQuestionResult(state, 'grammar', lesson.id, index, correct);
    });
    lessonState.score = score;
    state.lessons[lesson.id] = Math.max(Number(state.lessons[lesson.id]) || 0, score);
    saveState(state);
    if (score >= 2) markActivity('grammar', lesson.id);
    renderLesson();
    window.scrollTo({ top: document.querySelector('.question-block').offsetTop - 90, behavior: 'smooth' });
    showToast(`语法检查 ${score} / ${lesson.questions.length}`);
  }

  function filteredDictionaryWords() {
    const query = normalize(dictionaryState.query);
    return WORDS.filter(word => {
      if (dictionaryState.band !== 'all' && word.band !== dictionaryState.band) return false;
      if (dictionaryState.exam !== 'all' && !word.exams.includes(dictionaryState.exam)) return false;
      if (!query) return true;
      return normalize(word.word).includes(query) || normalize(word.meaning).includes(query);
    });
  }

  function renderDictionary() {
    app.innerHTML = `
      <section class="view">
        <div class="page-intro">
          <div>
            <span class="eyebrow">OFFLINE DICTIONARY</span>
            <h1>查一个词，顺手把它变成记忆。</h1>
            <p>支持英文和中英释义搜索。点 🔊 听标准朗读，点 ☆ 加入重点词，下次词汇训练会优先出现。</p>
          </div>
          <span class="live-pill"><i></i> ${WORDS.length.toLocaleString('en-US')} OFFLINE</span>
        </div>
        <div class="dictionary-toolbar">
          <input id="dictionary-search" class="search-input" type="search" placeholder="搜索 English 或中文释义…" value="${escapeHtml(dictionaryState.query)}">
          <select id="dictionary-band" class="select-control">
            <option value="all">全部阶段</option>
            ${Object.entries(VOCAB.bands).map(([key, band]) => `<option value="${key}" ${dictionaryState.band === key ? 'selected' : ''}>${escapeHtml(band.label)}</option>`).join('')}
          </select>
          <select id="dictionary-exam" class="select-control">
            <option value="all">全部考试</option>
            ${Object.entries(VOCAB.exams || {}).map(([key, label]) => `<option value="${key}" ${dictionaryState.exam === key ? 'selected' : ''}>${escapeHtml(label)}</option>`).join('')}
          </select>
        </div>
        <div class="dictionary-meta"><span id="dictionary-count"></span><span>词序来自真实英文语料频率</span></div>
        <div id="dictionary-results" class="dictionary-list"></div>
        <div id="dictionary-more" class="load-more"></div>
      </section>
    `;
    renderDictionaryResults();
  }

  function renderDictionaryResults() {
    const results = filteredDictionaryWords();
    const visible = results.slice(0, dictionaryState.limit);
    const state = loadState();
    const count = document.querySelector('#dictionary-count');
    const container = document.querySelector('#dictionary-results');
    const more = document.querySelector('#dictionary-more');
    if (!count || !container || !more) return;
    count.textContent = `找到 ${results.length} 个词 · 当前显示 ${visible.length} 个`;
    container.innerHTML = visible.map(word => `
      <div class="word-row">
        <div class="word-row-main">
          <div class="word-row-title"><strong>${escapeHtml(word.word)}</strong><span>/${escapeHtml(word.phonetic)}/</span><span>${escapeHtml(word.pos)}</span><span style="color:${word.bandColor}">${escapeHtml(word.bandLabel)}</span></div>
          ${examBadgeMarkup(word)}
          <div class="word-row-meaning">${escapeHtml(word.meaning)}</div>
        </div>
        <div class="word-row-tools">
          <button class="icon-mini" data-action="speak" data-speak="${escapeHtml(word.word)}" aria-label="朗读">🔊</button>
          <button class="icon-mini" data-toggle-favorite="${word.id}" aria-label="收藏">${state.favorites[word.id] ? '★' : '☆'}</button>
        </div>
      </div>
    `).join('') || '<div class="empty-state" style="min-height:280px"><div class="empty-symbol">⌕</div><h2>没有匹配词条</h2><p>试试更短的英文或中文关键词。</p></div>';
    more.innerHTML = results.length > visible.length
      ? `<button class="secondary-button" data-more-words>再显示 60 个 · 剩余 ${results.length - visible.length}</button>`
      : '';
  }

  function renderProgress() {
    const state = loadState();
    const learned = Object.keys(state.records).length;
    const mastered = Object.values(state.records).filter(record => record.repetition >= 4).length;
    const totalAttempts = Object.values(state.records).reduce(
      (sum, record) => sum + record.correct + record.wrong,
      0
    );
    const correct = Object.values(state.records).reduce((sum, record) => sum + record.correct, 0);
    const accuracy = totalAttempts ? Math.round((correct / totalAttempts) * 100) : null;
    const week = weekly();
    const max = Math.max(1, ...week.map(day => day.count));
    const hardest = weakWords().slice(0, 10);
    const coverage = Math.round((learned / WORDS.length) * 100);
    app.innerHTML = `
      <section class="view">
        <div class="page-intro">
          <div>
            <span class="eyebrow">LEARNING SIGNAL</span>
            <h1>数据只用来决定下一步，不用来制造焦虑。</h1>
            <p>关注持续性、到期复习和主动回忆正确率。词库覆盖率只是范围，不等于掌握。</p>
          </div>
          <button class="secondary-button" data-open-settings>⚙ 数据与设置</button>
        </div>
        <div class="progress-grid">
          <div class="panel panel-pad">
            <div class="panel-head"><div><span class="eyebrow">CORE METRIC</span><h2>整体推进</h2></div></div>
            <div class="mastery-ring" style="--progress:${coverage * 3.6}deg">
              <div><strong>${coverage}%</strong><span>词库已进入记忆系统</span></div>
            </div>
            <div class="review-summary">
              <div><strong>${learned}</strong><span>已接触</span></div>
              <div><strong>${mastered}</strong><span>稳定掌握</span></div>
              <div><strong>${accuracy === null ? '—' : `${accuracy}%`}</strong><span>回忆正确率</span></div>
            </div>
          </div>
          <div class="panel panel-pad">
            <div class="panel-head"><div><span class="eyebrow">ACTIVITY</span><h2>最近 7 天</h2></div><strong class="gold">${week.reduce((sum, day) => sum + day.count, 0)}</strong></div>
            <div class="week-chart">
              ${week.map(day => `<div class="week-day${day.today ? ' today' : ''}"><div class="week-bar-wrap"><div class="week-bar" style="height:${Math.max(4, Math.round((day.count / max) * 100))}%"></div></div><strong>${day.count || ''}</strong><small>${day.label}</small></div>`).join('')}
            </div>
            <div class="bar-list" style="margin-top:23px">
              ${bandProgress().map(band => `<div class="bar-row"><span>${escapeHtml(band.label)}</span><div class="bar-track"><div class="bar-fill" style="width:${band.percent}%;--bar-color:${band.color}"></div></div><span>${band.percent}%</span></div>`).join('')}
            </div>
          </div>
        </div>
        <div class="panel panel-pad" style="margin-top:20px">
          <div class="panel-head">
            <div><span class="eyebrow">WEAK SIGNAL</span><h2>最需要回炉的词</h2><p>错误次数高、正确次数低的词优先出现。</p></div>
            <button class="primary-button small-button" data-nav="review">进入复习</button>
          </div>
          ${hardest.length ? `<div class="word-table">${hardest.map(word => {
            const record = state.records[word.id];
            return `<div class="word-row"><div class="word-row-main"><div class="word-row-title"><strong>${escapeHtml(word.word)}</strong><span>${escapeHtml(word.meaning)}</span></div><div class="word-row-meaning">${escapeHtml(word.bandLabel)} · 下次 ${record.dueAt <= Date.now() ? '现在' : new Date(record.dueAt).toLocaleDateString('zh-CN')}</div></div><div class="word-row-tools"><span class="chip">错 ${record.wrong}</span><button class="icon-mini" data-action="speak" data-speak="${escapeHtml(word.word)}">🔊</button></div></div>`;
          }).join('')}</div>` : '<div class="empty-state" style="min-height:220px"><p>还没有错词记录。</p></div>'}
        </div>
      </section>
    `;
  }

  function renderMore() {
    const items = [
      ['reading', '¶', '分级阅读', '10 篇 A2–B2 文章，点词即查。'],
      ['grammar', '{ }', '语法实验室', '24 个承重结构，配即时检查。'],
      ['dictionary', '⌕', '离线词典', `${WORDS.length.toLocaleString('en-US')} 词的中英释义与发音。`],
      ['review', '↺', '到期复习', '按遗忘曲线处理到期词和错词。'],
      ['progress', '↗', '学习数据', '看清楚什么正在变好。'],
      ['settings', '⚙', '设置与备份', '目标、词库阶段、口音和数据导出。']
    ];
    app.innerHTML = `
      <section class="view">
        <div class="page-intro">
          <div>
            <span class="eyebrow">TRAINING MAP</span>
            <h1>英语能力由多种动作共同构成。</h1>
            <p>今天不必全部做完。选择最薄弱的一项，做十分钟，也比漫无目的地刷一小时更接近目标。</p>
          </div>
        </div>
        <div class="more-grid">
          ${items.map(([view, icon, title, copy]) => `
            <button class="more-card" ${view === 'settings' ? 'data-open-settings' : `data-nav="${view}"`}>
              <span class="nav-icon">${icon}</span>
              <h3>${title}</h3>
              <p>${copy}</p>
            </button>
          `).join('')}
        </div>
      </section>
    `;
  }

  function updateSettingsControls() {
    document.querySelectorAll('[data-daily-goal]').forEach(button => {
      const active = Number(button.dataset.dailyGoal) === profile.dailyGoal;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    document.querySelectorAll('[data-accent]').forEach(button => {
      const active = button.dataset.accent === profile.accent;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    document.querySelectorAll('[data-rate]').forEach(button => {
      const active = Number(button.dataset.rate) === profile.rate;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    document.querySelectorAll('[data-theme-option]').forEach(button => {
      const active = button.dataset.themeOption === theme;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    const level = document.querySelector('#level-setting');
    if (level) level.value = profile.band;
    const goalExplainer = document.querySelector('#goal-explainer');
    if (goalExplainer) goalExplainer.textContent = `${profile.dailyGoal} 个记词、听说读动作计入`;
  }

  function openSettings() {
    updateSettingsControls();
    if (!settingsDialog.open) settingsDialog.showModal();
  }

  function setDailyGoal(goal) {
    if (![10, 20, 30].includes(Number(goal))) return;
    profile.dailyGoal = Number(goal);
    saveProfile();
    updateSettingsControls();
    if (wordSession && wordSession.mode !== 'review') {
      wordSession = null;
      sessionStorage.removeItem(SESSION_KEY);
    }
    if (currentView === 'home' || currentView === 'vocab') render();
    showToast(`每日目标设为 ${profile.dailyGoal} 项`);
  }

  function setBand(band) {
    if (band !== 'all' && !VOCAB.bands[band]) return;
    profile.band = band;
    saveProfile();
    wordSession = null;
    sessionStorage.removeItem(SESSION_KEY);
    if (currentView === 'home' || currentView === 'vocab') render();
  }

  function setVocabClassification(type, value) {
    if (type === 'exam') {
      if (!EXAM_FILTERS.some(item => item.key === value)) return;
      profile.exam = value;
    } else if (type === 'pos') {
      if (!POS_FILTERS.some(item => item.key === value)) return;
      profile.pos = value;
    } else if (type === 'status') {
      if (!STATUS_FILTERS.some(item => item.key === value)) return;
      profile.status = value;
    } else {
      return;
    }
    saveProfile();
    wordSession = null;
    sessionStorage.removeItem(SESSION_KEY);
    renderVocab();
  }

  function setAccent(accent) {
    if (!['en-US', 'en-GB'].includes(accent)) return;
    profile.accent = accent;
    saveProfile();
    updateSettingsControls();
    showToast(accent === 'en-US' ? '已切换为美音' : '已切换为英音');
  }

  function setRate(rate) {
    const value = Number(rate);
    if (![0.72, 0.9, 1.08].includes(value)) return;
    profile.rate = value;
    saveProfile();
    updateSettingsControls();
  }

  function exportLearningData() {
    const payload = {
      app: 'english-forge',
      version: 1,
      exportedAt: new Date().toISOString(),
      profile,
      state: loadState()
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `english-forge-${dateKey()}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('学习记录已导出');
  }

  function normalizeImportedState(imported) {
    const next = defaultState();
    if (imported.records && typeof imported.records === 'object') {
      Object.entries(imported.records).forEach(([id, record]) => {
        const normalized = normalizeRecord(record);
        if (WORD_MAP.has(id) && normalized) next.records[id] = normalized;
      });
    }
    if (imported.favorites && typeof imported.favorites === 'object') {
      Object.entries(imported.favorites).forEach(([id, addedAt]) => {
        if (WORD_MAP.has(id)) next.favorites[id] = Number(addedAt) || Date.now();
      });
    }
    if (imported.activity &&
        imported.activity.date === dateKey() &&
        Array.isArray(imported.activity.items)) {
      next.activity.items = [...new Set(imported.activity.items.filter(item => typeof item === 'string'))];
    }
    if (imported.history && typeof imported.history === 'object') {
      Object.entries(imported.history).forEach(([key, value]) => {
        if (/^\d{4}-\d{2}-\d{2}$/.test(key) && key !== dateKey()) {
          next.history[key] = { count: Math.max(0, Number(value && value.count) || 0) };
        }
      });
    }
    if (imported.streak && typeof imported.streak === 'object') {
      next.streak = {
        current: Math.max(0, Number(imported.streak.current) || 0),
        longest: Math.max(0, Number(imported.streak.longest) || 0),
        lastDate: typeof imported.streak.lastDate === 'string' ? imported.streak.lastDate : ''
      };
    }
    if (imported.lessons && typeof imported.lessons === 'object') {
      Object.entries(imported.lessons).forEach(([id, score]) => {
        if (CURRICULUM.grammar.some(lesson => lesson.id === id)) {
          next.lessons[id] = clamp(Number(score) || 0, 0, 3);
        }
      });
    }
    if (imported.articles && typeof imported.articles === 'object') {
      Object.entries(imported.articles).forEach(([id, score]) => {
        if (CURRICULUM.reading.some(article => article.id === id)) {
          next.articles[id] = clamp(Number(score) || 0, 0, 3);
        }
      });
    }
    if (imported.questionMistakes && typeof imported.questionMistakes === 'object') {
      Object.entries(imported.questionMistakes).forEach(([key, value]) => {
        if (parseQuestionMistakeKey(key) && value && typeof value === 'object') {
          next.questionMistakes[key] = {
            wrong: Math.max(1, Number(value.wrong) || 1),
            lastAt: Math.max(0, Number(value.lastAt) || 0)
          };
        }
      });
    }
    return next;
  }

  function importLearningData(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const payload = JSON.parse(reader.result);
        const imported = payload.state || payload;
        if (!imported || typeof imported !== 'object' || !imported.records) {
          throw new Error('文件缺少学习记录');
        }
        if (!confirm('导入会覆盖当前学习记录，确定继续吗？')) return;
        const next = normalizeImportedState(imported);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        if (payload.profile && typeof payload.profile === 'object') {
          profile = {
            dailyGoal: [10, 20, 30].includes(Number(payload.profile.dailyGoal))
              ? Number(payload.profile.dailyGoal)
              : profile.dailyGoal,
            band: payload.profile.band === 'all' || VOCAB.bands[payload.profile.band]
              ? payload.profile.band
              : profile.band,
            exam: EXAM_FILTERS.some(item => item.key === payload.profile.exam)
              ? payload.profile.exam
              : profile.exam,
            pos: POS_FILTERS.some(item => item.key === payload.profile.pos)
              ? payload.profile.pos
              : profile.pos,
            status: STATUS_FILTERS.some(item => item.key === payload.profile.status)
              ? payload.profile.status
              : profile.status,
            accent: ['en-US', 'en-GB'].includes(payload.profile.accent)
              ? payload.profile.accent
              : profile.accent,
            rate: [0.72, 0.9, 1.08].includes(Number(payload.profile.rate))
              ? Number(payload.profile.rate)
              : profile.rate
          };
          saveProfile();
        }
        stateCache = null;
        stateCacheDate = '';
        wordSession = null;
        sessionStorage.removeItem(SESSION_KEY);
        settingsDialog.close();
        render();
        showToast('学习记录已导入');
      } catch (error) {
        showToast(`导入失败：${error.message}`);
      } finally {
        importInput.value = '';
      }
    };
    reader.readAsText(file);
  }

  function resetAllData() {
    if (!confirm('确定清空全部学习记录吗？此操作无法撤销。')) return;
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    stateCache = null;
    stateCacheDate = '';
    wordSession = null;
    settingsDialog.close();
    render();
    showToast('学习记录已清空');
  }

  document.addEventListener('click', event => {
    const speakButton = event.target.closest('[data-action="speak"]');
    if (speakButton) {
      event.preventDefault();
      speak(speakButton.dataset.speak, profile.rate);
      return;
    }
    const slowSpeakButton = event.target.closest('[data-action="speak-slow"]');
    if (slowSpeakButton) {
      event.preventDefault();
      speak(slowSpeakButton.dataset.speak, Math.min(0.72, profile.rate));
      return;
    }
    const nav = event.target.closest('[data-nav]');
    if (nav) {
      event.preventDefault();
      setView(nav.dataset.nav);
      return;
    }
    const vocabBand = event.target.closest('[data-vocab-band]');
    if (vocabBand) {
      setBand(vocabBand.dataset.vocabBand);
      return;
    }
    const vocabExam = event.target.closest('[data-vocab-exam]');
    if (vocabExam) {
      setVocabClassification('exam', vocabExam.dataset.vocabExam);
      return;
    }
    const vocabPos = event.target.closest('[data-vocab-pos]');
    if (vocabPos) {
      setVocabClassification('pos', vocabPos.dataset.vocabPos);
      return;
    }
    const vocabStatus = event.target.closest('[data-vocab-status]');
    if (vocabStatus) {
      setVocabClassification('status', vocabStatus.dataset.vocabStatus);
      return;
    }
    const startWord = event.target.closest('[data-start-word]');
    if (startWord) {
      activateView('vocab');
      const mode = startWord.dataset.startWord;
      wordSession = restoreWordSession();
      if (!wordSession || wordSession.mode !== mode) startWordSession(mode);
      else renderWordSession();
      return;
    }
    if (event.target.closest('[data-exit-session]')) {
      wordSession = null;
      sessionStorage.removeItem(SESSION_KEY);
      renderVocab();
      return;
    }
    if (event.target.closest('[data-reveal-word]')) {
      revealCurrentWord();
      return;
    }
    const grade = event.target.closest('[data-grade]');
    if (grade) {
      gradeCurrentWord(Number(grade.dataset.grade));
      return;
    }
    if (event.target.closest('[data-check-word]')) {
      checkTypedWord();
      return;
    }
    if (event.target.closest('[data-next-word]')) {
      nextWord();
      return;
    }
    const wordChoice = event.target.closest('[data-word-choice]');
    if (wordChoice) {
      chooseWordAnswer(wordChoice.dataset.wordChoice);
      return;
    }
    const favorite = event.target.closest('[data-toggle-favorite]');
    if (favorite) {
      const active = toggleFavorite(favorite.dataset.toggleFavorite);
      showToast(active ? '已加入重点收藏' : '已取消收藏');
      if (wordSession) renderWordSession();
      else if (currentView === 'dictionary') renderDictionaryResults();
      else if (currentView === 'reading' && readingState) renderArticle();
      return;
    }
    if (event.target.closest('[data-listening-reveal]')) {
      listeningRevealed = !listeningRevealed;
      renderListening();
      return;
    }
    if (event.target.closest('[data-check-listening]')) {
      checkListening();
      return;
    }
    if (event.target.closest('[data-mark-shadowing]')) {
      markActivity('listen', listeningIndex);
      showToast('本句跟读已计入今日训练');
      renderListening();
      return;
    }
    if (event.target.closest('[data-listening-prev]')) {
      moveListening(-1);
      return;
    }
    if (event.target.closest('[data-listening-next]')) {
      moveListening(1);
      return;
    }
    if (event.target.closest('[data-action="record-speaking"]')) {
      startSpeakingRecognition();
      return;
    }
    if (event.target.closest('[data-speaking-prev]')) {
      moveSpeaking(-1);
      return;
    }
    if (event.target.closest('[data-speaking-next]')) {
      moveSpeaking(1);
      return;
    }
    const articleButton = event.target.closest('[data-open-article]');
    if (articleButton) {
      activateView('reading');
      const hasFocusQuestion = articleButton.hasAttribute('data-question-index');
      const focusQuestion = hasFocusQuestion ? Number(articleButton.dataset.questionIndex) : null;
      readingState = {
        id: articleButton.dataset.openArticle,
        lookup: '',
        answers: {},
        submitted: false,
        focusQuestion: Number.isInteger(focusQuestion) ? focusQuestion : null
      };
      renderReading();
      if (!hasFocusQuestion) window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (event.target.closest('[data-close-article]')) {
      readingState = null;
      renderReading();
      return;
    }
    const lookupButton = event.target.closest('[data-lookup-word]');
    if (lookupButton) {
      readingState.lookup = lookupButton.dataset.lookupWord;
      renderArticle();
      return;
    }
    if (event.target.closest('[data-reset-reading-quiz]')) {
      readingState.answers = {};
      readingState.submitted = false;
      readingState.score = 0;
      readingState.focusQuestion = null;
      renderArticle();
      return;
    }
    const lessonButton = event.target.closest('[data-open-lesson]');
    if (lessonButton) {
      activateView('grammar');
      const hasFocusQuestion = lessonButton.hasAttribute('data-question-index');
      const focusQuestion = hasFocusQuestion ? Number(lessonButton.dataset.questionIndex) : null;
      lessonState = {
        id: lessonButton.dataset.openLesson,
        answers: {},
        submitted: false,
        focusQuestion: Number.isInteger(focusQuestion) ? focusQuestion : null
      };
      renderGrammar();
      if (!hasFocusQuestion) window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (event.target.closest('[data-close-lesson]')) {
      lessonState = null;
      renderGrammar();
      return;
    }
    if (event.target.closest('[data-reset-lesson-quiz]')) {
      lessonState.answers = {};
      lessonState.submitted = false;
      lessonState.score = 0;
      lessonState.focusQuestion = null;
      renderLesson();
      return;
    }
    if (event.target.closest('[data-more-words]')) {
      dictionaryState.limit += 60;
      renderDictionaryResults();
      return;
    }
    if (event.target.closest('[data-open-settings]')) {
      openSettings();
      return;
    }
    if (event.target.closest('[data-close-settings]')) {
      settingsDialog.close();
      return;
    }
    const goalButton = event.target.closest('[data-daily-goal]');
    if (goalButton) {
      setDailyGoal(goalButton.dataset.dailyGoal);
      return;
    }
    const accentButton = event.target.closest('[data-accent]');
    if (accentButton) {
      setAccent(accentButton.dataset.accent);
      return;
    }
    const rateButton = event.target.closest('[data-rate]');
    if (rateButton) {
      setRate(rateButton.dataset.rate);
      return;
    }
    const themeButton = event.target.closest('[data-theme-option]');
    if (themeButton) {
      applyTheme(themeButton.dataset.themeOption);
      showToast(themeButton.dataset.themeOption === 'light' ? '已切换为浅色主题' : '已切换为深色主题');
      return;
    }
    if (event.target.closest('[data-export]')) {
      exportLearningData();
      return;
    }
    if (event.target.closest('[data-import]')) {
      importInput.click();
      return;
    }
    if (event.target.closest('[data-reset]')) {
      resetAllData();
    }
  });

  document.addEventListener('submit', event => {
    if (event.target.matches('[data-reading-quiz]')) {
      event.preventDefault();
      submitReadingQuiz(event.target);
    } else if (event.target.matches('[data-lesson-quiz]')) {
      event.preventDefault();
      submitLessonQuiz(event.target);
    }
  });

  document.addEventListener('change', event => {
    if (event.target.id === 'level-setting') {
      setBand(event.target.value);
    }
    if (event.target.id === 'dictionary-band') {
      dictionaryState.band = event.target.value;
      dictionaryState.limit = 60;
      renderDictionaryResults();
    }
    if (event.target.id === 'dictionary-exam') {
      dictionaryState.exam = event.target.value;
      dictionaryState.limit = 60;
      renderDictionaryResults();
    }
  });

  document.addEventListener('input', event => {
    if (event.target.id === 'dictionary-search') {
      dictionaryState.query = event.target.value;
      dictionaryState.limit = 60;
      renderDictionaryResults();
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Enter' && event.target.id === 'word-answer') {
      event.preventDefault();
      checkTypedWord();
    }
    if (event.key === 'Enter' && event.target.id === 'listening-answer') {
      event.preventDefault();
      checkListening();
    }
    if (!wordSession ||
        settingsDialog.open ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(event.target.tagName)) {
      return;
    }
    if (wordSession.index >= wordSession.queue.length) return;
    const isTyped = wordSession.mode === 'spelling' || wordSession.mode === 'listening';
    const isChoice = wordSession.mode === 'meaning-choice' || wordSession.mode === 'english-choice';
    if (event.key === ' ' && !wordSession.answered && !isTyped && !isChoice) {
      event.preventDefault();
      revealCurrentWord();
      return;
    }
    if (wordSession.answered && !isTyped && !isChoice) {
      const grade = { 1: 1, 2: 3, 3: 4, 4: 5 }[event.key];
      if (grade) {
        event.preventDefault();
        gradeCurrentWord(grade);
      }
    }
  });

  importInput.addEventListener('change', event => {
    importLearningData(event.target.files && event.target.files[0]);
  });

  window.addEventListener('hashchange', () => {
    const view = viewFromHash();
    if (view !== currentView) setView(view, false);
  });

  window.addEventListener('storage', event => {
    if (event.key === STORAGE_KEY) {
      stateCache = null;
      stateCacheDate = '';
      render();
    }
  });

  document.querySelectorAll('[data-nav]').forEach(button => button.setAttribute('type', 'button'));

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }

  applyTheme(theme, false);
  updateChrome();
  render();
})();
