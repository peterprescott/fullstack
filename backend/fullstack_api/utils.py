"""
Utility functions for the fullstack_api package.
"""

from fullstack_api.resources import guard


def hash_and_drop_password(user_data: dict):
    """
    Hashes the password and removes the password field from the user data.
    """
    user_data["hashed_password"] = guard.hash_password(user_data["password"])
    del user_data["password"]
    return user_data
