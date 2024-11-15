from app.database import Database

booking_collection = Database.get_db().booking
class Booking:
    def __init__(self,
                 booking_id,
                 driver_id,
                 ride_id,
                 rider_id,
                 driver_earning,
                 admin_commission,
                 payment_id
                 ) -> None:
        self.booking_id = booking_id
        self.driver_id = driver_id
        self.ride_id = ride_id
        self.rider_id = rider_id
        self.driver_earning = driver_earning
        self.admin_commission=admin_commission 
    
    
    @staticmethod
    def add_booking(self,price_per_seat,payment_id):
        booking_data = {
            'booking_id':self.booking_id,
            'driver_id':self.driver_id,
            'ride_id':self.ride_id,
            'rider_id':self.rider_id,
            'driver_earning':(price_per_seat * 0.8),
            'admin_commission':(price_per_seat*0.2),
            'payment_id':payment_id  
        }
        result = booking_collection.update_one({"_id": self.booking_id}, {"$set": booking_data}, upsert=True)
        return result.modified_count