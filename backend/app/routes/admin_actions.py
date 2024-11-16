from flask import Blueprint
from flask_jwt_extended import jwt_required
from app.models.Booking import Booking
from app.utils.response import Response

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
