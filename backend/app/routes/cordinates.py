from flask import Blueprint, request, current_app
import requests
from flask_jwt_extended import jwt_required
from app.utils.response import Response

coordinates_bp = Blueprint("coordinates", __name__, url_prefix="/api/coordinates")


@coordinates_bp.route("/get_places", methods=["GET"])
@jwt_required()
def get_places():
    try:
        latitude = request.args.get("lat")
        longitude = request.args.get("lng")
        radius = 1000  # in meters
        GOOGLE_API_KEY = current_app.config["GOOGLE_API_KEY"]
        headers = {
            "X-Goog-Api-Key": GOOGLE_API_KEY,
            "X-Goog-FieldMask": "places.displayName,places.location",
        }

        url = "https://places.googleapis.com/v1/places:searchNearby"
        payload = {
            "maxResultCount": 20,
            "locationRestriction": {
                "circle": {
                    "center": {
                        "latitude": latitude,
                        "longitude": longitude,
                    },
                    "radius": radius,
                }
            },
        }
        response = requests.post(url, headers=headers, json=payload, verify=False)
        places = response.json().get("places", [])
        list_of_places = {}
        for place in places:
            location = place["location"]
            list_of_places[place["displayName"]["text"]] = [
                location["latitude"],
                location["longitude"],
            ]
        return Response.generate(status=200, data=list_of_places)
    except Exception as e:
        return Response.generate(message=str(e))
