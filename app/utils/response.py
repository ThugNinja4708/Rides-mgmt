from flask import make_response, jsonify
class Response:
    @staticmethod
    def generate(status: str = 500, message: str = "", data=None, status_code=200):
        response = {
            "status": status,
            "message": message,
            "data": data
        }
        return make_response(jsonify(response), status_code)