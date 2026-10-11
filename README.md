# 智能语音合成工具

## 项目描述

这是一个基于 Vue 3 的浏览器语音合成工具。当前 `simple-tts.html` 与共享的 `tts.js` 使用 SSML、远端 readaloud WebSocket 服务及返回的音频 Blob，不使用浏览器的 `speechSynthesis` / `SpeechSynthesisUtterance`。用户可以输入文本，选择语言和语音，调整音调和语速，然后播放或下载返回的音频。可用语言和声音以服务实际返回为准。

## 主要功能

1. 文本输入：用户可以在文本框中输入要合成的内容。
2. 语言选择：支持多种语言，用户可以从下拉菜单中选择。
3. 语音选择：每种语言都有多个可用的语音选项。
4. 音调调整：用户可以通过滑块调整音调（-100到+100）。
5. 语速调整：用户可以通过滑块调整语速（-100到+100）。
6. 播放功能：点击"播放语音"按钮可以直接听到合成的语音。
7. 下载功能：点击"下载语音"按钮可以将合成的语音保存为WebM格式的音频文件。

## 技术栈

- HTML5
- CSS3
- JavaScript (ES6+)
- Vue 3
- SSML / 远端 readaloud 合成
- WebSocket 与音频 Blob

## 本地入口与外部依赖

本仓库没有 npm manifest 或构建链。`index.html` 是入口导航，`simple-tts.html` 是独立面板，`tts-demo.html` 和 `script-reading-demo.html` 读取已跟踪的 `tts.js`。从仓库根用 Python 3 仅在本机预览：

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

打开 `http://127.0.0.1:8000/`，结束时 Ctrl+C。Windows 可用现有 Python 3 入口 `python` 执行相同参数。历史 `tts-demo-server.py` 会服务调用时的工作目录并监听所有接口，本批未运行，冷启动不要求使用它。

页面从 unpkg 获取 Vue 3.2.45，并向 `speech.platform.bing.com` 请求声音列表、建立合成 WebSocket。这些运行时外部输入不由 Git 保存，本地 HTML 能打开不等于服务当前可用或能离线合成。本批只检查代码声明，没有连接服务、发送文本、验证当前声音清单或取得音频，也没有变更服务访问参数。

当前声明输出 `24khz-16bit-mono-opus`，页面把 Blob 标为 `audio/webm`。这是代码声明，不是本轮检查音频字节得到的格式鉴定。`rubbish/` 中是已跟踪的历史代码，不属于本轮新增缓存，没有因为名字含垃圾而删除。

## 如何使用

1. 在文本框中输入要合成的内容。
2. 选择所需的语言和语音。
3. 根据需要调整音调和语速。
4. 点击"播放语音"按钮来听取合成的语音。
5. 如果需要保存音频文件，点击"下载语音"按钮。

## 注意事项

- 本工具使用了Microsoft Bing的语音合成服务，需要保持网络连接。
- 音频文件以WebM格式保存，可能需要特定的播放器才能播放。
- 使用时请遵守相关的服务条款和使用规定。

## 致谢

本项目的代码改编自 [pansong291/ashe](https://github.com/pansong291/ashe/blob/64e57ef33bba7125636050765a2326e7b280e6b8/html/tool/text-audio.html#L102)。

# 声音报告

历史中文（普通话，简体）声音报告，保留作角色选择参考，不代表 2026-10-11 的服务声音列表已重新验证：

1. 少女声音：
   - zh-CN-XiaoxiaoNeural（女性）：标准少女声音
   - zh-CN-XiaoyiNeural（女性）：较为年幼的少女声音

2. 少年声音：
   - zh-CN-YunxiNeural（男性）：标准少年声音，可通过调整音调改变年龄感
     - 建议：将音调调至-15可获得正常少年声音

3. 成年女性声音：
   - zh-CN-YunxiaNeural（女性）：稍微成熟一点的少女/年轻女性声音

4. 成年男性声音：
   - zh-CN-YunjianNeural（男性）：大叔声音
   - zh-CN-YunyangNeural（男性）：壮年男性声音，较为正式/官方

使用建议：

1. 角色分配：
   - 青少年角色可使用XiaoxiaoNeural、XiaoyiNeural或YunxiNeural
   - 成年女性角色可使用YunxiaNeural
   - 成年男性角色可使用YunjianNeural或YunyangNeural

2. 音调调整：
   - 利用音调调整功能微调声音，使其更符合角色特征
   - 例如，将YunxiNeural的音调调至-15可获得更自然的少年声音

3. 语速控制：
   - 根据角色性格和情境调整语速，增加表现力

4. 音量调整：
   - 适当调整音量以突出重要角色或关键对话

5. 多样化：
   - 尽量为不同角色选择不同声音，增加辨识度