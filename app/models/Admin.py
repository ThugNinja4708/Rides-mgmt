
from datetime import datetime, timezone
from bson import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash
from app.database import Database

admin_collection = Database.get_db().admin
class Admin:
    def __init__(self, username, email, phone_number, password=None, _id=None, refresh_token = []):
        self._id = _id if _id else ObjectId()
        self.username = username
        self.email = email
        self.password_hash = generate_password_hash(password) if password else None
        self.created_at = datetime.now(timezone.utc)
        self.updated_at = datetime.now(timezone.utc)
        self.refresh_token = refresh_token
        self.phone_number = phone_number

    @staticmethod
    def get_by_id(user_id):
        user_data = admin_collection.find_one({'_id': ObjectId(user_id)})
        return Admin.from_db(user_data) if user_data else None

    @staticmethod
    def get_by_email(email):
        user_data = admin_collection.find_one({'email': email})
        return Admin.from_db(user_data) if user_data else None

    @staticmethod
    def from_db(user_data):
        if not user_data:
            return None
        return Admin(
            username=user_data['username'],
            email=user_data['email'],
            _id=user_data['_id']
        )

    def save(self):
        user_data = {
            '_id': self._id,
            'username': self.username,
            'email': self.email,
            'password_hash': self.password_hash,
            'created_at': self.created_at,
            'updated_at': datetime.now(timezone.utc)
        }
        admin_collection.update_one(
            {'_id': self._id},
            {'$set': user_data},
            upsert=True
        )
        return self

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': str(self._id),
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
