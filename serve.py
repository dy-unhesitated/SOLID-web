import http.server
import socketserver

PORT = 8091


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True


with ReusableTCPServer(("", PORT), NoCacheHandler) as httpd:
    print(f"Serving on port {PORT} (no-cache headers active)")
    httpd.serve_forever()
