from datetime import datetime, timezone
from app.database import Database
from bson import ObjectId

payment_collection = Database.get_db().payment


class Payment:
    def __init__(
        self,
        rider_id,
        payment_method=None,
        payment_status=None,
        payment_date=None,
        _id=None,
    ) -> None:
        self._id = ObjectId(_id) if _id else ObjectId()
        self.rider_id = ObjectId(rider_id)
        self.payment_method = payment_method
        self.payment_status = payment_status
        self.payment_date = payment_date if payment_date else datetime.now(timezone.utc)

    def make_payment(self):
        payment_data = {
            "_id": self._id,
            "rider_id": self.rider_id,
            "payment_method": self.payment_method,
            "payment_status": self.payment_status,
            "payment_date": self.payment_date,
        }
        payment_collection.update_one(
            {"_id": self._id}, {"$set": payment_data}, upsert=True
        )
        return self._id
