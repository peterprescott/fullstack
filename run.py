#!/usr/bin/env python3
"""
Run the frontend and backend servers in parallel.
"""

import multiprocessing
import os
import socket
from http.server import HTTPServer, SimpleHTTPRequestHandler

import toml
from api.api import app

FRONTEND_FOLDER = os.path.join("frontend", "ui")
FRONTEND_PORT = 8000
BACKEND_PORT = 5000


def is_port_busy(port):
    """
    Check if a port is busy.
    """
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        sock.bind(("localhost", port))
        return False  # Port is available
    except socket.error:
        return True  # Port is already in use
    finally:
        sock.close()


def serve_on_available_port(func: callable):
    """
    Decorator to try to start a server on a port, and if it fails, try the next
    port until it succeeds or the max_tries limit is reached.
    """

    def wrapper(*args, **kwargs):
        port = kwargs.get("port", 8000)  # Default port value
        max_tries = kwargs.get(
            "max_tries", 10
        )  # Default max_tries value
        i = 0
        while i < max_tries:
            if not is_port_busy(port):
                kwargs["port"] = port
                return func(*args, **kwargs)
            else:
                print(f"\nPort {port} is busy...")
                port += 1
                i += 1

        if i == max_tries:
            print(
                f"Reached attempt limit of {max_tries}, "
                "try starting with a different port"
            )
        return None

    return wrapper


def create_server(site_folder: str, address: str, port: int):
    """
    Create a server to serve the files in the site_folder directory.
    """

    class Handler(SimpleHTTPRequestHandler):
        """
        Handler class to serve the files in the site_folder directory.
        """

        def __init__(self, *args, **kwargs):
            super().__init__(directory=site_folder, *args, **kwargs)

    return HTTPServer((address, port), Handler)


@serve_on_available_port
def serve_frontend(
    site_folder=FRONTEND_FOLDER, port=8000, address="localhost"
):
    """
    Serve the frontend on the given port.
    """
    server = create_server(site_folder, address, port)
    print(f"\nFrontend is live at https://{address}:{port}")
    print(f"Serving files from {site_folder}")
    server.serve_forever()


@serve_on_available_port
def serve_backend(port=5000, address="localhost"):
    """
    Serve the backend on the given port.
    """
    print(f"\nBackend is live at https://{address}:{port}")
    app.run(host=address, port=port)


if __name__ == "__main__":
    with open("fullstack.toml", "r", encoding="utf-8") as f:
        config = toml.load(f).get("local", {})
        frontend_port = config.get("frontend_port") or FRONTEND_PORT
        frontend_folder = (
            os.path.join(*config.get("frontend_folder"))
            or FRONTEND_FOLDER
        )
        backend_port = config.get("backend_port") or BACKEND_PORT

    frontend_process = multiprocessing.Process(
        target=serve_frontend,
        kwargs={"port": frontend_port, "site_folder": frontend_folder},
    )
    backend_process = multiprocessing.Process(
        target=serve_backend, kwargs={"port": backend_port}
    )

    frontend_process.start()
    backend_process.start()

    frontend_process.join()
    backend_process.join()
