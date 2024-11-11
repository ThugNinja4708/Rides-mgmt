from pymongo import MongoClient
from pymongo.server_api import ServerApi
class Database:
    client = None
    db = None

    @staticmethod
    def initialize(app):
        if Database.client is None:
            Database.client = MongoClient(app.config["MONGO_URI"], server_api=ServerApi('1'))
            Database.db = Database.client[app.config["DB_NAME"]]

    @staticmethod
    def get_db():
        return Database.db