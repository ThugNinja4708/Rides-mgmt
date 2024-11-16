from app.database import Database
from bson import ObjectId
from datetime import datetime, timezone
from app.utils.constants import RideStatus

rides_collection = Database.get_db().rides
rides_collection.create_index([("pickup_location", "2dsphere")])

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
        start_time: datetime,
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
            vehicle_id=rides_data["vehicle_id"],
            updated_at=rides_data["updated_at"],
            created_at=rides_data["created_at"],
            list_of_riders = rides_data["list_of_riders"]
        )

    def create_ride(self):
        ride_data = {
            "driver_id": self.driver_id,
            "pickup_location": {
                "type":"Point",
                "coordinates": self.pickup_location
            },
            "drop_location":  {
                "type": "Point",
                "coordinates": self.drop_location
            },
            "status": self.status,
            "price_per_seat": self.price_per_seat,
            "start_time": self.start_time,
            "capacity": self.capacity,
            "list_of_riders": self.list_of_riders,
            "vehicle_id": self.vehicle_id,
            "updated_at": datetime.now(timezone.utc),
            "created_at": self.created_at,
        }
        rides_collection.update_one({"_id": self._id}, {"$set": ride_data}, upsert=True)
        return self

    def to_dict(self):
        return {
            "_id": str(self._id),
            "driver_id": str(self.driver_id),
            "pickup_location": {
                "type": "Point",
                "coordinates": self.pickup_location  # [longitude, latitude]
            },
            "drop_location": {
                "type": "Point",
                "coordinates": self.drop_location  # [longitude, latitude]
            },
            "status": self.status,
            "price_per_seat": self.price_per_seat,
            "start_time": self.start_time.isoformat(),
            "capacity": self.capacity,
            "vehicle_id": str(self.vehicle_id),
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }


    @staticmethod
    def get_all_rides_driver(filter):
        condition1 = {"driver_id": ObjectId(filter["driver_id"])}
        if filter.get("status") is not None:
            condition2 = {"status": filter["status"]}
            rides = rides_collection.find({"$and": [condition1, condition2]})
        else:
            rides = rides_collection.find({"driver_id": ObjectId(filter["driver_id"])})

        return rides

    @staticmethod
    def get_all_rides_rider(current_location=None):
        if current_location is not None:
            rides_cursor = rides_collection.find({
                "pickup_location": {
                    "$near": {
                        "$geometry": {
                            "type": "Point",
                            "coordinates": current_location  # [longitude, latitude]
                        },
                        "$maxDistance": 5*1000  # Distance in meters
                    }
                }
            })
            return [Rides.from_db(ride) for ride in rides_cursor]
        return []

    @staticmethod
    def get_all_rides_status(rider_id, status="scheduled"):
        condition1 = {"list_of_riders": ObjectId(rider_id)}
        condition2 = {"status": status}
        rides_cursor = rides_collection.find({"$and": [condition1, condition2]})
        rides = [Rides.from_db(ride) for ride in rides_cursor]
        return rides

    @staticmethod
    def add_rider_to_ride(ride_id, rider_id):
        result = rides_collection.update_one(
            {"_id": ObjectId(ride_id)},
            {"$addToSet": {"list_of_riders": ObjectId(rider_id)}},
        )
        return result.modified_count

    def cancel_ride(ride_id, driver_id):
        condition1 =  {"_id": ObjectId(ride_id)}
        condition2 = {"driver_id": ObjectId(driver_id)}
        result = rides_collection.update_one(
            {"$and": [condition1, condition2]},
            {"$set": {"status": RideStatus.CANCELLED.value}}
        )
        return result.modified_count
