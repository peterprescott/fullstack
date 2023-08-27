"""
This file contains the configuration for the Flask app.
"""


class Config:
    # pylint: disable=too-few-public-methods,missing-class-docstring
    SQLALCHEMY_DATABASE_URI = "sqlite:///.sqlite.db"
    JWT_ACCESS_LIFESPAN = {"days": 100}
