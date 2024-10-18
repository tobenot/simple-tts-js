const textEncoder = new TextEncoder();
const binaryHeadEnd = textEncoder.encode('Path:audio\r\n').toString();

class TTS {
  constructor() {
    this.voiceList = {};
    this.langList = [];
    this.fetchVoiceList();
  }

  async fetchVoiceList() {
    try {
      const response = await fetch('https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/voices/list?trustedclienttoken=6A5AA1D4EAFF4E9FB37E23D68491D6F4');
      const data = await response.json();
      data.forEach((item) => {
        if (!this.voiceList[item.Locale]) {
          this.langList.push(item.Locale);
          this.voiceList[item.Locale] = [];
        }
        this.voiceList[item.Locale].push(item);
      });
    } catch (error) {
      console.error('获取语音列表失败:', error);
    }
  }

  guid() {
    function gen(count) {
      let out = '';
      for (let i = 0; i < count; i++) {
        out += (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
      }
      return out;
    }
    return gen(8);
  }

  numToString(num) {
    return num >= 0 ? `+${num}` : `${num}`;
  }

  speechConfig(audioOutputFormat = 'webm-24khz-16bit-mono-opus') {
    return `X-Timestamp:${new Date()}\r\nContent-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"true"},"outputFormat":"${audioOutputFormat}"}}}}`
  }

  ssmlText({
    requestId = this.guid(),
    lang = 'zh-CN',
    voiceName,
    pitch = '+0',
    rate = '+0',
    volume = '+0',
    text
  }) {
    return `X-RequestId:${requestId}\r\nContent-Type:application/ssml+xml\r\nX-Timestamp:${new Date()}\r\nPath:ssml\r\n\r\n<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xmlns:mstts='https://www.w3.org/2001/mstts' xml:lang='${lang}'><voice name='${voiceName}'><prosody pitch='${pitch}Hz' rate ='${rate}%' volume='${volume}%'>${text}</prosody></voice></speak>`
  }

  async getAudio(options) {
    const { text, lang, voice, pitch, rate } = options;
    if (!text) {
      throw new Error('请输入文字');
    }

    const bufferList = [];
    const requestId = this.guid();

    return new Promise((resolve, reject) => {
      const ws = new WebSocket('wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4');

      ws.addEventListener('open', () => {
        ws.send(this.speechConfig());
        ws.send(
          this.ssmlText({
            requestId,
            text,
            lang,
            voiceName: this.voiceList[lang][voice].Name,
            pitch: this.numToString(pitch),
            rate: this.numToString(rate)
          })
        );
      });

      ws.addEventListener('message', async ({ data }) => {
        if (data instanceof Blob) {
          const view = new Uint8Array(await data.arrayBuffer());
          bufferList.push(
            ...view
              .toString()
              .split(binaryHeadEnd)[1]
              .split(',')
              .slice(1)
              .map((i) => +i)
          );
          if (view[0] === 0x00 && view[1] === 0x67 && view[2] === 0x58) {
            ws.close(1000);
          }
        }
      });

      ws.addEventListener('error', (err) => {
        console.error('WebSocket错误:', err);
        reject(err);
      });

      ws.addEventListener('close', (event) => {
        if (event.code !== 1000) {
          console.error('WebSocket意外关闭:', event);
          reject(new Error(`WebSocket关闭,代码: ${event.code}`));
          return;
        }
        const blob = new Blob([new Uint8Array(bufferList)], { type: 'audio/webm' });
        resolve(URL.createObjectURL(blob));
      });
    });
  }

  getLangList() {
    return this.langList;
  }

  getVoiceList(lang) {
    return this.voiceList[lang] || [];
  }
}