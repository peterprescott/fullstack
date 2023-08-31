"""
PythonAnywhere WSGI (web-server gateway interface) script.

All that is required is:
- to add the fullstack project directory to sys.path;
- to import the app object as 'application'

PythonAnywhere then needs this script to be found at
f'/var/www/{pythonanywhere_username}_pythonanywhere_com_wsgi.py'
"""

import sys

PROJECT_HOME = "/var/www/fullstack/backend"
if PROJECT_HOME not in sys.path:
    sys.path = [PROJECT_HOME] + sys.path

# import flask app but need to call it "application" for WSGI to work
from fullstack_api.app import \
    app as application  # pylint: disable=wrong-import-position,unused-import
