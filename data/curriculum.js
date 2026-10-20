const q = (prompt, options, answer, explanation) => ({
  prompt,
  options,
  answer,
  explanation
});

const grammar = [
  {
    id: 'be-verbs',
    level: 'A1',
    title: 'be 动词：am / is / are',
    summary: 'be 动词描述身份、状态和位置。I 用 am，he/she/it 用 is，you/we/they 用 are。',
    formula: '主语 + am/is/are + 名词 / 形容词 / 地点',
    examples: [
      { en: 'I am a first-year student.', zh: '我是一名大一学生。' },
      { en: 'She is not in the library.', zh: '她不在图书馆。' },
      { en: 'Are you ready for the presentation?', zh: '你准备好展示了吗？' }
    ],
    questions: [
      q('My brother ___ a doctor.', ['am', 'is', 'are', 'be'], 1, 'My brother 是第三人称单数，用 is。'),
      q('We ___ excited about the trip.', ['am', 'is', 'are', 'be'], 2, 'We 是复数主语，用 are。'),
      q('___ I late for the meeting?', ['Am', 'Is', 'Are', 'Be'], 0, '第一人称 I 与 am 连用。')
    ]
  },
  {
    id: 'present-simple',
    level: 'A1',
    title: '一般现在时：习惯与事实',
    summary: '一般现在时表达长期习惯、规律和客观事实。第三人称单数动词通常加 -s 或 -es。',
    formula: '主语 + 动词原形（第三人称单数 + -s/-es）',
    examples: [
      { en: 'I review vocabulary before breakfast.', zh: '我早饭前复习词汇。' },
      { en: 'She studies in the library every evening.', zh: '她每天晚上在图书馆学习。' },
      { en: 'Water boils at 100°C.', zh: '水在一百摄氏度沸腾。' }
    ],
    questions: [
      q('He ___ to class by bike every day.', ['go', 'goes', 'going', 'went'], 1, '一般现在时中 he 后面的动词用第三人称单数 goes。'),
      q('They ___ English every morning.', ['practices', 'practicing', 'practice', 'practiced'], 2, 'They 后用动词原形 practice。'),
      q('Which sentence describes a habit?', ['I lost my keys yesterday.', 'She reads before bed.', 'They are running now.', 'We will leave tomorrow.'], 1, 'reads before bed 表示长期习惯。')
    ]
  },
  {
    id: 'present-continuous',
    level: 'A2',
    title: '现在进行时：正在发生',
    summary: '现在进行时表示此刻正在发生或近期持续的动作，结构是 be + doing。',
    formula: 'am/is/are + 动词-ing',
    examples: [
      { en: 'I am listening to a podcast now.', zh: '我正在听播客。' },
      { en: 'They are preparing for the exam this week.', zh: '他们这周在为考试做准备。' },
      { en: 'She is not sleeping; she is reading.', zh: '她不是在睡觉，她在读书。' }
    ],
    questions: [
      q('Look! The bus ___.', ['comes', 'is coming', 'came', 'come'], 1, 'Look 提示当前正在发生，用 is coming。'),
      q('What ___ you ___ now?', ['do; do', 'are; doing', 'did; do', 'will; doing'], 1, '现在进行时疑问句为 What are you doing?'),
      q('He ___ his homework at the moment.', ['does', 'do', 'is doing', 'did'], 2, 'at the moment 是现在进行时的常见时间标志。')
    ]
  },
  {
    id: 'past-simple',
    level: 'A2',
    title: '一般过去时：完成的过去动作',
    summary: '一般过去时描述过去某个时间发生并已结束的动作。规则动词加 -ed，不规则动词需单独记忆。',
    formula: '主语 + 动词过去式',
    examples: [
      { en: 'I watched a documentary last night.', zh: '我昨晚看了一部纪录片。' },
      { en: 'She went to the library after class.', zh: '她下课后去了图书馆。' },
      { en: 'We did not finish the project yesterday.', zh: '我们昨天没有完成项目。' }
    ],
    questions: [
      q('They ___ the museum last Sunday.', ['visit', 'visited', 'visiting', 'have visited'], 1, 'last Sunday 明确指向过去，用 visited。'),
      q('Did you ___ the email?', ['seen', 'saw', 'see', 'seeing'], 2, 'Did 后使用动词原形 see。'),
      q('She ___ not call me yesterday.', ['is', 'was', 'did', 'has'], 2, '过去时否定句可用 did not + 动词原形。')
    ]
  },
  {
    id: 'past-continuous',
    level: 'B1',
    title: '过去进行时：过去某一刻正在做',
    summary: '过去进行时描述过去某个时间点正在发生的动作，也常与一般过去时配合，表示一个动作打断另一个动作。',
    formula: 'was/were + 动词-ing',
    examples: [
      { en: 'I was studying when my roommate called.', zh: '室友打电话时，我正在学习。' },
      { en: 'They were walking home at eight last night.', zh: '昨晚八点他们正在走回家。' },
      { en: 'What were you doing at noon?', zh: '中午你在做什么？' }
    ],
    questions: [
      q('At 9 p.m. yesterday, I ___ for the test.', ['study', 'studied', 'was studying', 'have studied'], 2, '明确过去时间点且动作持续，用过去进行时。'),
      q('While they ___ dinner, the lights went out.', ['had', 'were having', 'have', 'are having'], 1, 'While 引导的背景动作常用过去进行时。'),
      q('It ___ raining when I left home.', ['is', 'was', 'were', 'has'], 1, 'It 对应 was，构成 was raining。')
    ]
  },
  {
    id: 'present-perfect',
    level: 'B1',
    title: '现在完成时：过去与现在的联系',
    summary: '现在完成时强调过去发生的动作对现在造成的影响，或从过去持续到现在的经历。',
    formula: 'have/has + 过去分词',
    examples: [
      { en: 'I have just finished my presentation.', zh: '我刚完成展示。' },
      { en: 'She has lived here for three years.', zh: '她已经在这里住了三年。' },
      { en: 'Have you ever tried public speaking?', zh: '你尝试过公开演讲吗？' }
    ],
    questions: [
      q('I ___ this book twice.', ['read', 'have read', 'am reading', 'will read'], 1, 'twice 表示截至目前的经历，用现在完成时。'),
      q('She ___ here since 2024.', ['works', 'worked', 'has worked', 'is working'], 2, 'since 引出起点，常与现在完成时连用。'),
      q('Which time expression fits the present perfect?', ['yesterday', 'last week', 'so far', 'two days ago'], 2, 'so far 表示“到目前为止”，适合现在完成时。')
    ]
  },
  {
    id: 'past-perfect',
    level: 'B2',
    title: '过去完成时：更早的过去',
    summary: '过去完成时表示在过去某一时间或动作之前已经完成的动作，即“过去的过去”。',
    formula: 'had + 过去分词',
    examples: [
      { en: 'The train had left before we arrived.', zh: '我们到达前，火车已经开走了。' },
      { en: 'She had never seen snow until last winter.', zh: '直到去年冬天她才第一次见到雪。' },
      { en: 'I realized I had forgotten my keys.', zh: '我意识到自己忘带钥匙了。' }
    ],
    questions: [
      q('When I got home, she ___ already left.', ['has', 'had', 'was', 'did'], 1, 'left 发生在 got home 之前，用 had left。'),
      q('He told me he ___ the film before.', ['sees', 'saw', 'had seen', 'is seeing'], 2, '主句是过去时，宾语从句中更早的动作可用 had seen。'),
      q('By the end of last term, we ___ ten books.', ['read', 'have read', 'had read', 'are reading'], 2, 'By the end of last term 指过去某时间前已完成，用过去完成时。')
    ]
  },
  {
    id: 'future',
    level: 'A2',
    title: '一般将来时：will 与 be going to',
    summary: 'will 表示临时决定、预测或承诺；be going to 表示已有计划或基于现在证据的预测。',
    formula: 'will + 动词原形 / am/is/are going to + 动词原形',
    examples: [
      { en: 'I will send you the notes tonight.', zh: '我今晚会把笔记发给你。' },
      { en: 'We are going to visit the lab tomorrow.', zh: '我们明天打算参观实验室。' },
      { en: 'Look at those clouds; it is going to rain.', zh: '看那些云，要下雨了。' }
    ],
    questions: [
      q('I have already bought the ticket. I ___ travel on Friday.', ['will', 'am going to', 'am', 'have'], 1, '已经买票说明旅行是既定计划，用 be going to 更自然。'),
      q('Maybe I ___ join you later.', ['am going to', 'will', 'am', 'did'], 1, 'maybe 表示不确定的临时决定，用 will。'),
      q('Look at the sky! It ___.', ['will rain', 'is going to rain', 'rains', 'rained'], 1, '有眼前证据的预测常用 be going to。')
    ]
  },
  {
    id: 'modals',
    level: 'B1',
    title: '情态动词：能力、许可与推测',
    summary: 'can 表能力或许可，must 表强烈义务，should 表建议，may/might 表可能性。情态动词后接动词原形。',
    formula: '主语 + 情态动词 + 动词原形',
    examples: [
      { en: 'You should review your notes before class.', zh: '你应该课前复习笔记。' },
      { en: 'She can solve this problem quickly.', zh: '她能很快解决这个问题。' },
      { en: 'It might be too late to change the plan.', zh: '现在改变计划可能太晚了。' }
    ],
    questions: [
      q('You look tired. You ___ take a break.', ['can', 'should', 'must not', 'may not'], 1, '提出建议用 should。'),
      q('Students ___ use the lab after registration.', ['can', 'must', 'should', 'might'], 0, '表示许可可用 can。'),
      q('The light is on, so she ___ be at home.', ['must', 'can', 'should', 'would'], 0, '根据明显证据作出较肯定推测用 must。')
    ]
  },
  {
    id: 'articles',
    level: 'A2',
    title: '冠词：a / an / the',
    summary: 'a/an 表示首次提及的泛指单数；the 表示双方已知或前文已提及的特定对象。',
    formula: 'a + 辅音音素开头 / an + 元音音素开头 / the + 特指',
    examples: [
      { en: 'I saw a film yesterday. The film was excellent.', zh: '我昨天看了一部电影。那部电影很棒。' },
      { en: 'She is an honest person.', zh: '她是一个诚实的人。' },
      { en: 'The sun rises in the east.', zh: '太阳从东方升起。' }
    ],
    questions: [
      q('He is ___ university student.', ['a', 'an', 'the', '—'], 0, 'university 以辅音音素 /j/ 开头，用 a。'),
      q('I bought a book. ___ book is about climate change.', ['A', 'An', 'The', '—'], 2, '第二次提到同一本书，用 the。'),
      q('It took me ___ hour to finish.', ['a', 'an', 'the', '—'], 1, 'hour 的 h 不发音，以元音音素开头，用 an。')
    ]
  },
  {
    id: 'plurals',
    level: 'A1',
    title: '名词复数与不可数名词',
    summary: '可数名词有单复数。不可数名词通常不加 -s，可用 a piece of、some 等表达数量。',
    formula: '规则复数 + -s/-es；特殊复数需记忆',
    examples: [
      { en: 'There are three classes today.', zh: '今天有三节课。' },
      { en: 'The children are playing outside.', zh: '孩子们正在外面玩。' },
      { en: 'I need some information.', zh: '我需要一些信息。' }
    ],
    questions: [
      q('There are two ___ in the room.', ['child', 'childs', 'children', 'childrens'], 2, 'child 的复数是不规则形式 children。'),
      q('I need some ___ about the course.', ['informations', 'information', 'an information', 'informationes'], 1, 'information 是不可数名词。'),
      q('She bought three ___.', ['tomato', 'tomatos', 'tomatoes', 'tomatoies'], 2, '以 -o 结尾的部分名词加 -es，tomato → tomatoes。')
    ]
  },
  {
    id: 'pronouns',
    level: 'A2',
    title: '代词：主格、宾格与物主代词',
    summary: '主格作主语，宾格作宾语，物主形容词后接名词，物主代词可单独使用。',
    formula: 'I/me/my/mine；you/you/your/yours；he/him/his/his',
    examples: [
      { en: 'She invited me to her study group.', zh: '她邀请我加入她的学习小组。' },
      { en: 'This notebook is mine; yours is on the desk.', zh: '这本笔记本是我的，你的在桌上。' },
      { en: 'We should take care of ourselves.', zh: '我们应该照顾好自己。' }
    ],
    questions: [
      q('Please give the book to ___.', ['I', 'me', 'my', 'mine'], 1, '介词 to 后需要宾格 me。'),
      q('This seat is ___.', ['she', 'her', 'hers', 'herself'], 2, 'hers 是名词性物主代词，可单独作表语。'),
      q('___ finished the project together.', ['Us', 'We', 'Our', 'Ours'], 1, '句子缺少主语，用主格 We。')
    ]
  },
  {
    id: 'adjective-adverb',
    level: 'A2',
    title: '形容词与副词',
    summary: '形容词修饰名词或作系动词表语；副词修饰动词、形容词或整个句子。',
    formula: '形容词 + 名词；动词 + 副词',
    examples: [
      { en: 'She gave a clear explanation.', zh: '她给出了清晰的解释。' },
      { en: 'She explained the idea clearly.', zh: '她清楚地解释了那个想法。' },
      { en: 'The coffee is surprisingly good.', zh: '这咖啡出奇地好。' }
    ],
    questions: [
      q('He speaks English very ___.', ['clear', 'clearly', 'clearness', 'clearest'], 1, '修饰动词 speaks 用副词 clearly。'),
      q('The professor gave us a ___ task.', ['challenging', 'challengingly', 'challenge', 'challenged'], 0, '修饰名词 task 用形容词 challenging。'),
      q('She felt ___ after the exam.', ['tired', 'tiredly', 'tiringly', 'tire'], 0, 'feel 是系动词，后接形容词 tired。')
    ]
  },
  {
    id: 'comparison',
    level: 'A2',
    title: '比较级与最高级',
    summary: '短形容词通常加 -er/-est，长形容词使用 more/most。比较两者用 than，三者及以上用 the + 最高级。',
    formula: 'A + 比较级 + than + B；the + 最高级 + in/of',
    examples: [
      { en: 'This exercise is easier than the last one.', zh: '这道练习比上一道容易。' },
      { en: 'The library is the quietest place on campus.', zh: '图书馆是校园里最安静的地方。' },
      { en: 'Online courses are more flexible than expected.', zh: '网课比预期更灵活。' }
    ],
    questions: [
      q('This task is ___ than the previous one.', ['difficult', 'more difficult', 'most difficult', 'the most difficult'], 1, '两者比较用 more difficult + than。'),
      q('She is the ___ student in our group.', ['careful', 'more careful', 'most careful', 'carefully'], 2, '三者范围中最高级用 the most careful。'),
      q('The weather today is ___ than yesterday.', ['bad', 'worse', 'worst', 'badly'], 1, 'bad 的比较级是不规则形式 worse。')
    ]
  },
  {
    id: 'prepositions',
    level: 'A2',
    title: '时间与地点介词',
    summary: 'in 用于较大时间/空间，on 用于具体日期或表面，at 用于具体时刻或地点。',
    formula: 'in + 年月/大地点；on + 日期/星期；at + 时刻/点',
    examples: [
      { en: 'The lecture starts at nine on Monday.', zh: '讲座周一九点开始。' },
      { en: 'We arrived in Shanghai in September.', zh: '我们九月到达上海。' },
      { en: 'Your phone is on the desk.', zh: '你的手机在桌上。' }
    ],
    questions: [
      q('I will meet you ___ 6 p.m.', ['in', 'on', 'at', 'by'], 2, '具体时刻前用 at。'),
      q('The test is ___ Friday morning.', ['in', 'on', 'at', 'from'], 1, '具体某天早上用 on。'),
      q('She was born ___ 2006.', ['in', 'on', 'at', 'to'], 0, '年份前用 in。')
    ]
  },
  {
    id: 'connectives',
    level: 'B1',
    title: '连词与逻辑连接',
    summary: 'because 表原因，although 表让步，so 表结果，while 可表同时或对比。',
    formula: '主句 + because/although/while + 从句',
    examples: [
      { en: 'I took notes because the lecture was detailed.', zh: '因为讲座很详细，我记了笔记。' },
      { en: 'Although it was raining, we walked to class.', zh: '虽然下雨，我们还是走路去上课。' },
      { en: 'She studies best in the morning, while I prefer late night.', zh: '她早上学习效率高，而我更喜欢深夜。' }
    ],
    questions: [
      q('___ it was late, she kept studying.', ['Because', 'Although', 'So', 'Unless'], 1, '前后为让步关系，用 Although。'),
      q('I missed the bus, ___ I arrived late.', ['because', 'although', 'so', 'while'], 2, '前因后果用 so。'),
      q('We stayed home ___ the weather was terrible.', ['because', 'although', 'so', 'unless'], 0, '后句解释原因，用 because。')
    ]
  },
  {
    id: 'passive',
    level: 'B1',
    title: '被动语态',
    summary: '当重点在动作承受者或动作执行者不重要时使用被动语态。',
    formula: 'be + 过去分词（+ by 执行者）',
    examples: [
      { en: 'The report was written by two students.', zh: '这份报告由两名学生撰写。' },
      { en: 'English is spoken in many countries.', zh: '许多国家使用英语。' },
      { en: 'The results will be announced tomorrow.', zh: '结果将于明天公布。' }
    ],
    questions: [
      q('The bridge ___ in 1998.', ['built', 'was built', 'has building', 'is build'], 1, '桥是被建造的，过去时被动为 was built。'),
      q('The room ___ every morning.', ['cleans', 'is cleaned', 'cleaned', 'is cleaning'], 1, '房间每天被清洁，一般现在时被动为 is cleaned。'),
      q('Which sentence is passive?', ['They solved the problem.', 'The problem was solved.', 'She is solving it.', 'We will solve it.'], 1, 'was solved 是 be + 过去分词构成的被动语态。')
    ]
  },
  {
    id: 'relative-clauses',
    level: 'B1',
    title: '定语从句',
    summary: '定语从句修饰前面的名词。人可用 who/that，物可用 which/that，地点可用 where，时间可用 when。',
    formula: '名词 + who/which/that/where/when + 从句',
    examples: [
      { en: 'The student who sits beside me is from Chengdu.', zh: '坐我旁边的学生来自成都。' },
      { en: 'This is the app that helps me review words.', zh: '这就是帮助我复习单词的应用。' },
      { en: 'The café where we met has closed.', zh: '我们见面的那家咖啡馆已经关门了。' }
    ],
    questions: [
      q('The woman ___ helped me was a librarian.', ['which', 'who', 'where', 'when'], 1, '先行词 woman 指人，用 who。'),
      q('This is the book ___ changed my mind.', ['who', 'where', 'that', 'when'], 2, '先行词 book 指物，用 that。'),
      q('The town ___ I grew up is near the sea.', ['which', 'that', 'where', 'who'], 2, '先行词 town 表地点，从句缺地点状语，用 where。')
    ]
  },
  {
    id: 'adverb-clauses',
    level: 'B2',
    title: '状语从句：时间、条件与让步',
    summary: 'when/while 表时间，if/unless 表条件，although/even though 表让步。主句将来时，从句通常用现在时。',
    formula: 'when/if/unless/although + 从句, 主句',
    examples: [
      { en: 'If you review daily, you will remember more.', zh: '如果每天复习，你会记得更多。' },
      { en: 'Unless we leave now, we will miss the train.', zh: '除非现在出发，否则我们会错过火车。' },
      { en: 'Even though the topic was hard, the lecture was clear.', zh: '尽管主题很难，讲座仍然很清楚。' }
    ],
    questions: [
      q('If it ___ tomorrow, we will stay inside.', ['will rain', 'rains', 'rained', 'is raining'], 1, '条件状语从句中通常用一般现在时表示将来。'),
      q('___ you practice, you will not improve.', ['If', 'Unless', 'Although', 'When'], 1, 'Unless = if not，表示“除非”。'),
      q('She kept smiling ___ she was nervous.', ['because', 'even though', 'so that', 'unless'], 1, '前后为让步关系，用 even though。')
    ]
  },
  {
    id: 'noun-clauses',
    level: 'B2',
    title: '名词性从句',
    summary: '名词性从句可以在句中作主语、宾语或表语，常用 that、whether、what 引导。',
    formula: 'that/whether/what + 从句',
    examples: [
      { en: 'What she said surprised everyone.', zh: '她说的话让大家很惊讶。' },
      { en: 'I do not know whether he will come.', zh: '我不知道他是否会来。' },
      { en: 'The truth is that practice matters most.', zh: '事实是练习最重要。' }
    ],
    questions: [
      q('___ he passed the exam made us happy.', ['What', 'That', 'Whether', 'Which'], 1, '完整陈述句作主语，用 That。'),
      q('I am not sure ___ she can join us.', ['that', 'whether', 'what', 'which'], 1, '表示不确定“是否”，用 whether。'),
      q('___ you need is a clear plan.', ['That', 'Whether', 'What', 'If'], 2, '从句缺宾语，用 What。')
    ]
  },
  {
    id: 'infinitives',
    level: 'B1',
    title: '动词不定式',
    summary: 'to + 动词原形可表示目的、计划或补足某些动词的宾语。',
    formula: 'to + 动词原形',
    examples: [
      { en: 'I opened the app to review ten words.', zh: '我打开应用复习十个单词。' },
      { en: 'She decided to join the debate club.', zh: '她决定加入辩论社。' },
      { en: 'It is useful to take short breaks.', zh: '短暂休息很有用。' }
    ],
    questions: [
      q('I went online ___ a train ticket.', ['buy', 'buying', 'to buy', 'bought'], 2, '表示目的用不定式 to buy。'),
      q('She wants ___ abroad next year.', ['study', 'studying', 'to study', 'studied'], 2, 'want 后接不定式 to study。'),
      q('It is important ___ regularly.', ['review', 'to review', 'reviewing', 'reviewed'], 1, 'It is + 形容词 + to do 是常见结构。')
    ]
  },
  {
    id: 'gerunds',
    level: 'B1',
    title: '动名词：动词作名词',
    summary: '动词-ing 可以作主语、宾语或介词宾语。部分动词后只接动名词。',
    formula: 'verb-ing 作主语/宾语/介词宾语',
    examples: [
      { en: 'Reading aloud improves pronunciation.', zh: '大声朗读能改善发音。' },
      { en: 'I enjoy learning new expressions.', zh: '我喜欢学习新表达。' },
      { en: 'She is good at explaining difficult ideas.', zh: '她擅长解释困难的概念。' }
    ],
    questions: [
      q('I enjoy ___ to music while studying.', ['listen', 'to listen', 'listening', 'listened'], 2, 'enjoy 后接动名词。'),
      q('___ daily is the best way to build fluency.', ['Practice', 'To practicing', 'Practicing', 'Practiced'], 2, '动名词 Practicing 可作主语。'),
      q('He is interested in ___ psychology.', ['study', 'studying', 'to study', 'studied'], 1, '介词 in 后接动名词。')
    ]
  },
  {
    id: 'subjunctive',
    level: 'C1',
    title: '虚拟语气',
    summary: '虚拟语气表达与事实相反的假设、愿望或建议。真实过去条件用过去完成时，结果用 would have done。',
    formula: 'If + had done, would have done / If + did, would do',
    examples: [
      { en: 'If I had started earlier, I would have finished.', zh: '如果我早点开始，就完成了。' },
      { en: 'If I were you, I would ask the professor.', zh: '如果我是你，我会问教授。' },
      { en: 'It is essential that everyone be prepared.', zh: '每个人都做好准备是必要的。' }
    ],
    questions: [
      q('If I ___ more time, I would learn another language.', ['have', 'had', 'will have', 'am having'], 1, '与现在事实相反，if 从句用一般过去时。'),
      q('If she had studied harder, she ___ the exam.', ['passed', 'would pass', 'would have passed', 'has passed'], 2, '与过去事实相反，主句用 would have done。'),
      q('If I ___ you, I would apologize.', ['am', 'was', 'were', 'be'], 2, '虚拟语气中常用 If I were you。')
    ]
  },
  {
    id: 'sentence-structure',
    level: 'B2',
    title: '长难句拆解：找主干',
    summary: '先找主语和谓语，再处理介词短语、从句与插入语。不要被长度吓到，主干通常只有几个词。',
    formula: '主语 + 谓语 + 宾语/表语；修饰成分可暂时括起',
    examples: [
      { en: 'The study, which lasted three years, found that regular sleep improved memory.', zh: '这项持续三年的研究发现，规律睡眠能改善记忆。' },
      { en: 'Students who review actively tend to remember more.', zh: '主动复习的学生往往记得更多。' },
      { en: 'What matters is not speed but consistency.', zh: '重要的不是速度，而是持续性。' }
    ],
    questions: [
      q('In “The book on the desk belongs to Anna”, what is the main verb?', ['book', 'desk', 'belongs', 'Anna'], 2, '主干是 The book belongs to Anna，谓语为 belongs。'),
      q('In “What she said surprised me”, what is the subject?', ['What', 'she', 'What she said', 'me'], 2, '名词性从句 What she said 整体作主语。'),
      q('Which part can often be removed first when parsing a long sentence?', ['subject', 'main verb', 'inserted phrase', 'object'], 2, '插入语通常可先括起，不影响主干判断。')
    ]
  }
];

const paragraphs = (...items) => items;
const reading = [
  {
    id: 'first-week',
    level: 'A2',
    title: 'The First Week at University',
    topic: '校园生活',
    time: '3 min',
    paragraphs: paragraphs(
      'Mia arrived at university with two heavy bags and a long list of worries. She did not know where her classrooms were, and she was afraid of speaking in front of new people.',
      'On the first morning, she sat alone in the dining hall. A student named Leo asked if he could share her table. They discovered that they were taking the same English course. Leo showed her a map of the campus and introduced her to two classmates.',
      'By Friday, Mia still felt nervous, but she had made a study group and learned the names of three buildings. She realized that confidence often comes after action, not before it.'
    ),
    text: 'Mia arrived at university with two heavy bags and a long list of worries. She did not know where her classrooms were, and she was afraid of speaking in front of new people. On the first morning, she sat alone in the dining hall. A student named Leo asked if he could share her table. They discovered that they were taking the same English course. Leo showed her a map of the campus and introduced her to two classmates. By Friday, Mia still felt nervous, but she had made a study group and learned the names of three buildings. She realized that confidence often comes after action, not before it.',
    vocabulary: ['confidence', 'discover', 'introduce', 'nervous'],
    questions: [
      q('Why did Mia feel worried at first?', ['She lost her bags.', 'She was unfamiliar with the campus and people.', 'She failed an exam.', 'She missed the bus.'], 1, '第一段说明她不熟悉教室位置，也害怕在新朋友面前说话。'),
      q('Who helped Mia on her first morning?', ['A professor', 'Her sister', 'A student named Leo', 'A librarian'], 2, '第二段写 Leo 与她同桌并介绍同学。'),
      q('What is the main lesson of the story?', ['University is always easy.', 'Action can build confidence.', 'Never eat alone.', 'Maps are useless.'], 1, '结尾直接点明 confidence often comes after action。')
    ]
  },
  {
    id: 'procrastination',
    level: 'B1',
    title: 'Why We Procrastinate',
    topic: '学习心理',
    time: '4 min',
    paragraphs: paragraphs(
      'Procrastination is often mistaken for laziness. In reality, it is usually an attempt to escape negative feelings. A difficult assignment may make us feel anxious, bored, or afraid of failing, so we look for something that provides immediate relief.',
      'The problem is that avoidance makes the task feel even larger. When we return to it later, we have less time and more stress. This creates a cycle in which we delay again to escape the discomfort.',
      'One effective strategy is to reduce the size of the first step. Instead of planning to write an essay, decide to open the document and write one sentence. Once we begin, the task often becomes less frightening. Self-compassion also helps: accepting a imperfect start is easier than demanding a perfect performance.'
    ),
    text: 'Procrastination is often mistaken for laziness. In reality, it is usually an attempt to escape negative feelings. A difficult assignment may make us feel anxious, bored, or afraid of failing, so we look for something that provides immediate relief. The problem is that avoidance makes the task feel even larger. When we return to it later, we have less time and more stress. This creates a cycle in which we delay again to escape the discomfort. One effective strategy is to reduce the size of the first step. Instead of planning to write an essay, decide to open the document and write one sentence. Once we begin, the task often becomes less frightening. Self-compassion also helps: accepting an imperfect start is easier than demanding a perfect performance.',
    vocabulary: ['procrastination', 'avoidance', 'relief', 'strategy'],
    questions: [
      q('What is procrastination mainly described as?', ['A sign of laziness', 'An emotional escape', 'A physical illness', 'A learning method'], 1, '文章指出拖延通常是逃避负面情绪。'),
      q('Why does delaying make the task harder?', ['It removes the deadline.', 'It leaves less time and more stress.', 'It makes the task shorter.', 'It improves concentration.'], 1, '第二段说明拖延后时间更少、压力更大。'),
      q('Which strategy does the article recommend?', ['Wait until you feel confident', 'Make the first step tiny', 'Finish everything in one day', 'Avoid imperfect work'], 1, '文章建议把第一步缩小，例如先写一句话。')
    ]
  },
  {
    id: 'car-free-city',
    level: 'B1',
    title: 'A City Without Cars',
    topic: '城市与环境',
    time: '4 min',
    paragraphs: paragraphs(
      'In the center of Pontevedra, Spain, private cars are largely restricted. The city redesigned its streets for pedestrians, bicycles, and public transport. Traffic that once filled the historic center now moves around its edge.',
      'Supporters say the change has improved safety and reduced noise. Shops have more customers because people can walk freely between them. Children can play outside with less danger, and residents spend more time in public spaces.',
      'However, not every place can copy the model easily. Cities with widely spread populations may depend on cars for daily travel. The lesson is not that every street must be car-free, but that careful design can give people more choices.'
    ),
    text: 'In the center of Pontevedra, Spain, private cars are largely restricted. The city redesigned its streets for pedestrians, bicycles, and public transport. Traffic that once filled the historic center now moves around its edge. Supporters say the change has improved safety and reduced noise. Shops have more customers because people can walk freely between them. Children can play outside with less danger, and residents spend more time in public spaces. However, not every place can copy the model easily. Cities with widely spread populations may depend on cars for daily travel. The lesson is not that every street must be car-free, but that careful design can give people more choices.',
    vocabulary: ['pedestrian', 'restrict', 'resident', 'transport'],
    questions: [
      q('What changed in Pontevedra’s center?', ['Cars were made faster.', 'Private cars were mostly restricted.', 'All shops closed.', 'Public transport stopped.'], 1, '文章开头说明私人汽车在市中心受到严格限制。'),
      q('What is one benefit mentioned?', ['More traffic noise', 'Less public space', 'Safer streets', 'Fewer pedestrians'], 2, '支持者认为安全提高、噪音减少。'),
      q('What is the broader lesson?', ['Every city must ban cars.', 'Car-free design is always simple.', 'Good design can expand travel choices.', 'Only tourists benefit.'], 2, '结尾强调不是所有街道都必须无车，而是精心设计能提供更多选择。')
    ]
  },
  {
    id: 'sleep-memory',
    level: 'B1',
    title: 'The Science of Sleep and Memory',
    topic: '科学与健康',
    time: '4 min',
    paragraphs: paragraphs(
      'Sleep is not simply a period when the brain switches off. During sleep, the brain organizes information collected during the day. Some memories are strengthened, while less important details are gradually forgotten.',
      'Researchers have found that both deep sleep and REM sleep contribute to memory. Deep sleep appears to help store factual information, while REM sleep may support the integration of ideas and emotional processing.',
      'For students, this means that all-night study is often inefficient. A shorter session followed by good sleep can lead to better recall than many hours of exhausted repetition. Reviewing material before bed may create a useful bridge between learning and sleep.'
    ),
    text: 'Sleep is not simply a period when the brain switches off. During sleep, the brain organizes information collected during the day. Some memories are strengthened, while less important details are gradually forgotten. Researchers have found that both deep sleep and REM sleep contribute to memory. Deep sleep appears to help store factual information, while REM sleep may support the integration of ideas and emotional processing. For students, this means that all-night study is often inefficient. A shorter session followed by good sleep can lead to better recall than many hours of exhausted repetition. Reviewing material before bed may create a useful bridge between learning and sleep.',
    vocabulary: ['memory', 'integrate', 'efficient', 'recall'],
    questions: [
      q('What does the brain do during sleep?', ['It completely stops working.', 'It organizes and strengthens memories.', 'It forgets everything.', 'It only repairs muscles.'], 1, '文章指出睡眠中大脑会整理并强化部分记忆。'),
      q('What is often inefficient?', ['Reviewing before bed', 'Taking short naps', 'Studying all night', 'Getting enough sleep'], 2, '文章明确说 all-night study is often inefficient。'),
      q('Which statement is supported by the text?', ['Only REM sleep matters.', 'Sleep and memory are connected.', 'Sleep makes all details permanent.', 'Students need less sleep.'], 1, '全文核心就是睡眠与记忆之间的联系。')
    ]
  },
  {
    id: 'learning-from-failure',
    level: 'B1',
    title: 'Learning from Failure',
    topic: '成长与学习',
    time: '3 min',
    paragraphs: paragraphs(
      'Failure feels personal, especially when we have worked hard. Yet a failed attempt can reveal information that success often hides. It shows where our understanding is incomplete and which strategy is not working.',
      'Useful reflection begins with specific questions: What happened? What did I expect? What can I change next time? These questions turn a general feeling of disappointment into a practical learning problem.',
      'The goal is not to celebrate failure itself. It is to remove the fear that prevents experimentation. People who improve quickly usually treat mistakes as data, not as proof that they cannot succeed.'
    ),
    text: 'Failure feels personal, especially when we have worked hard. Yet a failed attempt can reveal information that success often hides. It shows where our understanding is incomplete and which strategy is not working. Useful reflection begins with specific questions: What happened? What did I expect? What can I change next time? These questions turn a general feeling of disappointment into a practical learning problem. The goal is not to celebrate failure itself. It is to remove the fear that prevents experimentation. People who improve quickly usually treat mistakes as data, not as proof that they cannot succeed.',
    vocabulary: ['failure', 'reflect', 'strategy', 'experiment'],
    questions: [
      q('What can failure reveal?', ['Nothing useful', 'Where understanding is incomplete', 'That effort is pointless', 'Only bad luck'], 1, '第一段说失败能显示理解不完整的地方。'),
      q('What makes reflection useful?', ['Ignoring the result', 'Asking specific questions', 'Blaming others', 'Working longer without changing'], 1, '第二段列出具体问题，使反思可操作。'),
      q('How should mistakes be treated?', ['As personal proof of failure', 'As data for improvement', 'As something to hide', 'As a reason to stop'], 1, '结尾强调把错误当数据。')
    ]
  },
  {
    id: 'ai-study-partner',
    level: 'B2',
    title: 'AI as a Study Partner',
    topic: '教育与科技',
    time: '5 min',
    paragraphs: paragraphs(
      'AI tools can make studying feel faster. They can summarize a long article, generate practice questions, or explain a sentence in simpler language. For a learner, this speed can be useful when it reduces the effort needed to begin.',
      'The danger is mistaking fluent output for reliable knowledge. An AI may produce a confident explanation that contains a serious error. It may also complete too much of the thinking for the student, creating an illusion of understanding.',
      'A better approach is to use AI as a demanding partner rather than an answer machine. Ask it to quiz you, challenge your explanation, or compare two interpretations. Then verify important facts with a textbook or a trusted source. The learner should remain responsible for the final judgment.'
    ),
    text: 'AI tools can make studying feel faster. They can summarize a long article, generate practice questions, or explain a sentence in simpler language. For a learner, this speed can be useful when it reduces the effort needed to begin. The danger is mistaking fluent output for reliable knowledge. An AI may produce a confident explanation that contains a serious error. It may also complete too much of the thinking for the student, creating an illusion of understanding. A better approach is to use AI as a demanding partner rather than an answer machine. Ask it to quiz you, challenge your explanation, or compare two interpretations. Then verify important facts with a textbook or a trusted source. The learner should remain responsible for the final judgment.',
    vocabulary: ['reliable', 'illusion', 'interpretation', 'verify'],
    questions: [
      q('What is one useful role of AI mentioned?', ['Replacing all teachers', 'Generating practice questions', 'Guaranteeing correct facts', 'Doing every assignment'], 1, '第一段提到 AI 可生成练习题。'),
      q('What risk does the article identify?', ['AI is always too slow', 'Fluent answers may be wrong', 'AI cannot produce sentences', 'Students ask too many questions'], 1, '第二段强调流畅输出不等于可靠知识。'),
      q('What does the author recommend?', ['Trust every AI answer', 'Use AI to challenge your thinking and verify facts', 'Stop using textbooks', 'Let AI make final decisions'], 1, '第三段建议让 AI 提问和挑战理解，并核实事实。')
    ]
  },
  {
    id: 'value-of-boredom',
    level: 'B2',
    title: 'The Value of Boredom',
    topic: '心理与生活',
    time: '4 min',
    paragraphs: paragraphs(
      'Many people fill every quiet moment with a screen. The moment a queue slows down or a bus is late, a phone appears. Constant stimulation feels productive, but it leaves little space for the mind to wander.',
      'Psychologists suggest that boredom can encourage creativity. When the brain is not focused on a task, it may connect ideas in unexpected ways. Some of our best solutions appear during a walk, a shower, or a dull journey.',
      'This does not mean we should seek boredom deliberately all day. It means we can protect small periods without input. Sitting quietly for five minutes may feel uncomfortable at first, but it can restore attention and make deliberate focus easier.'
    ),
    text: 'Many people fill every quiet moment with a screen. The moment a queue slows down or a bus is late, a phone appears. Constant stimulation feels productive, but it leaves little space for the mind to wander. Psychologists suggest that boredom can encourage creativity. When the brain is not focused on a task, it may connect ideas in unexpected ways. Some of our best solutions appear during a walk, a shower, or a dull journey. This does not mean we should seek boredom deliberately all day. It means we can protect small periods without input. Sitting quietly for five minutes may feel uncomfortable at first, but it can restore attention and make deliberate focus easier.',
    vocabulary: ['stimulation', 'creativity', 'restore', 'deliberate'],
    questions: [
      q('What do many people do in quiet moments?', ['Write notes', 'Look at a phone', 'Take a walk', 'Talk to strangers'], 1, '第一段说人们会用屏幕填满安静时刻。'),
      q('How can boredom help?', ['It guarantees happiness.', 'It may support creative connections.', 'It improves eyesight.', 'It removes all stress.'], 1, '第二段说无聊时大脑可能以意外方式连接想法。'),
      q('What is the practical suggestion?', ['Avoid all stimulation', 'Protect brief input-free periods', 'Never use a phone', 'Stay bored all day'], 1, '作者建议保护一些短暂的“无输入”时间。')
    ]
  },
  {
    id: 'small-habits',
    level: 'A2',
    title: 'Small Habits, Big Change',
    topic: '习惯养成',
    time: '3 min',
    paragraphs: paragraphs(
      'A large goal can feel exciting for a day and impossible for a month. A small habit is easier to repeat. Ten minutes of reading every night may seem unimportant, but it adds up to more than sixty hours in a year.',
      'The key is to make the habit easy to start. Put the book beside your bed or open the learning app before breakfast. Connect the new action to something you already do every day.',
      'Progress is often invisible from one day to the next. Track only what matters, such as the number of study days rather than perfect scores. Consistency gives improvement a chance to appear.'
    ),
    text: 'A large goal can feel exciting for a day and impossible for a month. A small habit is easier to repeat. Ten minutes of reading every night may seem unimportant, but it adds up to more than sixty hours in a year. The key is to make the habit easy to start. Put the book beside your bed or open the learning app before breakfast. Connect the new action to something you already do every day. Progress is often invisible from one day to the next. Track only what matters, such as the number of study days rather than perfect scores. Consistency gives improvement a chance to appear.',
    vocabulary: ['habit', 'consistency', 'progress', 'improve'],
    questions: [
      q('Why are small habits useful?', ['They are easy to repeat.', 'They require no time.', 'They guarantee perfect scores.', 'They replace all goals.'], 0, '文章指出小习惯更容易重复。'),
      q('How can a new habit become easier?', ['Make it complicated', 'Connect it to an existing routine', 'Wait for motivation', 'Do it only when perfect'], 1, '第二段建议把新动作连接到每天已做的事情。'),
      q('What should you track?', ['Only perfect scores', 'Study days and consistency', 'Other people’s progress', 'Unrelated tasks'], 1, '结尾建议关注学习天数和持续性。')
    ]
  },
  {
    id: 'how-memory-works',
    level: 'B1',
    title: 'How Memory Works',
    topic: '认知科学',
    time: '4 min',
    paragraphs: paragraphs(
      'Human memory is not a recording that we can replay without change. Each time we recall an experience, we reconstruct it. This flexibility helps us use knowledge in new situations, but it also means memories can contain errors.',
      'To remember something for a long time, passive review is rarely enough. Active recall, such as closing the book and explaining an idea, forces the brain to retrieve information. The effort of retrieval is part of what makes the memory stronger.',
      'Spacing practice over several days is more effective than repeating the same material in one session. Forgetting a little between reviews can be useful because the next successful recall requires more effort.'
    ),
    text: 'Human memory is not a recording that we can replay without change. Each time we recall an experience, we reconstruct it. This flexibility helps us use knowledge in new situations, but it also means memories can contain errors. To remember something for a long time, passive review is rarely enough. Active recall, such as closing the book and explaining an idea, forces the brain to retrieve information. The effort of retrieval is part of what makes the memory stronger. Spacing practice over several days is more effective than repeating the same material in one session. Forgetting a little between reviews can be useful because the next successful recall requires more effort.',
    vocabulary: ['recall', 'retrieve', 'spacing', 'effective'],
    questions: [
      q('How does the text describe memory?', ['A perfect recording', 'A reconstruction', 'A fixed photograph', 'A computer file'], 1, '第一段说每次回忆都是重构。'),
      q('Why is active recall useful?', ['It avoids effort.', 'It makes retrieval strengthen memory.', 'It removes all forgetting.', 'It requires no review.'], 1, '第二段指出检索的努力使记忆更强。'),
      q('What is better than one long review session?', ['No review', 'Spacing practice over days', 'Reading without thinking', 'Copying everything once'], 1, '第三段明确推荐分散练习。')
    ]
  },
  {
    id: 'future-self-letter',
    level: 'B2',
    title: 'A Letter to My Future Self',
    topic: '成长与写作',
    time: '4 min',
    paragraphs: paragraphs(
      'Dear future self, I hope you still remember how uncertain this year felt. You were learning to balance classes, friendships, and the fear of not being good enough. Some days were productive; others disappeared into distraction.',
      'I hope you did not wait for confidence before acting. I hope you asked questions, made imperfect attempts, and gave yourself time to improve. Most of all, I hope you learned that discipline is not punishment. It is a way of protecting what matters to you.',
      'If life is still busy, remember the small rule we practiced: begin with ten focused minutes. Not every day has to be impressive. A meaningful life is built from ordinary days that we chose to use.'
    ),
    text: 'Dear future self, I hope you still remember how uncertain this year felt. You were learning to balance classes, friendships, and the fear of not being good enough. Some days were productive; others disappeared into distraction. I hope you did not wait for confidence before acting. I hope you asked questions, made imperfect attempts, and gave yourself time to improve. Most of all, I hope you learned that discipline is not punishment. It is a way of protecting what matters to you. If life is still busy, remember the small rule we practiced: begin with ten focused minutes. Not every day has to be impressive. A meaningful life is built from ordinary days that we chose to use.',
    vocabulary: ['uncertain', 'distraction', 'discipline', 'meaningful'],
    questions: [
      q('What was the writer learning to balance?', ['Only exams', 'Classes, friendships, and self-doubt', 'A full-time job', 'Travel plans'], 1, '第一段列出 classes、friendships 和 not being good enough 的担忧。'),
      q('What does discipline mean here?', ['Punishment', 'Protecting what matters', 'Avoiding rest', 'Being perfect'], 1, '第二段明确说 discipline 是保护重要事物的方式。'),
      q('What small rule is repeated?', ['Study for hours', 'Begin with ten focused minutes', 'Never take breaks', 'Wait for confidence'], 1, '第三段给出十分钟起步规则。')
    ]
  }
];

const drill = (en, zh, focus, tip) => ({ en, zh, focus, tip });
const listening = [
  drill('I usually review my notes before class.', '我通常在课前复习笔记。', '一般现在时', 'usually 提示长期习惯。'),
  drill('She is preparing for an important interview.', '她正在准备一场重要面试。', '现在进行时', 'be + doing 表示正在进行。'),
  drill('We visited the science museum last weekend.', '我们上周末参观了科学博物馆。', '一般过去时', 'last weekend 是过去时间。'),
  drill('Have you ever given a presentation in English?', '你曾经用英语做过展示吗？', '现在完成时', 'ever 常与现在完成时连用。'),
  drill('If I have time, I will join the study group.', '如果我有时间，我会加入学习小组。', '条件句', 'if 从句用现在时表示将来。'),
  drill('The results were announced yesterday afternoon.', '结果昨天下午公布了。', '被动语态', 'were announced 是过去被动。'),
  drill('This is the book that changed my study habits.', '这就是改变我学习习惯的那本书。', '定语从句', 'that 指代 the book。'),
  drill('Although the task was difficult, we finished it on time.', '虽然任务很难，我们还是按时完成了。', '让步从句', 'although 引出让步关系。'),
  drill('I would have called you if I had seen your message.', '如果我看到你的消息，我就给你打电话了。', '虚拟语气', '与过去事实相反。'),
  drill('Could you explain that point more clearly?', '你能把那个观点解释得更清楚吗？', '礼貌请求', 'Could you 比 Can you 更委婉。'),
  drill('The lecture starts at nine on Tuesday.', '讲座周二九点开始。', '时间介词', 'at 时刻，on 星期。'),
  drill('There are fewer chairs than we expected.', '椅子比我们预期的少。', '可数名词比较', 'fewer 修饰可数名词。'),
  drill('She speaks more confidently than she did last year.', '她说得比去年更自信。', '比较级', 'more 修饰多音节副词。'),
  drill('I am looking forward to meeting the exchange students.', '我很期待见到交换生。', '固定搭配', 'look forward to 后接动名词。'),
  drill('The library is quieter than the coffee shop.', '图书馆比咖啡店安静。', '比较级', 'quiet 的比较级是 quieter。'),
  drill('He suggested taking a short break.', '他建议休息一会儿。', '动名词', 'suggest 后接动名词。'),
  drill('The assignment is due at midnight.', '作业午夜截止。', '校园表达', 'be due 表示到期。'),
  drill('I need to improve my listening and speaking.', '我需要提高听力和口语。', '学习目标', 'improve 表示提升。'),
  drill('What do you usually do after class?', '你下课后通常做什么？', '日常问答', 'usually 问习惯。'),
  drill('The train had left before we reached the station.', '我们到站前火车已经开走了。', '过去完成时', 'had left 发生在 reached 之前。'),
  drill('You should check the source before sharing the news.', '分享新闻前你应该核实来源。', '情态动词', 'should 表建议。'),
  drill('The professor asked us to compare the two theories.', '教授让我们比较这两种理论。', '不定式', 'ask somebody to do。'),
  drill('Students who take notes actively learn more effectively.', '主动记笔记的学生学得更有效。', '定语从句', 'who 修饰 students。'),
  drill('I have been studying English for ten years.', '我已经学了十年英语。', '完成进行时', '强调持续到现在的过程。'),
  drill('The meeting was moved to Friday.', '会议被改到了周五。', '被动语态', 'was moved 表示被调整。'),
  drill('Could you send me the slides after the presentation?', '展示后你能把幻灯片发给我吗？', '职场英语', 'send somebody something。'),
  drill('It is important to support your argument with evidence.', '用证据支持论点很重要。', '学术表达', 'support an argument with evidence。'),
  drill('I prefer studying in the morning to studying at night.', '比起晚上学习，我更喜欢早上学习。', '偏好表达', 'prefer A to B。'),
  drill('The more you practice, the more fluent you become.', '练得越多，就越流利。', '比较结构', 'the more..., the more...。'),
  drill('Please let me know if the schedule changes.', '如果日程有变化请告诉我。', '邮件表达', 'let me know 表示告知。'),
  drill('We are supposed to submit the report by Friday.', '我们应该在周五前提交报告。', '义务表达', 'be supposed to 表示按安排应该。'),
  drill('She managed to finish the task despite the noise.', '尽管很吵，她还是设法完成了任务。', '让步与结果', 'manage to do 表示设法做到。'),
  drill('The app helps me keep track of new words.', '这个应用帮我记录新词。', '科技表达', 'keep track of 表示跟踪记录。'),
  drill('I would rather review ten words than read without focus.', '我宁愿复习十个词，也不愿无目的地阅读。', '偏好表达', 'would rather A than B。'),
  drill('It turned out that the simplest solution was the best.', '结果最简单的方案最好。', '结果表达', 'turn out 表示结果是。'),
  drill('The data suggest that sleep affects memory.', '数据表明睡眠会影响记忆。', '学术表达', 'data suggest that 常用于学术写作。'),
  drill('I am not sure whether this source is reliable.', '我不确定这个来源是否可靠。', '名词性从句', 'whether 引导不确定的宾语从句。'),
  drill('The project will be completed by the end of the month.', '项目将在月底前完成。', '将来被动', 'will be completed 是将来被动。'),
  drill('Take a moment to organize your thoughts before speaking.', '说话前花一点时间整理思路。', '口语策略', 'take a moment to do。'),
  drill('What matters most is consistent practice.', '最重要的是持续练习。', '主语从句', 'What matters most 作主语。'),
  drill('I made a mistake, but I learned something useful.', '我犯了一个错误，但学到了有用的东西。', '成长表达', 'but 连接转折。'),
  drill('The café where we first met is near the station.', '我们第一次见面的咖啡馆在车站附近。', '定语从句', 'where 修饰地点。'),
  drill('She recommended that I start with short articles.', '她建议我从短文章开始。', '虚拟语气', 'recommend that + 动词原形。'),
  drill('We need to find a balance between work and rest.', '我们需要在工作和休息之间找到平衡。', '抽象表达', 'find a balance between。'),
  drill('The speaker paused to emphasize the main point.', '演讲者停下来强调重点。', '演讲表达', 'pause to do 表示停下来做某事。'),
  drill('Not everyone learns in the same way.', '不是每个人都以相同方式学习。', '部分否定', 'not everyone 表示并非所有人。'),
  drill('I have already made plans for the weekend.', '我已经安排好了周末计划。', '现在完成时', 'already 常放 have 后。'),
  drill('The city has invested in public transportation.', '这座城市投资了公共交通。', '现在完成时', 'has invested 强调已有结果。'),
  drill('You do not have to be perfect to make progress.', '你不需要完美才能进步。', '成长思维', 'do not have to 表示不必。'),
  drill('The article provides a balanced view of the issue.', '这篇文章对该问题提供了平衡的观点。', '阅读表达', 'provide a view of。'),
  drill('I was about to leave when the phone rang.', '我正要离开时电话响了。', '过去将来', 'be about to 表示即将。'),
  drill('The noise made it difficult to concentrate.', '噪音让我很难集中注意力。', '形式宾语', 'make it difficult to do。'),
  drill('She tends to overprepare when she is nervous.', '她紧张时往往会过度准备。', '频率表达', 'tend to 表示倾向。'),
  drill('The evidence is not strong enough to support that claim.', '证据不足以支持那个说法。', '学术批判', 'enough to do。'),
  drill('Let us break the task into smaller steps.', '让我们把任务拆成更小的步骤。', '学习策略', 'break into 表示拆分。'),
  drill('I appreciate your taking the time to help me.', '感谢你花时间帮助我。', '礼貌表达', 'appreciate + 动名词。'),
  drill('The lecture was recorded so that students could review it.', '讲座被录下来，方便学生复习。', '目的从句', 'so that + 从句。'),
  drill('Small improvements become visible over time.', '小的进步会随着时间变得可见。', '成长表达', 'over time 表示随着时间。'),
  drill('I would rather you told me the truth.', '我宁愿你告诉我真相。', '虚拟语气', 'would rather somebody did。'),
  drill('The more carefully you listen, the more you notice.', '听得越仔细，你注意到的越多。', '比较结构', 'the more..., the more...。')
];

const speakingPrompt = (prompt, zh, frame, tips) => ({ prompt, zh, frame, tips });
const speaking = [
  speakingPrompt('Introduce yourself in 30 seconds.', '用 30 秒介绍自己。', 'I am ... I study ... I enjoy ...', '先说身份，再说兴趣，最后说目标。'),
  speakingPrompt('Describe your typical morning.', '描述你典型的早晨。', 'I usually wake up at ... After that, I ...', '用 usually 和 after that 串联步骤。'),
  speakingPrompt('Explain why you are learning English.', '解释你为什么学英语。', 'I am learning English because ... It will help me ...', '给出一个现实原因和一个长期目标。'),
  speakingPrompt('Talk about a class you enjoy.', '谈谈你喜欢的一门课。', 'One class I enjoy is ... because ...', '用具体例子说明为什么喜欢。'),
  speakingPrompt('Describe a difficult task you completed.', '描述你完成的一项困难任务。', 'At first, ... Then I ... Finally, ...', '突出转折和解决过程。'),
  speakingPrompt('Give advice to a nervous first-year student.', '给紧张的大一新生提建议。', 'You should ... Try to ... Do not ...', '建议要具体，避免空泛。'),
  speakingPrompt('Explain how you remember new words.', '解释你如何记新词。', 'I usually ... I also ...', '说出两个真实方法。'),
  speakingPrompt('Describe a place where you like to study.', '描述你喜欢学习的地方。', 'I prefer studying in ... because ...', '加入地点、原因和感受。'),
  speakingPrompt('Talk about a habit you want to build.', '谈谈你想养成的习惯。', 'I would like to ... I will start by ...', '把目标缩小成第一步。'),
  speakingPrompt('Compare online and in-person classes.', '比较网课和线下课。', 'Online classes are ... while in-person classes ...', '使用 while 对比，不要只说优缺点。'),
  speakingPrompt('Describe your favorite book or film.', '描述你最喜欢的书或电影。', 'It is about ... What I like most is ...', '避免只复述情节。'),
  speakingPrompt('Explain a problem in your city.', '解释你城市里的一个问题。', 'One problem is ... It affects ... One solution could be ...', '用问题—影响—方案结构。'),
  speakingPrompt('Talk about a teacher who influenced you.', '谈谈影响过你的老师。', 'This teacher ... I learned ...', '说一个具体行为。'),
  speakingPrompt('Describe how technology helps learning.', '描述科技如何帮助学习。', 'Technology helps me ... For example, ...', '必须给例子。'),
  speakingPrompt('Give your opinion on studying at night.', '说说你对熬夜学习的看法。', 'I think ... because ...', '表达平衡观点。'),
  speakingPrompt('Summarize an article you read recently.', '总结你最近读的一篇文章。', 'The article argues that ... It also ...', '先主旨后细节。'),
  speakingPrompt('Describe a personal goal for this semester.', '描述这学期的个人目标。', 'My goal is to ... I will measure progress by ...', '目标要可衡量。'),
  speakingPrompt('Explain how you deal with stress.', '解释你如何应对压力。', 'When I feel stressed, I ...', '说出现象和行动。'),
  speakingPrompt('Talk about a mistake that taught you something.', '谈谈一个让你学到东西的错误。', 'I once ... Since then, I ...', '使用 once 和 since then。'),
  speakingPrompt('Describe your ideal weekend.', '描述理想的周末。', 'Ideally, I would ...', '使用 would 表达想象。'),
  speakingPrompt('Persuade a friend to join your study group.', '说服朋友加入你的学习小组。', 'You should join because ... We can ...', '给出利益和证据。'),
  speakingPrompt('Explain the difference between knowing and understanding.', '解释知道和理解的区别。', 'Knowing means ... while understanding ...', '使用对比结构。'),
  speakingPrompt('Talk about why sleep matters.', '谈谈睡眠为什么重要。', 'Sleep matters because ... Without enough sleep, ...', '连接原因和结果。'),
  speakingPrompt('Describe a time you changed your opinion.', '描述一次改变观点的经历。', 'I used to think ... but now ...', '明确旧观点和改变原因。'),
  speakingPrompt('Give a two-minute explanation of your major.', '用两分钟介绍你的专业。', 'My major is ... It focuses on ...', '面向非专业听众。'),
  speakingPrompt('Talk about a skill you want to improve.', '谈谈你想提升的技能。', 'I want to improve ... The first step is ...', '避免只说“多练习”。'),
  speakingPrompt('Explain how you decide what information to trust.', '解释你如何判断信息是否可信。', 'I check ... I avoid ...', '提到来源和交叉验证。'),
  speakingPrompt('Describe a challenge in learning a language.', '描述语言学习中的一个挑战。', 'One challenge is ... I plan to ...', '先说困难再给方案。'),
  speakingPrompt('Summarize your week in three sentences.', '用三句话总结这一周。', 'This week, I ... The hardest part was ... Next week, I ...', '练习简洁表达。'),
  speakingPrompt('Ask three follow-up questions in a conversation.', '在一次对话中提出三个追问。', 'Could you explain ...? What do you mean by ...? Why do you think ...?', '用追问维持对话。')
];

const phrase = (en, zh, usage) => ({ en, zh, usage });
const phrases = [
  phrase('as a result', '因此；结果', '引出一个结果'),
  phrase('in other words', '换句话说', '解释或重述观点'),
  phrase('on the other hand', '另一方面', '呈现对比'),
  phrase('to be honest', '说实话', '表达坦诚态度'),
  phrase('in my opinion', '在我看来', '引出个人观点'),
  phrase('it depends on', '取决于', '说明条件差异'),
  phrase('be worth doing', '值得做', '评价行动价值'),
  phrase('look forward to', '期待', 'to 后接名词或动名词'),
  phrase('get used to', '习惯于', 'to 后接名词或动名词'),
  phrase('pay attention to', '注意', 'to 为介词'),
  phrase('take advantage of', '利用', '把握机会或资源'),
  phrase('make a difference', '产生影响', '强调积极改变'),
  phrase('keep track of', '记录；掌握动态', '管理进度或信息'),
  phrase('come up with', '想出', '提出想法或方案'),
  phrase('figure out', '弄明白', '解决问题'),
  phrase('point out', '指出', '强调事实或问题'),
  phrase('carry out', '执行', '执行计划、研究或任务'),
  phrase('bring about', '带来；引起', '引发变化'),
  phrase('take into account', '考虑到', '纳入决策因素'),
  phrase('be responsible for', '对…负责', '承担责任'),
  phrase('be aware of', '意识到', '强调认知'),
  phrase('be familiar with', '熟悉', '描述知识或经验'),
  phrase('be capable of', '有能力做', 'of 后接动名词'),
  phrase('be likely to', '很可能', '表达概率'),
  phrase('be supposed to', '按理应该', '表达安排或期待'),
  phrase('be about to', '即将', '表示马上发生'),
  phrase('at first glance', '乍看之下', '引出初印象'),
  phrase('in the long run', '从长远看', '评估长期影响'),
  phrase('for the time being', '暂时', '表示现阶段'),
  phrase('by no means', '绝不', '强调否定'),
  phrase('more or less', '大致；或多或少', '表示程度'),
  phrase('so far', '到目前为止', '配合完成时'),
  phrase('from time to time', '偶尔', '表示频率'),
  phrase('once in a while', '偶尔', '口语频率表达'),
  phrase('on purpose', '故意地', '说明意图'),
  phrase('by accident', '偶然地；意外地', '说明非计划'),
  phrase('in advance', '提前', '预先安排'),
  phrase('ahead of schedule', '提前完成', '项目与日程'),
  phrase('behind schedule', '落后于计划', '项目与日程'),
  phrase('make progress', '取得进步', '学习与工作'),
  phrase('take responsibility', '承担责任', '主动负责'),
  phrase('make an effort', '努力', '强调付出'),
  phrase('set a goal', '设定目标', '计划表达'),
  phrase('reach a conclusion', '得出结论', '论证与写作'),
  phrase('raise awareness', '提高意识', '社会议题'),
  phrase('play a role in', '在…中起作用', '分析因素'),
  phrase('have access to', '能够使用；有机会接触', '资源与机会'),
  phrase('be exposed to', '接触到', '语言或环境影响'),
  phrase('contribute to', '促成；有助于', 'to 为介词'),
  phrase('result in', '导致', '强调结果'),
  phrase('result from', '由…造成', '强调原因'),
  phrase('refer to', '指的是；提到', '解释概念'),
  phrase('focus on', '专注于', '注意力与目标'),
  phrase('rely on', '依赖', '说明依赖关系'),
  phrase('deal with', '处理', '问题与任务'),
  phrase('cope with', '应对', '压力与困难'),
  phrase('lead to', '导致', '因果链'),
  phrase('give up', '放弃', '停止尝试'),
  phrase('keep up with', '跟上', '进度或变化'),
  phrase('catch up on', '补上', '落后后的弥补'),
  phrase('run out of', '用完', '资源耗尽'),
  phrase('put off', '推迟', '延后任务'),
  phrase('call off', '取消', '取消活动'),
  phrase('turn down', '拒绝；调低', '拒绝请求或降低音量'),
  phrase('turn out', '结果是', '说明最终情况'),
  phrase('work out', '解决；锻炼', '语境决定含义'),
  phrase('break down', '出故障；分解', '机器或问题'),
  phrase('carry on', '继续进行', '坚持行动'),
  phrase('get across', '使被理解', '沟通表达'),
  phrase('bring up', '提出；抚养', '话题或孩子'),
  phrase('look into', '调查', '研究问题'),
  phrase('look up', '查阅', '查词或信息'),
  phrase('go over', '复习；检查', '学习与审核'),
  phrase('go through', '经历；仔细检查', '根据语境判断'),
  phrase('take on', '承担；呈现', '责任或特征'),
  phrase('take over', '接管', '接手控制'),
  phrase('set up', '建立；设置', '系统或组织'),
  phrase('show up', '出现；到场', '口语表达'),
  phrase('stand out', '突出', '表现明显'),
  phrase('stick to', '坚持；遵守', '计划或原则'),
  phrase('switch to', '切换到', '改变方式'),
  phrase('adjust to', '适应', 'to 为介词'),
  phrase('adapt to', '适应', '环境变化'),
  phrase('object to', '反对', 'to 为介词')
];

const curriculum = {
  grammar,
  reading,
  listening,
  speaking,
  phrases,
  pronunciation: [
    { sound: '/θ/ vs /s/', tip: 'think 的舌尖轻触上下齿之间；sink 的舌尖不伸出。', words: ['think', 'sink', 'thick', 'sick'] },
    { sound: '/ð/ vs /z/', tip: 'this 中舌尖轻触齿间并振动；zoo 中舌尖靠近齿龈。', words: ['this', 'zoo', 'then', 'zen'] },
    { sound: '/ɪ/ vs /iː/', tip: 'sit 短而松；seat 长而紧。', words: ['sit', 'seat', 'ship', 'sheep'] },
    { sound: '/æ/ vs /e/', tip: 'bad 张口更大；bed 口型更窄。', words: ['bad', 'bed', 'man', 'men'] },
    { sound: '/v/ vs /w/', tip: 'very 用上齿轻触下唇；well 圆唇不触齿。', words: ['very', 'well', 'vest', 'west'] },
    { sound: '词尾辅音', tip: '不要给以辅音结尾的单词额外加元音，如 work 不要读成 worker。', words: ['work', 'help', 'book', 'need'] },
    { sound: '句子重音', tip: '内容词通常重读，功能词通常弱读。', words: ['I want to GO.', 'She can HELP you.'] },
    { sound: '连读', tip: '辅音结尾接元音开头时可自然连读。', words: ['turn it on', 'pick it up', 'an apple'] }
  ]
};

if (typeof module !== 'undefined') module.exports = { curriculum };
if (typeof window !== 'undefined') window.ENGLISH_CURRICULUM = curriculum;
