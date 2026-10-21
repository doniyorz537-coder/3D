import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qs, urlencode, urlsplit
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parent
HOST = "127.0.0.1"
SPEECHKIT_URL = "https://tts.api.cloud.yandex.net/speech/v1/tts:synthesize"
MAX_TEXT_LENGTH = 3000


class SpeechConfigurationError(Exception):
    pass


class SpeechServiceError(Exception):
    pass


def synthesize_speech(text: str) -> bytes:
    api_key = os.environ.get("YANDEX_API_KEY")
    if not api_key:
        raise SpeechConfigurationError(
            "Set the YANDEX_API_KEY environment variable to enable Yandex SpeechKit."
        )

    parameters = {
        "text": text,
        "lang": "ru-RU",
        "voice": "alena",
        "format": "mp3",
    }
    folder_id = os.environ.get("YANDEX_FOLDER_ID")
    if folder_id:
        parameters["folderId"] = folder_id

    request = Request(
        SPEECHKIT_URL,
        data=urlencode(parameters).encode("utf-8"),
        headers={
            "Authorization": f"Api-Key {api_key}",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        method="POST",
    )
    try:
        with urlopen(request, timeout=30) as response:
            audio = response.read()
    except HTTPError as error:
        details = error.read().decode("utf-8", errors="replace")
        raise SpeechServiceError(
            f"Yandex SpeechKit returned HTTP {error.code}: {details}"
        ) from error
    except (URLError, TimeoutError) as error:
        raise SpeechServiceError(f"Could not reach Yandex SpeechKit: {error}") from error

    if not audio:
        raise SpeechServiceError("Yandex SpeechKit returned no audio.")
    return audio


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
            audio = synthesize_speech(text)
        except SpeechConfigurationError as error:
            self.log_error("Yandex SpeechKit is not configured: %s", error)
            return self.send_error(503, "Set YANDEX_API_KEY on the server to enable speech.")
        except SpeechServiceError as error:
            self.log_error("Yandex SpeechKit synthesis failed: %s", error)
            return self.send_error(502, "Yandex SpeechKit failed. Check the server logs and try again.")

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
