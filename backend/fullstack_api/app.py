"""
This module initializes the Flask app, creates the data tables, and
registers the resources. It also checks if the user table is empty and
if so, adds the default users.
"""

from flask import Flask
from flask_cors import CORS
from flask_restful import Api

import fullstack_api.resources as rsrc
from fullstack_api.config import Config, default_users
from fullstack_api.models import Book, Task, User, db
from fullstack_api.utils import hash_and_drop_password


# define exception for unchanged secret key
class UnchangedSecretKey(Exception):
    # pylint: disable=missing-class-docstring
    pass


app = Flask(__name__)
app.config.from_object(Config)
if app.config["SECRET_KEY"] == "your_secret_key":
    raise UnchangedSecretKey(
        "\n\nThis app will not run unless you change the SECRET_KEY"
    )

db.init_app(app)
engine = db.create_engine(Config.SQLALCHEMY_DATABASE_URI)
db.metadata.create_all(engine)
rsrc.guard.init_app(app, User)
cors = CORS()
cors.init_app(app)

api = Api(app)
api.add_resource(rsrc.HelloWorld, "/")
api.add_resource(rsrc.Signup, "/signup")
api.add_resource(rsrc.Login, "/login")
api.add_resource(rsrc.Schema, "/schemas")
api.add_resource(rsrc.Git, "/git")
api.add_resource(rsrc.Boundaries, "/boundaries")
api.add_resource(rsrc.Postcode, "/postcode/<string:postcode_str>")
rsrc.add_dynamic_resources(api, User)
rsrc.add_dynamic_resources(api, Task)
rsrc.add_dynamic_resources(api, Book)

# check if table user is empty
with app.app_context():
    # count users
    user_count = db.session.execute(
        db.text("select count(*) from user")
    ).scalar()
    if user_count == 0:
        for user in default_users:
            db.session.add(User(**hash_and_drop_password(user)))
            db.session.commit()
