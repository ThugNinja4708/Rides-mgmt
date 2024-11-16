from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from app.utils.response import Response
from app.models.Rides import Rides
from app.models.Driver import Driver
from app.models.Payment import Payment
from app.models.Booking import Booking
from bson import ObjectId

rider_bp = Blueprint("rider", __name__, url_prefix="/api/rider")


@rider_bp.route("/get_all_rides", methods=["GET"])
@jwt_required()
def get_all_rides_based_on_location():
    current_location = request.get_json()["current_location"]
    result = Rides.get_all_rides_rider(current_location)
    return Response.generate(
        data=result, message="Fetched all rides for Rider based on pickup location"
    )


@rider_bp.route("/get_all_rides_by_status", methods=["GET"])
@jwt_required()
def get_all_rides_by_status():
    try:
        rider_id = None
        status = "scheduled"
        if rider_id is None:
            rider_id = get_jwt_identity()
        result = Rides.get_all_rides_status(rider_id, status)
        return Response.generate(
            status=200,
            data=result,
            message="Fetched all rides For Rider based on status",
        )
    except Exception as e:
        return Response.generate(message=str(e))


@rider_bp.route("/bookride", methods=["POST"])
@jwt_required()
def book_ride():
    try:
        rider_id = None
        data = request.get_json()
        ride_info = data["ride_info"]
        payment_info = data["payment_info"]
        role = get_jwt()["role"]

        if role != "rider":
            return Response.generate(status=403, message="you can not perform this action")

        if rider_id is None:
            rider_id = get_jwt_identity()
        modified_count = Rides.add_rider_to_ride(ride_info["ride_id"], rider_id)
        if modified_count != 1:
            return Response.generate(
                data={}, message="Already Booked or No Ride Found", status=500
            )
        else:
            new_payment = Payment(
                rider_id=rider_id,
                payment_method=payment_info["payment_method"],
                payment_status=payment_info["payment_status"],
            )
            payment_id = new_payment.make_payment()
            new_booking = Booking(
                driver_id=ride_info["driver_id"],
                ride_id=ride_info["ride_id"],
                payment_id=payment_id,
                rider_id=rider_id,
            )
            new_booking.add_booking(ride_info["price_per_seat"])
            return Response.generate(
                data={}, message="Ride Booked SuccessFully", status=200
            )
    except Exception as e:
        return Response.generate(message=str(e))
