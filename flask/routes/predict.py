from flask import Blueprint, request, jsonify
from services.predict_service import get_labels, predict_price, get_stats

predict_bp = Blueprint('predict', __name__)

@predict_bp.route('/labels', methods=['GET'])
def labels():
    return jsonify(get_labels())

@predict_bp.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    result = predict_price(data)
    return jsonify(result)

@predict_bp.route('/stats', methods=['GET'])
def stats():
    return jsonify(get_stats())