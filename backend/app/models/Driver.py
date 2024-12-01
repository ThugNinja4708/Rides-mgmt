from datetime import datetime, timezone
from bson import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash
from app.database import Database

driver_collection = Database.get_db().driver


class Driver:
    def __init__(
        self,
        username,
        email,
        phone_number = None,
        password=None,
        _id=None,
        created_at=None,
        updated_at = None,
        password_hash=None,
        vehicle_info=None,
        license_number = None
    ):
        self._id = ObjectId(_id) if _id else ObjectId()
        self.username = username
        self.email = email
        self.phone_number = phone_number
        self.vehicle_info = vehicle_info
        self.license_number = license_number

        # Handle password and password_hash initialization
        if password and not password_hash:
            self.password_hash = generate_password_hash(password)
        else:
            self.password_hash = password_hash

        # Handle timestamps
        self.created_at = created_at if created_at else datetime.now(timezone.utc)
        self.updated_at = updated_at if updated_at else datetime.now(timezone.utc)

    @staticmethod
    def get_by_id(user_id):
        try:
            user_data = driver_collection.find_one({"_id": ObjectId(user_id)})
            return Driver.from_db(user_data) if user_data else None
        except Exception as e:
            print(f"Error fetching Driver by ID: {e}")
            return None

    @staticmethod
    def get_by_email(email: str):
        try:
            user_data = driver_collection.find_one({"email": email})
            return Driver.from_db(user_data) if user_data else None
        except Exception as e:
            print(f"Error fetching Driver by ID: {e}")
            return None

    @staticmethod
    def from_db(user_data):
        if not user_data:
            return None
        return Driver(
            username=user_data["username"],
            email=user_data["email"],
            phone_number=user_data["phone_number"],
            _id=user_data["_id"],
            password_hash=user_data["password_hash"],
            created_at=user_data["created_at"],
            updated_at=user_data["updated_at"],
            license_number=user_data["license_number"]
        )

    def save(self):
        user_data = {
            "_id": self._id,
            "username": self.username,
            "email": self.email,
            "password_hash": self.password_hash,
            "created_at": self.created_at,
            "updated_at": datetime.now(timezone.utc),
            "phone_number": self.phone_number,
            "license_number": self.license_number
        }
        driver_collection.update_one({"_id": self._id}, {"$set": user_data}, upsert=True)
        return self

    def check_password(self, password):
        if not password or not self.password_hash:
            return False
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": str(self._id),
            "username": self.username,
            "email": self.email,
            "phone_number": self.phone_number,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
    
    @staticmethod
    def add_vehicle_info(user_id, vehicle_info_dict):
        filter_query = {"_id":  ObjectId(user_id)}
        update_value = {"$push":{
            "vehicle_info": {
                "make": vehicle_info_dict.get("make"),
                "model": vehicle_info_dict.get("model"),
                "license_plate": vehicle_info_dict.get("license_plate"),
                "capacity": vehicle_info_dict.get("capacity"),
            }
        }}
        driver_collection.update_one(filter_query, update_value)
        return vehicle_info_dict
    
    def get_all_vehicles(driver_id):

        query = {"_id": ObjectId(driver_id)}
        projection = {"vehicle_info": 1, "_id": 0}
    
        result = driver_collection.find_one(query, projection)
        if result and "vehicle_info" in result:
            return result["vehicle_info"]
        else:
            return []

    
    def get_driver_and_vehicle_name(driver_id,vehicle_id):
        query = {
        "_id": driver_id,
        "vehicle_info.id": vehicle_id
    }

    # Projection to fetch only the required fields
        projection = {
        "username": 1,
        "vehicle_info.name": 1
    }

    # Find the matching document
        driver = driver_collection.find_one(query, projection)

        if driver:
            return {
            "username": driver.get("username"),
            "vehicle_name": driver.get("vehicle_info", {}).get("name")
        }
        else:
            return None 
        
    def get_all_vehicles(driver_id):
        query = {"_id": driver_id}
    
    # Projection to return only vehicle_info
        projection = {"vehicle_info": 1, "_id": 0}
    
    # Fetch the driver's vehicle information
        result = driver_collection.find_one(query, projection)
    
        if result and "vehicle_info" in result:
            return result["vehicle_info"]
        else:
            return {}


    def __repr__(self):
        return f"<Rider {self.username} ({self.email})>"
