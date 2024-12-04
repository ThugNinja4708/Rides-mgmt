from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from app.utils.response import Response
from app.models.Rides import Rides
from app.models.Payment import Payment
from app.models.Booking import Booking
from bson import ObjectId
from app.models.Driver import Driver

from app.models import Refund
from app.utils.constants import RideStatus, PaymentStatus
rider_bp = Blueprint("rider", __name__, url_prefix="/api/rider")


@rider_bp.route("/get_all_rides", methods=["POST"])
@jwt_required()
def get_all_rides_based_on_location():
    current_location = request.get_json()["current_location"]
    result = Rides.get_all_rides_rider(current_location)
    return Response.generate(
        status=200,
        data=result, message="Fetched all rides for Rider based on pickup location"
    )

@rider_bp.route("/get_all_available_rides", methods={"POST"})
@jwt_required()
def get_all_available_rides():
    current_location = request.get_json()["current_location"]
    user_id = get_jwt_identity()
    rides = Rides.get_all_rides_rider(current_location)
    result = []
    for ride in rides:
        if(ride["status"] != RideStatus.CANCELLED.value):
            if(user_id not in ride["list_of_riders"]):
                driver_name = Driver.get_by_id(ride["driver_id"]).username
                ride["driver_name"] = driver_name
                result.append(ride)
    return Response.generate(status=200, data=result)


@rider_bp.route("/get_all_rides_by_status", methods=["POST"])
@jwt_required()
def get_all_rides_by_status():
    try:
        data = request.get_json()
        status = data["status"]
        rider_id = get_jwt_identity()
        rides = Rides.get_all_rides_status(rider_id, status)
        result = []
        for ride in rides:
            if((rider_id) in ride["list_of_riders"]):
                driver_name = Driver.get_by_id(ride["driver_id"]).username
                ride["driver_name"] = driver_name
                result.append(ride)
        return Response.generate(
            status=200,
            data=result,
            message="Fetched all rides For Rider based on status",
        )
    except Exception as e:
        return Response.generate(message=str(e))


@rider_bp.route("/book_ride", methods=["POST"])
@jwt_required()
def book_ride():
    try:
        data = request.get_json()
        ride_id = data["ride_id"]
        payment_info = data["payment_info"]
        rider_pickup_location = data["rider_pickup_location"]
        role = get_jwt()["role"]
        rider_id = get_jwt_identity()

        if role != "rider":
            return Response.generate(status=403, message="you can not perform this action")
        ride_obj = Rides.get_ride_by_id(ride_id)


        modified_count = ride_obj.add_rider_to_ride(rider_id)
        if modified_count != 1:
            return Response.generate(
                data={}, message="Already Booked or No Ride Found or No Seats Available", status=500
            )
        else:
            new_payment = Payment(
                rider_id=rider_id,
                payment_method=payment_info["payment_method"],
                payment_status=PaymentStatus.SUCCESS.value,
            )
            payment_id = new_payment.make_payment()
            new_booking = Booking(
                driver_id=ride_obj.driver_id,
                ride_id=ride_obj._id,
                payment_id=payment_id,
                rider_id=rider_id,
                rider_pickup_location=rider_pickup_location
            )
            new_booking.add_booking(ride_obj.price_per_seat)
            return Response.generate(
                data={}, message="Ride Booked SuccessFully", status=200
            )
    except Exception as e:
        return Response.generate(message=str(e))
    
@rider_bp.route("/cancel_ride", methods=["POST"])
@jwt_required()
def cancel_ride():
    rider_id = None
    data = request.get_json()
    ride_info = data["ride_info"]
    role = get_jwt()["role"]
    ride_id = ride_info['ride_id']

    if role != "rider":
        return Response.generate(status=403, message="you can not perform this action")

    if rider_id is None:
        rider_id = get_jwt_identity()
    else:
        rider_id = ride_info['rider_id']
    result = Rides.cancel_ride_by_rider(ride_id=ride_id,rider_id=rider_id)
    if result != 1:
        return Response.generate(
            status = 500,
            message = 'No Ride Found'
        )
    booking = Booking.get_booking_by_rider_for_ride(rider_id=rider_id,ride_id=ride_id)
    refund = Refund(
            booking_id=booking._id,
            rider_id=booking.rider_id,
            amount_refunded=(booking.admin_commission + booking.driver_earning),
            payment_id=booking.payment_id,
            refund_status="DONE",
        )
    refund.save()
    payment = Payment.get_by_id(booking.payment_id)
    payment.payment_status = PaymentStatus.REFUNDED.value
    payment.save()
    booking.admin_commission = 0
    booking.driver_earning = 0
    booking.save()
    return Response.generate(status=200, message="cancelled ride successfully!!")


@rider_bp.route("/get_driver_vehicle_name",methods=['POST'])
@jwt_required()
def get_driver_vehicle_name():
    data = request.get_json()
    driver_id = data['driver_id']
    vehicle_id = data['vehicle_id']
    result = Driver.get_driver_and_vehicle_name(driver_id=driver_id,vehicle_id=vehicle_id)
    return Response.generate(
        data=result,
        status=200,
        message='Driver and Vehicle Name fetched successfully'
    )
    
        
        
