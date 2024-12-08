from flask import Blueprint, request, send_file
from flask_jwt_extended import get_jwt_identity
from datetime import timedelta
from app.utils.response import Response
from app.utils.get_roles import get_user_collection_by_role
from flask_jwt_extended import create_access_token, jwt_required, get_jwt
from app import blacklist
from app.utils.gridfs import Gridfs
from bson import ObjectId

import io
auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/signup", methods=["POST"])
def signup():
    try:
        data = request.get_json()
        username = data["username"]
        password = data["password"]
        email = data["email"]
        city = data["city"]
        street = data["street"]
        ssn = data["ssn"]
        role = data["role"]
        phone_number = data.get("phone_number", "")

        if(role == "admin"):
            return Response.generate(
                status=401, message="You can't Register for this role"
            )

        user = get_user_collection_by_role(role)


        # Check existing user
        if user.get_by_email(email=email):
            return Response.generate(
                status=400, message="user with this email already exists"
            )
        user_obj = user(
            username=username,
            email=email,
            password=password,
            phone_number=phone_number,
            ssn = ssn,
            city = city,
            street = street
            
        )
        user_obj.save()
        return Response.generate(status=201, message="User created successfully")

    except KeyError as e:
        return Response.generate(
            status=400, message=f"KeyError: Missing required attribute: {e}"
        )

    except Exception as e:
        return Response.generate(status=500, message=str(e))


@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        email = data["email"]
        password = data["password"]
        role = data["role"]

        user_obj = get_user_collection_by_role(data["role"])

        user = user_obj.get_by_email(email=email)

        if not (user):
            return Response.generate(status=401, message="User details not found!")

        if not user or not user.check_password(password=password):
            return Response.generate(status=401, message="Invalid credentials")

        additional_claims = {"role": role}

        access_token = create_access_token(
            identity=str(user._id),
            additional_claims=additional_claims,
            expires_delta=timedelta(hours=1),
        )
        user_data = user.to_dict()
        user_data["role"] = role
        return Response.generate(status=200, data={"authToken": access_token, "user": user_data})

    except KeyError as e:
        return Response.generate(
            status=400, message=f"KeyError: Missing required attribute: {e}"
        )

    except Exception as error:
        return Response.generate(status=500, message=f"UnExpectedError Occurred: {error}")


@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    try:
        jti = get_jwt()["jti"]
        blacklist.add(jti)
        return Response.generate(status=200, message="Logged out successfully")

    except Exception as error:
        return Response.generate(status=500, message=f"UnExpectedError Occurred: {error}")

@auth_bp.route("/get_user_details", methods=["GET"])
@jwt_required()
def get_user_details():
    try:
        user_id = get_jwt_identity()
        role = get_jwt()["role"]
        user_obj = get_user_collection_by_role(role)

        user = user_obj.get_by_id(user_id).to_dict()

        return Response.generate(status=200, data=user)
    except Exception as error:
        return Response.generate(status=500, message=str(error))
    
@auth_bp.route("/update_user", methods={"PUT"})
@jwt_required()
def update_user():
    try:
        user_id = get_jwt_identity()
        role = get_jwt()["role"]
        user_obj = get_user_collection_by_role(role)
        user = user_obj.get_by_id(user_id)
        data = request.get_json()
        user.update_details(data)
        return Response.generate(status=200, message="User updated successfully")
    except Exception as error:
        return Response.generate(status=500, message=str(error))

@auth_bp.route('/upload_profile_image', methods=['POST'])
@jwt_required()
def upload_image():
    user_id = get_jwt_identity()
    role = get_jwt()["role"]
    if 'file' not in request.files:
        return Response.generate(status=400, message="No, file uploaded")
    fs = Gridfs.get_fs()

    file = request.files['file']
    file_id = fs.put(file, filename=file.filename)
    user_obj = get_user_collection_by_role(role)
    user_obj = user_obj.get_by_id(user_id)
    user_obj.profile_image_id = file_id
    user_obj.save()
    return Response.generate(status=200, data={"file_id": str(file_id)})

@auth_bp.route("/get_profile_image/<profile_image_id>", methods=["GET"])
def get_profile_image(profile_image_id):
    try:
        fs = Gridfs.fs
        file = fs.get(ObjectId(profile_image_id))
        return send_file(
            io.BytesIO(file.read()),
            mimetype=file.content_type,
            download_name="profile_image"
        )
    except Exception as error:
        return Response.generate(status=404, message=str(error))
