from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt, get_jwt_identity
from app.utils.response import Response
from app.utils.get_roles import get_user_collection_by_role, get_jwt_identity
from app.models.Rides import Rides
from app.utils.constants import RideStatus
from datetime import datetime
driver_bp = Blueprint("driver", __name__, url_prefix="/api/driver")




@driver_bp.route("/add_license_number", methods=["POST"])
@jwt_required()
def add_license_number():
    try:
        data = request.get_json()
        user_id = get_jwt_identity()
        role = get_jwt()["role"]

        if role != "driver":
            return Response.generate(status=401, message="You are not allowed to perform this action")

        user = get_user_collection_by_role(role)
        user_obj = user.get_by_id(user_id)
        user_obj.license_number = data["license_number"]
        user_obj.save()
        return Response.generate(status=200, message="License number added successfully")

    except Exception as e:
        return Response.generate(status=500, message=str(e))

@driver_bp.route("/get_license_number", methods=["POST"])
@jwt_required()
def get_license_number():
    try:
        user_id = get_jwt_identity()
        role = get_jwt()["role"]
        if role != "driver":
            return Response.generate(status=401, message="You are not allowed to perform this action")
        user = get_user_collection_by_role(role)
        user_obj = user.get_by_id(user_id)
        return Response.generate(status=200, data={"license_number":user_obj.license_number})
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
        Response.generate(status=403, message="You are not allowed to perform this action")

    rides_obj = Rides(
        pickup_location=pickup_location,
        drop_location=drop_location,
        vehicle_id=vehicle_id,
        capacity=capacity,
        price_per_seat=price_per_seat,
        start_time=start_time,
        driver_id=user_id,
        status=RideStatus.SCHEDULED.value
    )
    rides_obj.create_ride()
    return Response.generate(status=200, message="Ride created successfully")