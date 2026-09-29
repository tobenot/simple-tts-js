import http.server
import socketserver
import urllib.parse

PORT = 8000


class Handler(http.server.SimpleHTTPRequestHandler):
    """本机预览用 handler：拒绝隐藏条目，防止服务根内的元数据（如 .git）被外部读取。"""

    def _reject_hidden(self):
        parts = urllib.parse.urlsplit(self.path).path.split("/")
        if any(p.startswith(".") for p in parts):
            self.send_error(403, "Forbidden")
            return True
        return False

    def do_GET(self):
        if self._reject_hidden():
            return
        super().do_GET()

    def do_HEAD(self):
        if self._reject_hidden():
            return
        super().do_HEAD()


# 仅监听本机回环。绑 ""（即 0.0.0.0）会把当前目录暴露给整个局域网，切勿改回。
with socketserver.TCPServer(("127.0.0.1", PORT), Handler) as httpd:
    print(f"在 http://127.0.0.1:{PORT} 提供服务 访问 http://127.0.0.1:8000/tts-demo.html")
    httpd.serve_forever()
