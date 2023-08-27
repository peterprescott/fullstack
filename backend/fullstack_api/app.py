import os

from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from flask_praetorian import Praetorian
from flask_restful import Api

import fullstack_api.config as cfg
import fullstack_api.models as mdl
import fullstack_api.resources as rsrc

load_dotenv()

app = Flask(__name__)
app.config.from_object(cfg.Config)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY")
engine = mdl.db.create_engine(cfg.Config.SQLALCHEMY_DATABASE_URI)
mdl.db.metadata.create_all(engine)
mdl.db.init_app(app)
guard = Praetorian()
guard.init_app(app, mdl.User)
cors = CORS()
cors.init_app(app)
api = Api(app)
api.add_resource(rsrc.HelloWorld, "/")
rsrc.add_dynamic_resources(api, mdl.User)
