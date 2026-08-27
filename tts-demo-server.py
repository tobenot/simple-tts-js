import http.server
import socketserver

PORT = 8000

Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"在 http://localhost:{PORT} 提供服务 访问 http://localhost:8000/tts-demo.html")
    httpd.serve_forever()
