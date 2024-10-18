const OUTPUT_FORMAT = {
  WEBM_24KHZ_16BIT_MONO_OPUS: "webm-24khz-16bit-mono-opus",
  // ... 其他格式可以根据需要添加
};

class MsEdgeTTS {
  static OUTPUT_FORMAT = OUTPUT_FORMAT;
  static TRUSTED_CLIENT_TOKEN = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
  static SYNTH_URL = `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=${MsEdgeTTS.TRUSTED_CLIENT_TOKEN}`;
  static BINARY_DELIM = "Path:audio\r\n";
  static VOICE_LANG_REGEX = /\w{2}-\w{2}/;

  constructor(enableLogger = false) {
    this._enableLogger = enableLogger;
    this._ws = null;
    this._voice = "";
    this._voiceLocale = "";
    this._outputFormat = "";
  }

  async setMetadata(voiceName, outputFormat, voiceLocale) {
    this._voice = voiceName;
    this._voiceLocale = voiceLocale || this._inferVoiceLocale(voiceName);
    this._outputFormat = outputFormat;
    await this._initClient();
  }

  _inferVoiceLocale(voiceName) {
    const voiceLangMatch = MsEdgeTTS.VOICE_LANG_REGEX.exec(voiceName);
    if (!voiceLangMatch) {
      throw new Error("Could not infer voiceLocale from voiceName!");
    }
    return voiceLangMatch[0];
  }

  async _initClient() {
    if (this._ws) {
      this._ws.close();
    }
    
    return new Promise((resolve, reject) => {
      this._ws = new WebSocket(MsEdgeTTS.SYNTH_URL);
      
      this._ws.onopen = () => {
        this._ws.send(`Content-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n
          {
            "context": {
              "synthesis": {
                "audio": {
                  "metadataoptions": {
                    "sentenceBoundaryEnabled": "false",
                    "wordBoundaryEnabled": "false"
                  },
                  "outputFormat": "${this._outputFormat}"
                }
              }
            }
          }
        `);
        resolve();
      };
      
      this._ws.onerror = reject;
    });
  }

  async toStream(input) {
    if (!this._ws) {
      throw new Error("WebSocket not initialized. Call setMetadata first.");
    }

    const ssml = this._SSMLTemplate(input);
    const requestId = Math.random().toString(36).substring(2, 15);
    
    return new Promise((resolve, reject) => {
      const audioChunks = [];
      
      const messageHandler = (event) => {
        if (typeof event.data === "string") {
          // 处理元数据消息
          if (event.data.includes("Path:turn.end")) {
            this._ws.removeEventListener('message', messageHandler);
            resolve(new Blob(audioChunks, { type: 'audio/webm' }));
          }
        } else if (event.data instanceof Blob) {
          event.data.arrayBuffer().then(buffer => {
            const data = new Uint8Array(buffer);
            const headerEnd = MsEdgeTTS.BINARY_DELIM.length + data.indexOf(MsEdgeTTS.BINARY_DELIM);
            const audioData = data.slice(headerEnd);
            audioChunks.push(audioData);
          });
        }
      };

      this._ws.addEventListener('message', messageHandler);
      
      this._ws.send(`X-RequestId:${requestId}\r\nContent-Type:application/ssml+xml\r\nPath:ssml\r\n\r\n${ssml}`);
    });
  }

  _SSMLTemplate(input) {
    return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="${this._voiceLocale}">
      <voice name="${this._voice}">
        ${input}
      </voice>
    </speak>`;
  }

  close() {
    if (this._ws) {
      this._ws.close();
      this._ws = null;
    }
  }
}

// 导出MsEdgeTTS类
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MsEdgeTTS;
} else {
  window.MsEdgeTTS = MsEdgeTTS;
}
