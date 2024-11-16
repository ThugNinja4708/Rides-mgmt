from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from app.utils.response import Response
from app.utils.get_roles import get_user_collection_by_role
from app.models.Rides import Rides
from app.utils.constants import RideStatus
from datetime import datetime
from app.models.Driver import Driver
from app.models.Booking import Booking
from app.models.Refund import Refund

driver_bp = Blueprint("driver", __name__, url_prefix="/api/driver")


@driver_bp.route("/add_license_number", methods=["POST"])
@jwt_required()
def add_license_number():
    try:
        data = request.get_json()
        user_id = get_jwt_identity()
        role = get_jwt()["role"]

        if role != "driver":
            return Response.generate(
                status=401, message="You are not allowed to perform this action"
            )

        user = get_user_collection_by_role(role)
        user_obj = user.get_by_id(user_id)
        user_obj.license_number = data["license_number"]
        user_obj.save()
        return Response.generate(
            status=200, message="License number added successfully"
        )

    except Exception as e:
        return Response.generate(status=500, message=str(e))


@driver_bp.route("/get_license_number", methods=["POST"])
@jwt_required()
def get_license_number():
    try:
        user_id = get_jwt_identity()
        role = get_jwt()["role"]
        if role != "driver":
            return Response.generate(
                status=401, message="You are not allowed to perform this action"
            )
        user = get_user_collection_by_role(role)
        user_obj = user.get_by_id(user_id)
        return Response.generate(
            status=200, data={"license_number": user_obj.license_number}
        )
    except Exception as e:
        return Response.generate(status=500, message=str(e))


@driver_bp.route("/addvehicle", methods=["POST"])
@jwt_required()
def add_vehicle():
    try:
        data = request.get_json()
        user_id = get_jwt_identity()
        role = get_jwt()["role"]
        vehicle_info = data["vehicle_info"]

        if role != "driver":
            return Response.generate(
                status=401, message="You are not allowed to perform this action"
            )

        result = Driver.add_vehicle_info(user_id, vehicle_info)
        return Response.generate(data=result, message="vehicle added successfully")

    except KeyError as e:
        return Response.generate(
            status=400, message=f"KeyError: Missing required attribute: {e}"
        )

    except Exception as e:
        return Response.generate(status=500, message=str(e))


@driver_bp.route("/create_ride", methods=["POST"])
@jwt_required()
def create_ride():
    data = request.get_json()
    pickup_location = data["pickup_location"]
    drop_location = data["drop_location"]
    vehicle_id = data["vehicle_id"]
    capacity = data["capacity"]
    price_per_seat = data["price_per_seat"]
    start_time_str = data["start_time"]
    start_time = datetime.strptime(start_time_str, "%Y-%m-%dT%H:%M:%S%z")

    user_id = get_jwt_identity()
    role = get_jwt()["role"]

    if role != "driver":
        return Response.generate(
            status=403, message="You are not allowed to perform this action"
        )

    rides_obj = Rides(
        pickup_location=pickup_location,
        drop_location=drop_location,
        vehicle_id=vehicle_id,
        capacity=capacity,
        price_per_seat=price_per_seat,
        start_time=start_time,
        driver_id=user_id,
        status=RideStatus.SCHEDULED.value,
    )
    rides_obj.create_ride()
    return Response.generate(status=200, message="Ride created successfully")


@driver_bp.route("/getallrides", methods=["Get"])
@jwt_required()
def get_all_rides_driver():
    user_id = get_jwt_identity()
    role = get_jwt()["role"]

    if role != "driver":
        return Response.generate(
            status=403, message="You are not allowed to perform this action"
        )

    results = Rides.get_all_rides_driver({"driver_id": user_id})
    return Response.generate(data=results, message="list of all rides for driver")


@driver_bp.route("/cancel_ride", methods=["POST"])
@jwt_required()
def cancel_ride():
    user_id = get_jwt_identity()
    role = get_jwt()["role"]
    data = request.get_json()
    ride_id = data["ride_id"]

    if role != "driver":
        return Response.generate(
            status=403, message="You are not allowed to perform this action"
        )
    result = Rides.cancel_ride(ride_id=ride_id, driver_id=user_id)

    if result != 1:
        return Response.generate(status=500, message="can not find ride")
    list_of_bookings = Booking.get_all_bookings_by_ride_id(ride_id=ride_id)

    for booking in list_of_bookings:
        refund = Refund(
            booking_id=booking._id,
            rider_id=booking.rider_id,
            amount_refunded=(booking.admin_commission + booking.driver_earning),
            payment_id=booking.payment_id,
            refund_status="DONE",
        )
        refund.save()
        booking.admin_commission = 0
        booking.driver_earning = 0
        booking.save()
    return Response.generate(status=200, message="cancelled ride successfully!!")


