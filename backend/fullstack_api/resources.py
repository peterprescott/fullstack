from flask import request
from flask_praetorian import auth_required, roles_required
from flask_restful import Api, Resource

from fullstack_api.models import db


class HelloWorld(Resource):
    def get(self):
        return {"message": "Hello, World!"}


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
