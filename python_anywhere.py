#! /usr/bin/python3
"""
This script is used to setup the PythonAnywhere server.
"""

import os
import random
import shutil
import string
import sys

PROJECT_HOME = "/var/www/fullstack/backend"


class NotOnPythonAnywhere(
    Exception
):  # pylint: disable=missing-docstring
    pass


print("Checking if running on PythonAnywhere...")
pa_env = os.environ.get("PYTHONANYWHERE_SITE", None)
if not pa_env:
    raise NotOnPythonAnywhere

print("Rewriting WSGI file...")
wsgi_filename = [
    f
    for f in os.listdir(os.path.join("/", "var", "www"))
    if "wsgi" in f
][0]
shutil.move(
    os.path.join("backend", "ops", "wsgi.py"),
    os.path.join("/", "var", "www", wsgi_filename),
)

print("Installing dependencies...")
os.system("pip3 install -r py_setup/dependencies.freeze")

print("Generating secret if none exists...")
if PROJECT_HOME not in sys.path:
    sys.path = [PROJECT_HOME] + sys.path
try:
    from fullstack_api.secret import SECRET_KEY
except ModuleNotFoundError:
    SECRET_KEY = "".join(
        random.SystemRandom().choice(
            string.ascii_uppercase + string.digits
        )
        for _ in range(50)
    )
    with open(
        os.path.join(PROJECT_HOME, "fullstack_api", "secret.py"),
        "w",
        encoding="utf-8",
    ) as f:
        f.write(f"SECRET_KEY = '{SECRET_KEY}'")
