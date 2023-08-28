"""
This file contains the configuration for the Flask app.
"""

import os
from pathlib import Path

run_location = Path(os.getcwd())
data_dir = run_location / "data"
if not data_dir.exists():
    data_dir.mkdir()

default_users = [
    {
        "username": "admin",
        "password": "admin",
        "roles": "admin",
    },
    {
        "username": "user",
        "password": "user",
    },
]


class Config:
    # pylint: disable=too-few-public-methods,missing-class-docstring
    SQLALCHEMY_DATABASE_URI = f"sqlite:///{data_dir}/.sqlite.db"
    JWT_ACCESS_LIFESPAN = {"days": 100}
