from functools import wraps
from flask import request, jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity

def jwt_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            user_id = get_jwt_identity()
        except Exception as e:
            return jsonify({"message": "Token invalide ou manquant"}), 401
        
        # Inject user_id dans la requête
        request.user_id = user_id
        return fn(*args, **kwargs)
    return wrapper
