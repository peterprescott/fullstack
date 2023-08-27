"""
Test that the app is running.
"""

import subprocess
import time

import toml
from requests import get


def test_app_runs():
    """Test that the server is running."""

    server = subprocess.Popen(  # pylint: disable=consider-using-with
        ["python", "run.py"]
    )
    # Give the server time to start
    time.sleep(1)

    with open("fullstack.toml", "r", encoding="utf-8") as file:
        config = toml.load(file)
        config = config.get("local", {})
        backend_port = config.get("backend_port", 5000)
        frontend_port = config.get("frontend_port", 8000)

    try:
        backend_request = get(
            f"http://localhost:{backend_port}", timeout=3
        )
        assert backend_request.status_code != 404

        frontend_request = get(
            f"http://localhost:{frontend_port}", timeout=3
        )
        assert frontend_request.status_code != 404
    except Exception as e:
        print(e)
        server.terminate()
        raise e
