from app.database import Database
from bson import ObjectId

booking_collection = Database.get_db().booking


class Booking:
    def __init__(
        self,
        driver_id,
        ride_id,
        rider_id,
        payment_id,
        driver_earning=0,
        admin_commission=0,
        _id = None
    ) -> None:
        self._id = ObjectId(_id) if _id else ObjectId()
        self.driver_id = ObjectId(driver_id)
        self.ride_id = ObjectId(ride_id)
        self.rider_id = ObjectId(rider_id)
        self.driver_earning = driver_earning
        self.admin_commission = admin_commission
        self.payment_id = payment_id

    def add_booking(self, price_per_seat):
        booking_data = {
            "booking_id": self._id,
            "driver_id": self.driver_id,
            "ride_id": self.ride_id,
            "rider_id": self.rider_id,
            "driver_earning": (price_per_seat * 0.8),
            "admin_commission": (price_per_seat * 0.2),
            "payment_id": self.payment_id,
        }
        result = booking_collection.update_one(
            {"_id": self._id}, {"$set": booking_data}, upsert=True
        )
        return result.modified_count

    def save(self):
        booking_data = {
            "booking_id": self._id,
            "driver_id": self.driver_id,
            "ride_id": self.ride_id,
            "rider_id": self.rider_id,
            "driver_earning": self.driver_earning,
            "admin_commission": self.admin_commission,
            "payment_id": self.payment_id,
        }
        result = booking_collection.update_one(
            {"_id": self._id}, {"$set": booking_data}, upsert=True
        )
        return result.modified_count

    @staticmethod
    def from_dict(data):
        return Booking(
            _id=data["_id"],
            driver_id=data["driver_id"],
            ride_id=data["ride_id"],
            rider_id=data["rider_id"],
            driver_earning=data["driver_earning"],
            admin_commission=data["admin_commission"],
            payment_id=data["payment_id"]
        )

    @staticmethod
    def get_all_bookings_by_ride_id( ride_id):
        bookings_cursor = booking_collection.find(
            {"ride_id": ObjectId(ride_id)}
        )
        bookings = [Booking.from_dict(booking) for booking in bookings_cursor]
        return bookings
