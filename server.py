#!/usr/bin/env python3
import http.server
import socketserver
import random

# 尝试多个端口
for port in range(8000, 8100):
    try:
        with socketserver.TCPServer(("", port), http.server.SimpleHTTPRequestHandler) as httpd:
            print(f"服务器运行在端口: {port}")
            print(f"请在浏览器中访问: http://localhost:{port}")
            httpd.serve_forever()
    except OSError:
        continue