# app/__init__.py
from flask import Flask, current_app
from flask_cors import CORS
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
    app.config["MONGO_URI"] = "mongodb+srv://rithvik:FcHMhwUQMnuoT70a@ridesmgmt.yjcqq.mongodb.net/?retryWrites=true&w=majority&appName=ridesmgmt"
    app.config["GOOGLE_API_KEY"] = "AIzaSyDJ6xZxVNPiNVWIGsE82M1tOGeqHfGX7dI"


    # Initialize database
    CORS(app,supports_credentials=True)
    Database.initialize(app)
    jwt = JWTManager(app)

    @jwt.token_in_blocklist_loader
    def check_if_token_in_blacklist(jwt_header, jwt_payload):
        jti = jwt_payload["jti"]  # "jti" (JWT ID) is a unique identifier for each token
        return jti in blacklist

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.driver_actions import driver_bp
    from app.routes.rider_actions import rider_bp
    from app.routes.cordinates import coordinates_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(driver_bp)
    app.register_blueprint(rider_bp)
    app.register_blueprint(coordinates_bp)

    return app