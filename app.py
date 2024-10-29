from flask import Flask, request, jsonify
from pymongo import MongoClient, ASCENDING
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
import jwt
import datetime
import os
from bson import ObjectId
from utils.response import Response
from decorators.token_required import token_required
from app import create_app

app = Flask(__name__)



# try:
#     client = MongoClient(app.config["MONGO_URI"])
#     db = client[app.config["DB_NAME"]]
    
#     # Create indexes
#     db.users.create_index([("username", ASCENDING)], unique=True)
#     db.users.create_index([("email", ASCENDING)], unique=True)
#     print("Connected to MongoDB successfully!")
# except Exception as e:
#     print(f"Error connecting to MongoDB: {e}")

# Role definitions
ROLES = {
    'admin': 3,
    'manager': 2,
    'user': 1
}

# Helper functions






# Authentication routes




@app.route('/refresh-token', methods=['POST'])
def refresh_token():
    try:
        refresh_token = request.json.get('refresh_token')
        if not refresh_token:
            return jsonify({'message': 'Refresh token is required'}), 400

        try:
            data = jwt.decode(refresh_token, app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
            user = db.users.find_one({
                '_id': ObjectId(data['user_id']),
                'refresh_tokens': refresh_token
            })

            if not user:
                return jsonify({'message': 'Invalid refresh token'}), 401

            # Generate new access token
            new_access_token, _ = generate_tokens(user['_id'], user['role'])

            return jsonify({
                'access_token': new_access_token
            }), 200

        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Refresh token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid refresh token'}), 401

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/logout', methods=['POST'])
@token_required()
def logout(current_user):
    try:
        refresh_token = request.json.get('refresh_token')
        if refresh_token:
            db.users.update_one(
                {'_id': current_user['_id']},
                {'$pull': {'refresh_tokens': refresh_token}}
            )

        return jsonify({'message': 'Logged out successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Protected routes
@app.route('/profile', methods=['GET'])
@token_required()
def get_profile(current_user):
    return jsonify(serialize_user(current_user)), 200

@app.route('/admin/users', methods=['GET'])
@token_required('admin')
def get_all_users(current_user):
    users = db.users.find({})
    return jsonify([serialize_user(user) for user in users]), 200

@app.route('/admin/user/<user_id>', methods=['PUT'])
@token_required('admin')
def update_user(current_user, user_id):
    try:
        data = request.get_json()
        update_fields = {}

        # Build update fields
        if 'username' in data:
            update_fields['username'] = data['username']
        if 'email' in data:
            update_fields['email'] = data['email']
        if 'role' in data and data['role'] in ROLES:
            update_fields['role'] = data['role']
        if 'is_active' in data:
            update_fields['is_active'] = data['is_active']
        if 'password' in data:
            update_fields['password'] = generate_password_hash(
                data['password'], 
                method='pbkdf2:sha256'
            )

        if update_fields:
            result = db.users.update_one(
                {'_id': ObjectId(user_id)},
                {'$set': update_fields}
            )

            if result.modified_count:
                updated_user = db.users.find_one({'_id': ObjectId(user_id)})
                return jsonify({
                    'message': 'User updated successfully',
                    'user': serialize_user(updated_user)
                }), 200
            
            return jsonify({'message': 'User not found'}), 404

        return jsonify({'message': 'No fields to update'}), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# if __name__ == '__main__':
#     app = create_app()
#     app.run()