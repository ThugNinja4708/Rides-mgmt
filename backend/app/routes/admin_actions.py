from flask import Blueprint
from flask_jwt_extended import jwt_required,get_jwt_identity, get_jwt
from app.models.Booking import Booking
from app.utils.response import Response
from app.models.Rides import Rides
from app.models.Rider import Rider
from app.models.Driver import Driver

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")

@admin_bp.route("/myearnings",methods=['GET'])
@jwt_required()
def get_admin_earnings():
    result = Booking.calculate_admin_earnings()
    return Response.generate(
        status=200,
        data= result,
        message='Admin Earnings Fetched SuccessFully'
    )

@admin_bp.route("/get_all_rides", methods={"GET"})
@jwt_required()
def get_all_rides():
    try:
        role = get_jwt()["role"]

        if role != "admin":
            return Response.generate(
                status=401, message="You are not allowed to perform this action"
        )
        rides = Rides.get_all_rides()
        result = []
        for ride in rides:
            ride_dict = ride.to_dict()
            list_of_rider_names = []
            for rider_id in ride.list_of_riders:
                list_of_rider_names.append(Rider.get_by_id(user_id=rider_id).username)
            ride_dict["list_of_riders"] = list_of_rider_names
            ride_dict["driver_name"] = Driver.get_by_id(ride.driver_id).username
            result.append(ride_dict)
            ride_dict["admin_commission"] = Booking.calculate_admin_earnings(ride_id=ride._id)
        admin_earnings = Booking.calculate_admin_earnings()


        return Response.generate(
            status=200, data={"admin_earnings": admin_earnings, "list_of_rides":result}
        )

    except Exception as error:
        return Response.generate(status=500, message=str(error))

