from flask import Blueprint, request, jsonify
from app.database import Database
from datetime import timedelta
from app.utils.response import Response
from app.utils.get_roles import get_user_collection_by_role
from flask_jwt_extended import create_access_token, jwt_required, get_jwt
from app import blacklist

db = Database.get_db()

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

        if(user.username!= username):
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

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    try:
        jti = get_jwt()["jti"]
        blacklist.add(jti)
        return jsonify({"message": "Logged out successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
