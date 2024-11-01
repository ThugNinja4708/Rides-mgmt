from pymongo import MongoClient
# from flask import current_app
class Database:
    client = None
    db = None

    @staticmethod
    def initialize(app):
        if Database.client is None:
            Database.client = MongoClient(app.config["MONGO_URI"])
            Database.db = Database.client[app.config["DB_NAME"]]

    @staticmethod
    def get_db():
        return Database.db