from flask import Blueprint, request
from app.utils.response import Response
from flask_jwt_extended import jwt_required, get_jwt

driver_bp = Blueprint("driver", __name__, url_prefix="/api/driver")

@driver_bp.route("/addVehicle", methods=["POST"])
@jwt_required()
def add_vehicle():
    # data = request.get_json()
    _id = get_jwt()["jti"]

    return Response.generate(status=200, message=_id)
    pass