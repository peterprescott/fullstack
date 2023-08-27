"""
This file contains the models for the database.
"""

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.Text, nullable=False, unique=True)
    email = db.Column(db.Text, nullable=True, unique=True)
    hashed_password = db.Column(db.Text, nullable=False)
    roles = db.Column(db.Text)
    is_active = db.Column(
        db.Boolean, default=True, server_default="true"
    )

    def __repr__(self):
        return f"<User {self.username}>"

    @property
    def identity(self):
        return self.id

    @property
    def rolenames(self):
        try:
            return self.roles.split(",")
        except Exception:
            return []

    @property
    def password(self):
        return self.hashed_password

    @classmethod
    def lookup(cls, username):
        return db.session.execute(
            db.select(cls).where(cls.username == username)
        ).scalar_one_or_none()

    @classmethod
    def identify(cls, id):
        return cls.query.get(id)

    def is_valid(self):
        return self.is_active

    def serialize(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "roles": self.roles,
            "is_active": self.is_active,
        }
