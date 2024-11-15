from app.database import Database
from bson import ObjectId
from datetime import datetime, timezone

rides_collection = Database.get_db().rides


class Rides:
    def __init__(
        self,
        driver_id,
        pickup_location,
        vehicle_id,
        drop_location,
        status,
        capacity,
        price_per_seat,
        start_time,
        list_of_riders = [],
        created_at=None,
        updated_at=None,
        _id=None,
    ) -> None:
        self._id = ObjectId(_id) if _id else ObjectId()
        self.driver_id = ObjectId(driver_id) if driver_id else ObjectId()
        self.pickup_location = pickup_location
        self.drop_location = drop_location
        self.start_time = start_time
        self.status = status
        self.capacity = capacity
        self.price_per_seat = price_per_seat
        self.vehicle_id = vehicle_id
        self.list_of_riders = list_of_riders

        self.created_at = created_at if created_at else datetime.now(timezone.utc)
        self.updated_at = updated_at if updated_at else datetime.now(timezone.utc)

    @staticmethod
    def get_ride_by_id(user_id):
        try:
            rides_data = rides_collection.find_one({"_id": ObjectId(user_id)})
            return Rides.from_db(rides_data) if rides_data else None
        except Exception as e:
            print(f"Error fetching Rider by ID: {e}")
            return None

    @staticmethod
    def from_db(rides_data):
        if not rides_data:
            return None
        return Rides(
            _id=rides_data["_id"],
            driver_id=rides_data["driver_id"],
            pickup_location=rides_data["pickup_location"],
            drop_location=rides_data["drop_location"],
            status=rides_data["status"],
            price_per_seat=rides_data["price_per_seat"],
            start_time=rides_data["start_time"],
            capacity=rides_data["capacity"],
            list_of_riders = rides_data["list_of_riders"],
            vehicle_id=rides_data["vehicle_id"],
            updated_at=rides_data["updated_at"],
            created_at=rides_data["created_at"],
        )

    def create_ride(self):
        ride_data = {
            "driver_id": self.driver_id,
            "pickup_location": self.pickup_location,
            "drop_location": self.drop_location,
            "status": self.status,
            "price_per_seat": self.price_per_seat,
            "start_time": self.start_time,
            "capacity": self.capacity,
            "list_of_riders": self.list_of_riders,
            "vehicle_id": self.vehicle_id,
            "updated_at": datetime.now(timezone.utc),
            "created_at": self.created_at
        }
        rides_collection.update_one({"_id": self._id}, {"$set": ride_data}, upsert=True)
        return self