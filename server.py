import asyncio
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlsplit

import edge_tts


ROOT = Path(__file__).resolve().parent
HOST = "127.0.0.1"
VOICE = "uz-UZ-MadinaNeural"
MAX_TEXT_LENGTH = 3000


async def synthesize_speech(text: str) -> bytes:
    communicator = edge_tts.Communicate(text, VOICE)
    audio_chunks = []
    async for chunk in communicator.stream():
        if chunk["type"] == "audio":
            audio_chunks.append(chunk["data"])
    if not audio_chunks:
        raise RuntimeError("The speech service returned no audio.")
    return b"".join(audio_chunks)


class SolarSystemHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        request = urlsplit(self.path)
        if request.path != "/api/speech":
            return super().do_GET()

        text = parse_qs(request.query).get("text", [""])[0].strip()
        if not text:
            return self.send_error(400, "Speech text is required.")
        if len(text) > MAX_TEXT_LENGTH:
            return self.send_error(413, f"Speech text must be {MAX_TEXT_LENGTH} characters or fewer.")

        try:
            audio = asyncio.run(synthesize_speech(text))
        except Exception as error:
            self.log_error("Uzbek speech synthesis failed: %s", error)
            return self.send_error(502, "Uzbek speech synthesis failed. Check the internet connection and retry.")

        self.send_response(200)
        self.send_header("Content-Type", "audio/mpeg")
        self.send_header("Content-Length", str(len(audio)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(audio)


def main():
    server = ThreadingHTTPServer(
        (HOST, 0),
        SolarSystemHandler,
    )
    port = server.server_address[1]
    print(f"Sayt http://{HOST}:{port} manzilida ishga tushdi. To‘xtatish uchun Ctrl+C bosing.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer to‘xtatildi.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
