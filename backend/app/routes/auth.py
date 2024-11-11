from flask import Blueprint, request
from datetime import timedelta
from app.utils.response import Response
from app.utils.get_roles import get_user_collection_by_role
from flask_jwt_extended import create_access_token, jwt_required, get_jwt
from app import blacklist

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/signup", methods=["POST"])
def signup():
    try:
        data = request.get_json()
        username = data["username"]
        password = data["password"]
        email = data["email"]
        role = data["role"]
        phone_number = data.get("phone_number", "")

        if(role == "admin"):
            return Response.generate(
                status=401, message="You can Register for this role"
            )

        user = get_user_collection_by_role(role)


        # Check existing user
        if user.get_by_email(email=email):
            return Response.generate(
                status=400, message="user with this email already exists"
            )
        user_obj = user(
            username=username, email=email, password=password, phone_number=phone_number
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
        username = data["username"]
        email = data["email"]
        password = data["password"]
        role = data["role"]

        user_obj = get_user_collection_by_role(data["role"])

        user = user_obj.get_by_email(email=email)

        if not (user and user.username == username):
            return Response.generate(status=401, message="Invalid username")

        if not user or not user.check_password(password=password):
            return Response.generate(status=401, message="Invalid credentials")

        additional_claims = {"role": role}

        access_token = create_access_token(
            identity=str(user._id),
            additional_claims=additional_claims,
            expires_delta=timedelta(hours=1),
        )

        return Response.generate(
            data={
                "message": "Login successful",
                "access_token": access_token,
                "user": user.to_dict(),
            },
            status=200,
        )

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