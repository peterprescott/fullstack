"""
This module contains the resources for the API. Resources are the
HTTP endpoints that the API exposes. They are the interface between
the API and the outside world.

Since Resource classes correspond to HTTP resources, and their class
methods (get, post, put, delete) correspond to HTTP methods, we can
disable the pylint warnings for missing docstrings.
"""
# pylint: disable=missing-class-docstring
# pylint: disable=missing-function-docstring

import os

import pandas as pd
import gzip
from flask import request
from flask_praetorian import Praetorian, auth_required, roles_required
from flask_restful import Api, Resource
from git import Repo
from sqlalchemy import inspect
from sqlalchemy.exc import OperationalError

from fullstack_api.config import data_dir
from fullstack_api.models import User, db

guard = Praetorian()


class Postcode(Resource):
    def get(self, postcode_str):
        postcode = "".join(
            [char.upper() for char in postcode_str if str.isalnum(char)]
        )
        try:
            data = db.session.execute(
                db.text(
                    f"SELECT * FROM postcode WHERE REPLACE(postcode, ' ','') = '{postcode}'"
                )
            ).fetchone()
        except OperationalError:
            postcode_csv = pd.read_csv(
                data_dir / "latlon.csv.gz",
                index_col=None,
            )
            postcode_csv.to_sql(
                "postcode",
                db.engine,
            )
        if data:
            return {
                "success": True,
                "postcode": data.postcode,
                "latitude": data.latitude,
                "longitude": data.longitude,
            }
        else:
            return {
                "success": False,
                "postcode": postcode_str,
                "message": "Postcode not found",
            }

class Boundaries(Resource):
    def get(self):
        with gzip.open(data_dir / "boundaries.geojson.gz", 'rt') as f:
            file_content = f.read()
            return file_content;

class HelloWorld(Resource):
    def get(self):
        return {
            "message": "Hello World!",
            "origin": Repo(
                os.path.dirname(__file__),
                search_parent_directories=True,
            ).remotes.origin.url,
            "branch": Repo(
                os.path.dirname(__file__),
                search_parent_directories=True,
            ).active_branch.name,
            "updated": str(
                Repo(
                    os.path.dirname(__file__),
                    search_parent_directories=True,
                ).head.commit.committed_datetime
            ),
        }


class Signup(Resource):
    def post(self):
        req = request.get_json(force=True)
        username = req.get("username", None)
        password = req.get("password", None)
        email = req.get("email", None)

        if username and password:
            new_user = User(
                username=username,
                hashed_password=guard.hash_password(password),
                email=email,
            )
            db.session.add(new_user)
            db.session.commit()

            user = guard.authenticate(username, password)
            access_token = guard.encode_jwt_token(user)
            ret = {
                "access_token": access_token,
                "message": "Signup successful",
                "roles": user.roles,
            }
            return ret, 200
        else:
            return {"message": "Invalid input"}, 400


class Login(Resource):
    def post(self):
        req = request.get_json(force=True)
        username = req.get("username", None)
        password = req.get("password", None)

        user = guard.authenticate(username, password)
        if user:
            access_token = guard.encode_jwt_token(user)
            ret = {
                "access_token": access_token,
                "message": "Login successful",
                "roles": user.roles,
            }
            return ret, 200
        else:
            return {"message": "Invalid credentials"}, 401


class Schema(Resource):
    @auth_required
    def get(self):
        schemas = {}
        # get list of all models from db
        registry = (
            db.Model.registry._class_registry
        )  # pylint: disable=protected-access
        for model_cls in registry.keys():
            if model_cls[0] != "_":
                model = registry[model_cls]
                serialized = model().serialize()
                # get list of all columns from model
                columns = []
                for column in inspect(model).columns:
                    columns.append(
                        {
                            "name": column.name,
                            "type": str(column.type),
                            "nullable": column.nullable,
                            "default": str(column.default),
                            "primary_key": column.primary_key,
                            "serialized": column.name in serialized,
                        }
                    )
                schemas[f"{model.__name__.lower()}s"] = columns
        return schemas


class Git(Resource):
    repo = Repo(
        os.path.dirname(__file__), search_parent_directories=True
    )

    @auth_required
    def get(self):
        return {
            "active_branch": self.repo.active_branch.name,
            "commit": str(self.repo.head.commit),
        }

    # @roles_required("dev")
    def post(self):
        self.repo.remotes.origin.pull()
        os.system("touch /var/www/*wsgi.py")
        return {"message": "Branch pulled successfully"}

    @roles_required("dev")
    def put(self):
        req = request.get_json(force=True)
        self.repo.git.checkout(req.get("branch"))
        return {"message": "Branch switched successfully"}

    @roles_required("dev")
    def delete(self):
        req = request.get_json(force=True)
        self.repo.git.checkout(req.get("branch"))
        self.repo.git.reset("--hard", "HEAD~1")
        return {"message": "Branch reset successfully"}


def generate_dynamic_resource(model: db.Model) -> (Resource, Resource):
    """
    Generate a resource and a list resource for a given model.
    """

    class DynamicResource(Resource):
        @auth_required
        def get(self, resource_id):
            resource = model.query.get_or_404(resource_id)
            return resource.serialize()

        @roles_required("admin")
        def put(self, resource_id):
            resource = model.query.get_or_404(resource_id)
            data = request.get_json()
            for key, value in data.items():
                setattr(resource, key, value)
            db.session.commit()
            return {"message": f"{model.__name__} updated successfully"}

        @roles_required("admin")
        def delete(self, resource_id):
            resource = model.query.get_or_404(resource_id)
            db.session.delete(resource)
            db.session.commit()
            return {"message": f"{model.__name__} deleted successfully"}

    class DynamicListResource(Resource):
        @auth_required
        def get(self):
            resources = model.query.all()
            return [resource.serialize() for resource in resources]

        @auth_required
        def post(self):
            data = request.get_json()
            resource = model(**data)
            db.session.add(resource)
            db.session.commit()
            return {
                "message": f"{model.__name__} created successfully",
                "resource_id": resource.id,
            }

    # Generate a unique class name
    class_name = f"Generated{model.__name__}Resource"
    dynamic_resource_class = type(class_name, (DynamicResource,), {})
    dynamic_list_resource_class = type(
        class_name + "List", (DynamicListResource,), {}
    )
    return dynamic_resource_class, dynamic_list_resource_class


def add_dynamic_resources(api: Api, model: db.Model, url: str = None):
    """
    For a given model, add a dynamically generated resource and list
    resource. So together, they can perform CRUD operations on the
    model.
    """
    if url is None:
        url = f"/{model.__name__.lower()}s"
    resource, list_resource = generate_dynamic_resource(model)
    api.add_resource(resource, f"{url}/<int:resource_id>")
    api.add_resource(list_resource, f"{url}")
