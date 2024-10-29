from flask import Blueprint, current_app, request, jsonify
import jwt
from app.database import Database
from werkzeug.security import check_password_hash
from datetime import datetime, timezone
from utils.response import Response
from bson import ObjectId
from functools import wraps
from models.Admin import Admin
from models.Rider import Rider

db = Database.get_db()

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


# TODO: need to move it to model/users class
def serialize_user(user):
    """Convert MongoDB user document to dictionary"""
    if user:
        return {
            "id": str(user["_id"]),
            "username": user["username"],
            "email": user["email"],
            "role": user["role"],
            "created_at": user["created_at"],
            "last_login": user.get("last_login"),
            "is_active": user.get("is_active", True),
        }
    return None


def generate_tokens(user_id, role):
    """Generate access and refresh tokens"""
    access_token = jwt.encode(
        {
            "user_id": str(user_id),
            "role": role,
            "exp": datetime.now(timezone.utc)
            + current_app.config["JWT_ACCESS_TOKEN_EXPIRES"],
        },
        current_app.config["JWT_SECRET_KEY"],
        algorithm="HS256",
    )

    refresh_token = jwt.encode(
        {
            "user_id": str(user_id),
            "exp": datetime.now(timezone.utc)
            + current_app.config["JWT_REFRESH_TOKEN_EXPIRES"],
        },
        current_app.config["JWT_SECRET_KEY"],
        algorithm="HS256",
    )

    return access_token, refresh_token


def token_required(minimum_role=None):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            token = None
            if "Authorization" in request.headers:
                auth_header = request.headers["Authorization"]
                try:
                    token = auth_header.split(" ")[1]  # Bearer <token>
                except IndexError:
                    return jsonify({"message": "Invalid token format"}), 401

            if not token:
                return jsonify({"message": "Token is missing"}), 401

            try:
                data = jwt.decode(
                    token, current_app.config["JWT_SECRET_KEY"], algorithms=["HS256"]
                )
                current_user = db.users.find_one({"_id": ObjectId(data["user_id"])})

                if not current_user:
                    return jsonify({"message": "User not found"}), 401

                # if minimum_role and ROLES.get(current_user['role'], 0) < ROLES.get(minimum_role, 0):
                #     return jsonify({'message': 'Insufficient permissions'}), 403

            except jwt.ExpiredSignatureError:
                return jsonify({"message": "Token has expired"}), 401
            except jwt.InvalidTokenError:
                return jsonify({"message": "Invalid token"}), 401

            return f(current_user, *args, **kwargs)

        return decorated

    return decorator


@auth_bp.route("/signup", methods=["POST"])
def signup():
    try:
        data = request.get_json()
        username = data["username"]
        password = data["password"]
        email = data["email"]
        role = data["role"]
        phone_number = data.get("phone_number", "")

        if role == "driver":
            collection = db.driver
        elif role == "rider":
            collection = Rider(
                username=username,
                email=email,
                password=password,
                phone_number=phone_number
            )
        else:
            # TODO: need to do the same thing for driver and rider also
            collection = Admin(
                username=username,
                email=email,
                password=password,
                phone_number=phone_number,
            )

        # Check existing user
        if collection.get_by_email(email=email):
            return Response.generate(status=400, message="user with this email already exists")

        collection.save()
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
        # Find user by username or email
        if role == "driver":
            collection = db.driver
        elif role == "rider":
            collection = Rider(
                username=username,
                email=email,
                password=password
            )
        else:
            # TODO: need to do the same thing for driver and rider also
            collection = Admin(
                username=username,
                email=email,
                password=password,
            )
        user = collection.get_by_email(email=email)

        if not user or not collection.check_password(password=password):
            return Response.generate(status=401, message="Invalid credentials")

        # if not user.get("is_active", True):
        #     return jsonify({"message": "Account is disabled"}), 401

        # Generate tokens
        access_token, refresh_token = generate_tokens(user["_id"], user["role"])
        user.login(refresh_token=refresh_token)

        return Response.generate(
            data={
                "message": "Login successful",
                "access_token": access_token,
                "refresh_token": refresh_token,
                "user": serialize_user(user),
            },
            status=200,
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@auth_bp.route("/refresh-token", methods=["POST"])
def refresh_token():
    try:
        refresh_token = request.json.get("refresh_token")
        if not refresh_token:
            return jsonify({"message": "Refresh token is required"}), 400

        try:
            data = jwt.decode(
                refresh_token,
                current_app.config["JWT_SECRET_KEY"],
                algorithms=["HS256"],
            )
            user = db.users.find_one(
                {"_id": ObjectId(data["user_id"]), "refresh_tokens": refresh_token}
            )

            if not user:
                return jsonify({"message": "Invalid refresh token"}), 401

            # Generate new access token
            new_access_token, _ = generate_tokens(user["_id"], user["role"])

            return jsonify({"access_token": new_access_token}), 200

        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Refresh token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Invalid refresh token"}), 401

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@auth_bp.route("/logout", methods=["POST"])
@token_required()
def logout(current_user):
    try:
        refresh_token = request.json.get("refresh_token")
        if refresh_token:
            db.users.update_one(
                {"_id": current_user["_id"]},
                {"$pull": {"refresh_tokens": refresh_token}},
            )

        return jsonify({"message": "Logged out successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
