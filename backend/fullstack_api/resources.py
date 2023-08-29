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

from flask import request
from flask_praetorian import Praetorian, auth_required, roles_required
from flask_restful import Api, Resource
from sqlalchemy import inspect

from fullstack_api.models import User, db

guard = Praetorian()


class HelloWorld(Resource):
    def get(self):
        return {
            "message": "Hello, World!",
            "resources": ["users", "tasks"],
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
        registry = db.Model.registry._class_registry  # pylint: disable=protected-access
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
                schemas[model.__tablename__] = columns
        return schemas


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
    dynamic_list_resource_class = type(class_name + "List", (DynamicListResource,), {})
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
