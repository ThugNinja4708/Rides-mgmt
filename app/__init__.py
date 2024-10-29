# app/__init__.py
from flask import Flask, current_app
# from config import config_by_name
from app.database import Database
import os
import datetime

def create_app():
    app = Flask(__name__)

    # Load config
    # TODO: move these to config file
    app.config['SECRET_KEY'] = os.urandom(24)  # Change to static key in production
    app.config['JWT_SECRET_KEY'] = os.urandom(24)  # Separate key for JWT
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(hours=1)
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = datetime.timedelta(days=30)
    app.config["DB_NAME"] = "rides_mgmt"
    # MongoDB connection
    app.config["MONGO_URI"] = "mongodb://localhost:27017/"
# DB_NAME = "rides_mgmt"

    # Initialize database
    Database.initialize(app)

    # Register blueprints
    from app.routes.auth import auth_bp
    # from app.routes.user import user_bp

    app.register_blueprint(auth_bp)
    # app.register_blueprint(user_bp)

    return app