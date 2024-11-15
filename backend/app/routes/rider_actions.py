from flask import Blueprint, request
from flask_jwt_extended import  jwt_required, get_jwt, get_jwt_identity
from app.utils.response import Response
from app.models.Rides import Rides
from app.models.Driver import Driver
from app.models.Payment import Payment
from app.models.Booking import Booking
from bson import ObjectId

rider_bp = Blueprint("rider", __name__, url_prefix="/api/rider")


@rider_bp.route("/getallrides", methods=["GET"])
@jwt_required()
def get_all_rides(pickup_location= None):
    result =Rides.get_all_rides_rider(pickup_location)
    Response.generate(
        data=result,
        message='Fetched all rides For Rider based on pickup Location'
    )
    
@rider_bp.route("/getallridesbystatus",method=["GET"])
@jwt_required()
def get_all_rides_by_status(rider_id=None,status='scheduled'):
    if rider_id is None:
        rider_id = get_jwt_identity()
    result = Rides.get_all_rides_status(rider_id,status)
    Response.generate(
        data=result,
        message='Fetched all rides For Rider based on status'
    )
    

@rider_bp.route("/bookride",methods=["POST"])
@jwt_required()
def book_ride(ride_info,payment_info,rider_id=None):
    data = request.get_json()
    ride_info= data['ride_info']
    payment_info = data['payment_info']
    if rider_id is None:
        rider_id = get_jwt_identity()
    modified_count = Rides.add_rider_to_ride(ride_info['ride_id'],rider_id)
     
    if modified_count !=1 :
         Response.generate(
        data={},
        message='Already Booked or No Ride Found',
        status = 500
    )
    else:
         new_payment = Payment(ObjectId(),rider_id,payment_info['payment_method'],payment_info['payment_status'])
         payment_id = new_payment.makepayment()
         new_booking = Booking(ObjectId(),ride_info['driver_id'],
                               ride_info['ride_id'],0,0,payment_id)
         new_booking.add_booking(new_booking,ride_info['price_per_seat'],payment_id)
         Response.generate(
        data={},
        message='Ride Booked SuccessFully',
        status = 200
         )
            
         
         
        
    
         
    
    

    
