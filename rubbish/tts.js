const OUTPUT_FORMAT = {
    RAW_8KHZ_8BIT_MONO_MULAW: "raw-8khz-8bit-mono-mulaw",
    AUDIO_16KHZ_32KBITRATE_MONO_MP3: "audio-16khz-32kbitrate-mono-mp3",
    AUDIO_16KHZ_128KBITRATE_MONO_MP3: "audio-16khz-128kbitrate-mono-mp3",
    AUDIO_16KHZ_64KBITRATE_MONO_MP3: "audio-16khz-64kbitrate-mono-mp3",
    AUDIO_24KHZ_48KBITRATE_MONO_MP3: "audio-24khz-48kbitrate-mono-mp3",
    AUDIO_24KHZ_96KBITRATE_MONO_MP3: "audio-24khz-96kbitrate-mono-mp3",
    AUDIO_24KHZ_160KBITRATE_MONO_MP3: "audio-24khz-160kbitrate-mono-mp3",
    RAW_16KHZ_16BIT_MONO_TRUESILK: "raw-16khz-16bit-mono-truesilk",
    RIFF_16KHZ_16BIT_MONO_PCM: "riff-16khz-16bit-mono-pcm",
    RIFF_8KHZ_16BIT_MONO_PCM: "riff-8khz-16bit-mono-pcm",
    RIFF_24KHZ_16BIT_MONO_PCM: "riff-24khz-16bit-mono-pcm",
    RIFF_8KHZ_8BIT_MONO_MULAW: "riff-8khz-8bit-mono-mulaw",
    RAW_16KHZ_16BIT_MONO_PCM: "raw-16khz-16bit-mono-pcm",
    RAW_24KHZ_16BIT_MONO_PCM: "raw-24khz-16bit-mono-pcm",
    RAW_8KHZ_16BIT_MONO_PCM: "raw-8khz-16bit-mono-pcm",
    OGG_16KHZ_16BIT_MONO_OPUS: "ogg-16khz-16bit-mono-opus",
    OGG_24KHZ_16BIT_MONO_OPUS: "ogg-24khz-16bit-mono-opus",
    RAW_48KHZ_16BIT_MONO_PCM: "raw-48khz-16bit-mono-pcm",
    RIFF_48KHZ_16BIT_MONO_PCM: "riff-48khz-16bit-mono-pcm",
    AUDIO_48KHZ_96KBITRATE_MONO_MP3: "audio-48khz-96kbitrate-mono-mp3",
    AUDIO_48KHZ_192KBITRATE_MONO_MP3: "audio-48khz-192kbitrate-mono-mp3",
    OGG_48KHZ_16BIT_MONO_OPUS: "ogg-48khz-16bit-mono-opus",
    WEBM_16KHZ_16BIT_MONO_OPUS: "webm-16khz-16bit-mono-opus",
    WEBM_24KHZ_16BIT_MONO_OPUS: "webm-24khz-16bit-mono-opus",
    RAW_24KHZ_16BIT_MONO_TRUESILK: "raw-24khz-16bit-mono-truesilk",
    RAW_8KHZ_8BIT_MONO_ALAW: "raw-8khz-8bit-mono-alaw",
    RIFF_8KHZ_8BIT_MONO_ALAW: "riff-8khz-8bit-mono-alaw",
    WEBM_24KHZ_16BIT_24KBPS_MONO_OPUS: "webm-24khz-16bit-24kbps-mono-opus",
    AUDIO_16KHZ_16BIT_32KBPS_MONO_OPUS: "audio-16khz-16bit-32kbps-mono-opus",
    AUDIO_24KHZ_16BIT_48KBPS_MONO_OPUS: "audio-24khz-16bit-48kbps-mono-opus",
    AUDIO_24KHZ_16BIT_24KBPS_MONO_OPUS: "audio-24khz-16bit-24kbps-mono-opus",
    RAW_22050HZ_16BIT_MONO_PCM: "raw-22050hz-16bit-mono-pcm",
    RIFF_22050HZ_16BIT_MONO_PCM: "riff-22050hz-16bit-mono-pcm",
    RAW_44100HZ_16BIT_MONO_PCM: "raw-44100hz-16bit-mono-pcm",
    RIFF_44100HZ_16BIT_MONO_PCM: "riff-44100hz-16bit-mono-pcm",
    AMR_WB_16000HZ: "amr-wb-16000hz",
    G722_16KHZ_64KBPS: "g722-16khz-64kbps"
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
    this._log("MsEdgeTTS 实例已创建");
  }

  _log(message) {
    if (this._enableLogger) {
      console.log(`[MsEdgeTTS] ${message}`);
    }
  }

  async setMetadata(voiceName, outputFormat, voiceLocale) {
    this._log(`设置元数据: voiceName=${voiceName}, outputFormat=${outputFormat}, voiceLocale=${voiceLocale}`);
    this._voice = voiceName;
    this._voiceLocale = voiceLocale || this._inferVoiceLocale(voiceName);
    this._outputFormat = MsEdgeTTS.OUTPUT_FORMAT.OGG_16KHZ_16BIT_MONO_OPUS;
    await this._initClient();
    this._log("元数据设置完成");
  }

  _inferVoiceLocale(voiceName) {
    this._log(`正在从 voiceName 推断 voiceLocale: ${voiceName}`);
    const voiceLangMatch = MsEdgeTTS.VOICE_LANG_REGEX.exec(voiceName);
    if (!voiceLangMatch) {
      this._log("无法从 voiceName 推断 voiceLocale");
      throw new Error("Could not infer voiceLocale from voiceName!");
    }
    this._log(`推断的 voiceLocale: ${voiceLangMatch[0]}`);
    return voiceLangMatch[0];
  }

  async _initClient() {
    this._log("初始化客户端");
    if (this._ws) {
      this._log("关闭现有的 WebSocket 连接");
      this._ws.close();
    }
    
    const connectWebSocket = () => {
      return new Promise((resolve, reject) => {
        this._log(`正在连接到 WebSocket: ${MsEdgeTTS.SYNTH_URL}`);
        this._ws = new WebSocket(MsEdgeTTS.SYNTH_URL);
        
        this._ws.onopen = () => {
          this._log("WebSocket 连接已打开");
          const configMessage = `Content-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n
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
          `;
          this._log("发送配置消息");
          this._ws.send(configMessage);
          this._log("配置消息已发送");
          resolve();
        };
        
        this._ws.onerror = (error) => {
          this._log(`WebSocket 错误: ${error}`);
          reject(error);
        };

        this._ws.onclose = (event) => {
          this._log(`WebSocket 连接已关闭。代码: ${event.code}, 原因: ${event.reason}`);
          if (event.code !== 1000) {
            this._log("尝试重新连接...");
            setTimeout(() => connectWebSocket().then(resolve).catch(reject), 5000);
          }
        };
      });
    };

    return connectWebSocket();
  }

  async toStream(input) {
    this._log("开始转换文本到音频流");
    if (!this._ws) {
      this._log("WebSocket 未初始化，抛出错误");
      throw new Error("WebSocket not initialized. Call setMetadata first.");
    }

    const ssml = this._SSMLTemplate(input);
    const requestId = this._generateRequestId();
    this._log(`生成的请求 ID: ${requestId}`);
    this._log(`生成的 SSML: ${ssml}`);
    
    return new Promise((resolve, reject) => {
      const audioChunks = [];
      
      const messageHandler = (event) => {
        if (typeof event.data === "string") {
          this._log(`收到字符串消息: ${event.data}`);
          if (event.data.includes("Path:turn.end")) {
            this._log("收到结束信号，移除消息处理器");
            this._ws.removeEventListener('message', messageHandler);
            this._log(`解析完成，音频块数: ${audioChunks.length}`);
            resolve(new Blob(audioChunks, { type: 'audio/webm' }));
          }
        } else if (event.data instanceof Blob) {
          this._log(`收到 Blob 数据，大小: ${event.data.size} 字节`);
          event.data.arrayBuffer().then(buffer => {
            const data = new Uint8Array(buffer);
            const headerEnd = MsEdgeTTS.BINARY_DELIM.length + data.indexOf(MsEdgeTTS.BINARY_DELIM);
            const audioData = data.slice(headerEnd);
            audioChunks.push(audioData);
            this._log(`处理音频数据，当前块数: ${audioChunks.length}，本次块大小: ${audioData.length} 字节`);
          });
        }
      };

      this._log("添加消息处理器");
      this._ws.addEventListener('message', messageHandler);
      
      this._log("发送 SSML 请求");
      const ssmlRequest = `X-RequestId:${requestId}\r\nContent-Type:application/ssml+xml\r\nPath:ssml\r\n\r\n${ssml}`;
      this._log(`SSML 请求内容: ${ssmlRequest}`);
      this._ws.send(ssmlRequest);
      this._log("SSML 请求已发送");
    });
  }

  _SSMLTemplate(input) {
    this._log("生成 SSML 模板");
    return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="${this._voiceLocale}">
      <voice name="${this._voice}">
        ${input}
      </voice>
    </speak>`;
  }

  _generateRequestId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  close() {
    this._log("关闭 MsEdgeTTS 实例");
    if (this._ws) {
      this._log("关闭 WebSocket 连接");
      this._ws.close();
      this._ws = null;
    }
  }

  async toAudioBuffer(input) {
    this._log("开始转换文本到 AudioBuffer");
    if (!this._ws) {
      this._log("WebSocket 未初始化，抛出错误");
      throw new Error("WebSocket not initialized. Call setMetadata first.");
    }

    const ssml = this._SSMLTemplate(input);
    const requestId = this._generateRequestId();
    this._log(`生成的请求 ID: ${requestId}`);
    this._log(`生成的 SSML: ${ssml}`);
    
    return new Promise((resolve, reject) => {
      const audioChunks = [];
      
      const messageHandler = (event) => {
        if (typeof event.data === "string") {
          this._log(`收到字符串消息: ${event.data}`);
          if (event.data.includes("Path:turn.end")) {
            this._log("收到结束信号，移除消息处理器");
            this._ws.removeEventListener('message', messageHandler);
            this._log(`解析完成，音频块数: ${audioChunks.length}`);
            
            // 创建 AudioContext 和解码音频数据
            const context = new (window.AudioContext || window.webkitAudioContext)();
            const blob = new Blob(audioChunks, { type: 'audio/webm' });
            blob.arrayBuffer().then(arrayBuffer => {
              context.decodeAudioData(arrayBuffer, (audioBuffer) => {
                resolve(audioBuffer);
              }, (err) => {
                reject(new Error("解码音频数据失败: " + err));
              });
            });
          }
        } else if (event.data instanceof Blob) {
          this._log(`收到 Blob 数据，大小: ${event.data.size} 字节`);
          event.data.arrayBuffer().then(buffer => {
            const data = new Uint8Array(buffer);
            const headerEnd = MsEdgeTTS.BINARY_DELIM.length + data.indexOf(MsEdgeTTS.BINARY_DELIM);
            const audioData = data.slice(headerEnd);
            audioChunks.push(audioData);
            this._log(`处理音频数据，当前块数: ${audioChunks.length}，本次块大小: ${audioData.length} 字节`);
          });
        }
      };

      this._log("添加消息处理器");
      this._ws.addEventListener('message', messageHandler);
      
      this._log("发送 SSML 请求");
      const ssmlRequest = `X-RequestId:${requestId}\r\nContent-Type:application/ssml+xml\r\nPath:ssml\r\n\r\n${ssml}`;
      this._log(`SSML 请求内容: ${ssmlRequest}`);
      this._ws.send(ssmlRequest);
      this._log("SSML 请求已发送");
    });
  }

  async playAudioWithAudioContext(input) {
    this._log("开始使用 AudioContext 播放音频");
    if (!this._ws) {
      this._log("WebSocket 未初始化，抛出错误");
      throw new Error("WebSocket not initialized. Call setMetadata first.");
    }

    const ssml = this._SSMLTemplate(input);
    const requestId = this._generateRequestId();
    this._log(`生成的请求 ID: ${requestId}`);
    this._log(`生成的 SSML: ${ssml}`);
    
    return new Promise((resolve, reject) => {
      const audioChunks = [];
      
      const messageHandler = (event) => {
        if (typeof event.data === "string") {
          this._log(`收到字符串消息: ${event.data}`);
          if (event.data.includes("Path:turn.end")) {
            this._log("收到结束信号，移除消息处理器");
            this._ws.removeEventListener('message', messageHandler);
            this._log(`解析完成，音频块数: ${audioChunks.length}`);
            
            // 创建 AudioContext 和解码音频数据
            const context = new (window.AudioContext || window.webkitAudioContext)();
            const blob = new Blob(audioChunks, { type: 'audio/webm' });
            blob.arrayBuffer().then(arrayBuffer => {
              context.decodeAudioData(arrayBuffer, (audioBuffer) => {
                const source = context.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(context.destination);
                source.start(0);
                resolve();
              }, (err) => {
                reject(new Error("解码音频数据失败: " + err));
              });
            });
          }
        } else if (event.data instanceof Blob) {
          this._log(`收到 Blob 数据，大小: ${event.data.size} 字节`);
          event.data.arrayBuffer().then(buffer => {
            const data = new Uint8Array(buffer);
            const headerEnd = MsEdgeTTS.BINARY_DELIM.length + data.indexOf(MsEdgeTTS.BINARY_DELIM);
            const audioData = data.slice(headerEnd);
            audioChunks.push(audioData);
            this._log(`处理音频数据，当前块数: ${audioChunks.length}，本次块大小: ${audioData.length} 字节`);
          });
        }
      };

      this._log("添加消息处理器");
      this._ws.addEventListener('message', messageHandler);
      
      this._log("发送 SSML 请求");
      const ssmlRequest = `X-RequestId:${requestId}\r\nContent-Type:application/ssml+xml\r\nPath:ssml\r\n\r\n${ssml}`;
      this._log(`SSML 请求内容: ${ssmlRequest}`);
      this._ws.send(ssmlRequest);
      this._log("SSML 请求已发送");
    });
  }
}

// 将 MsEdgeTTS 类添加到全局作用域
window.MsEdgeTTS = MsEdgeTTS;
