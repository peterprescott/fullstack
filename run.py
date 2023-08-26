import os
import threading
from http.server import HTTPServer, SimpleHTTPRequestHandler
import socketserver

from api.api import app

FRONTEND_FOLDER = os.path.join('frontend', 'ui')

def run_flask_app():
    app.run(host='localhost', port=5000)

def serve(port = 8000, address="localhost", max_tries=3):
    
    class Handler(SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(directory=FRONTEND_FOLDER, *args, **kwargs)

    i = 0
    while i < max_tries:
        try:
            server = HTTPServer((address, port), Handler)
            print(f'\nFrontend is live at https://{address}:{port}')
            server.serve_forever()
        except OSError:
            print(f'\nPort {port} is busy...')
            port += 1
            i += 1

    if i == max_tries:
        print(f'Reached attempt limit of {max_tries}, try starting with a different port')

# Create threads for both functions
flask_thread = threading.Thread(target=run_flask_app)
static_thread = threading.Thread(target=serve)

# Start the threads
flask_thread.start()
static_thread.start()

# Wait for both threads to finish
flask_thread.join()
static_thread.join()
