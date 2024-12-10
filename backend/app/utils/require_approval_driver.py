from app.models.Driver import Driver
from app.utils.response import Response
from flask import request
from functools import wraps
def require_approval(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        driver_id = request.json.get("driver_id")
        driver = Driver.get_by_id(driver_id)
        if not driver or driver.get("status") != "approved":
            return Response.generate(status=403, message="Driver is not approved")
        return func(*args, **kwargs)
    return wrapper