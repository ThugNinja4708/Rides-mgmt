# app/__init__.py
from flask import Flask, current_app
# from config import config_by_name
from app.database import Database
import os
import datetime
from flask_jwt_extended import JWTManager

blacklist = set()
def create_app():
    app = Flask(__name__)

    # Load config
    # TODO: move these to config file
    app.config['SECRET_KEY'] = os.urandom(24)  # Change to static key in production
    app.config['JWT_SECRET_KEY'] = os.urandom(24)  # Separate key for JWT
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(hours=1)
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = datetime.timedelta(days=30)
    app.config["DB_NAME"] = "rides_mgmt"
    app.config["MONGO_URI"] = "mongodb+srv://rithvikkantha3771:<db_password>@ridesmgmt.w4tn0.mongodb.net/?retryWrites=true&w=majority&appName=ridesMgmt"


    # Initialize database
    Database.initialize(app)
    jwt = JWTManager(app)

    @jwt.token_in_blocklist_loader
    def check_if_token_in_blacklist(jwt_header, jwt_payload):
        jti = jwt_payload["jti"]  # "jti" (JWT ID) is a unique identifier for each token
        return jti in blacklist

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.driver import driver_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(driver_bp)

    return app