const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '..');

function check(condition, message) {
  if (!condition) throw new Error(message);
}

(async () => {
  let stoppedTracks = 0;
  const dom = new JSDOM(fs.readFileSync(path.join(root, 'index.html'), 'utf8'), {
    url: 'http://localhost/#speaking',
    runScripts: 'outside-only',
    pretendToBeVisual: true
  });
  const { window } = dom;
  window.scrollTo = () => {};
  window.eval(fs.readFileSync(path.join(root, 'assets/vocabulary.js'), 'utf8'));
  window.eval(fs.readFileSync(path.join(root, 'data/curriculum.js'), 'utf8'));

  class FakeMediaRecorder {
    constructor(stream, options) {
      this.stream = stream;
      this.mimeType = options && options.mimeType ? options.mimeType : 'audio/mp4';
      this.state = 'inactive';
    }

    start() {
      this.state = 'recording';
    }

    stop() {
      this.state = 'inactive';
      if (this.ondataavailable) {
        this.ondataavailable({ data: new window.Blob(['recorded audio'], { type: this.mimeType }) });
      }
      if (this.onstop) this.onstop();
    }

    static isTypeSupported() {
      return true;
    }
  }

  Object.defineProperty(window.navigator, 'mediaDevices', {
    configurable: true,
    value: {
      getUserMedia: async () => ({
        getTracks: () => [{ stop() { stoppedTracks += 1; } }]
      })
    }
  });
  window.MediaRecorder = FakeMediaRecorder;
  window.URL.createObjectURL = () => 'blob:recorded-audio';
  window.URL.revokeObjectURL = () => {};
  window.eval(fs.readFileSync(path.join(root, 'app.js'), 'utf8'));

  const app = () => window.document.querySelector('#app').innerHTML;
  const button = () => window.document.querySelector('[data-action="record-speaking"]');
  check(button().textContent.includes('开始录音'), '支持麦克风时应显示开始录音');
  button().dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
  await new Promise(resolve => setTimeout(resolve, 0));
  check(button().textContent.includes('停止录音'), '获取麦克风后应进入录音状态');
  button().dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
  await new Promise(resolve => setTimeout(resolve, 0));
  check(Boolean(window.document.querySelector('.recording-playback audio')), '停止录音后应显示可播放音频');
  check(app().includes('录音已保存'), '没有语音识别时应保留录音并显示回放说明');
  button().dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
  await new Promise(resolve => setTimeout(resolve, 0));
  window.document.querySelector('[data-nav="home"]').dispatchEvent(
    new window.MouseEvent('click', { bubbles: true, cancelable: true })
  );
  await new Promise(resolve => setTimeout(resolve, 0));
  check(stoppedTracks >= 2, '离开口语页时应关闭麦克风');
  check(app().includes('今天，让英语'), '离开口语页后应正常返回首页');

  console.log('Recording check passed: microphone capture, stop state, local playback and navigation cleanup.');
})().catch(error => {
  console.error(error.message);
  process.exit(1);
});
