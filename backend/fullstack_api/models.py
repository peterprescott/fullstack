"""
This file contains the models for the database.
"""

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class User(db.Model):
    """
    User model for Flask Praetorian authentication.
    """

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.Text, nullable=False, unique=True)
    email = db.Column(db.Text, nullable=True, unique=True)
    hashed_password = db.Column(db.Text, nullable=False)
    roles = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True, server_default="true")

    def __repr__(self):
        return f"<User {self.username}>"

    @property
    def identity(self):
        """
        Required by Flask Praetorian.
        """
        return self.id

    @property
    def rolenames(self):
        """
        Required by Flask Praetorian.
        """
        try:
            return self.roles.split(",")
        except Exception:  # pylint: disable=broad-except
            return []

    @property
    def password(self):
        """
        Required by Flask Praetorian.
        """
        return self.hashed_password

    @classmethod
    def lookup(cls, username):
        """
        Required by Flask Praetorian.
        """
        return db.session.execute(
            db.select(cls).where(cls.username == username)
        ).scalar_one_or_none()

    @classmethod
    def identify(cls, user_id):
        """
        Required by Flask Praetorian.
        """
        return cls.query.get(user_id)

    def is_valid(self):
        """
        Required by Flask Praetorian.
        """
        return self.is_active

    def serialize(self):
        """
        Returns a JSON-serializable representation of the User.
        Required by dynamic resource registration.
        """
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "roles": self.roles,
            "is_active": self.is_active,
        }
