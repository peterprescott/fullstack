#!/usr/bin/env python3
"""
Run the frontend and backend servers in parallel.
"""

import io
import multiprocessing
import os
import re
import socket
import sys
import unicodedata
from datetime import datetime
from functools import wraps
from http.server import HTTPServer, SimpleHTTPRequestHandler
from time import time

import toml
from api.api import app

FRONTEND_FOLDER = os.path.join("frontend", "ui")
LOGS_FOLDER = "logs"
FRONTEND_PORT = 8000
BACKEND_PORT = 5000


def create_logs_folder():
    """
    Create the logs folder if it does not exist.
    """
    if not os.path.exists(LOGS_FOLDER):
        os.mkdir(LOGS_FOLDER)


def print_info(func_name):
    """
    Print information about the current process.
    """
    print("\n")
    print("time:", datetime.now().strftime("%Y-%m-%d_%H-%M-%S-%f"))
    print("func name:", func_name)
    print("parent process:", os.getppid())
    print("process id:", os.getpid())
    print("\n")


class CustomStdout(io.TextIOWrapper):
    """
    Allows writing to a log file, while echoing to stdout.
    """

    def __init__(self, stdout, output_list):
        super().__init__(
            stdout.buffer,
            stdout.encoding,
            stdout.errors,
            stdout.newlines,
            stdout.line_buffering,
        )
        self.output_list = output_list
        self.stdout = stdout

    def write(self, text):
        self.output_list.append(text)
        self.stdout.write(text)
        self.flush()


def strip_ansi_codes(str_input: str):
    """
    Strip ANSI codes from a string.
    cf. https://stackoverflow.com/questions/13506033/filtering-out-ansi-escape-sequences
    """
    return re.sub(
        r"\x1b\[([0-9,A-Z]{1,2}(;[0-9]{1,2})?(;[0-9]{3})?)?[m|K]?",
        "",
        str_input,
    )


def log_stdout(func: callable):
    """
    Wrapper for sys.stdout.write to write to a log file.
    """

    @wraps(func)
    def wrapper(*args, **kwargs):
        create_logs_folder()
        marker = "-" * 20 + "\n"
        logs = []
        logs.append(marker)
        original_stdout = sys.stdout
        original_stderr = sys.stderr
        sys.stdout = CustomStdout(original_stdout, logs)
        sys.stderr = CustomStdout(original_stderr, logs)
        print_info(func.__name__)
        start_time = time()
        func(*args, **kwargs)
        end_time = time()
        run_time = end_time - start_time
        print(
            f"\n\n{func.__name__} runtime: {run_time:.2f} seconds\n{marker}\n"
        )
        with open(
            os.path.join(LOGS_FOLDER, "logs.txt"),
            "a",
            encoding="ascii",
        ) as logfile:
            for item in logs:
                if isinstance(item, bytes):
                    item = item.decode("utf-8")
                unicode_normalized_item = unicodedata.normalize(
                    "NFKD", item
                ).encode("ascii", "ignore")
                try:
                    logfile.write(strip_ansi_codes(item))
                except TypeError:
                    logfile.write(
                        unicode_normalized_item.decode("ascii")
                    )

    return wrapper


def is_port_busy(port: int):
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

    @wraps(func)
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


@log_stdout
@serve_on_available_port
def serve_frontend(
    site_folder=FRONTEND_FOLDER, port=8000, address="localhost"
):
    """
    Serve the frontend on the given port.
    """
    server = create_server(site_folder, address, port)
    print(
        f"\nFrontend is live at https://{address}:{port}\n"
        f"Serving files from {site_folder}\n\n"
    )
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nKeyboard interrupt received, exiting.")
        server.server_close()


@log_stdout
@serve_on_available_port
def serve_backend(port=5000, address="localhost"):
    """
    Serve the backend on the given port.
    """
    print(f"\nBackend is live at https://{address}:{port}\n\n")
    app.run(host=address, port=port)


if __name__ == "__main__":
    print("\nLaunching fullstack app...\n")
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
