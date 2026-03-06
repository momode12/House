import pickle
import numpy as np
import os
import gdown
import time
import mlflow
from mlflow.tracking import MlflowClient

# Télécharger les fichiers si absents
if not os.path.exists('model.pkl'):
    print("Téléchargement model.pkl...")
    gdown.download('https://drive.google.com/uc?id=1GaztCUxWe52X6vt8CmiWKxtHHTB23xEN', 'model.pkl', quiet=False)

if not os.path.exists('encoders.pkl'):
    print("Téléchargement encoders.pkl...")
    gdown.download('https://drive.google.com/uc?id=1GCHJrkbgNiFDUIElkkg9lJx2eifDMysF', 'encoders.pkl', quiet=False)

with open('model.pkl', 'rb') as f:
    model = pickle.load(f)

with open('encoders.pkl', 'rb') as f:
    encoders = pickle.load(f)

def get_labels():
    result = {}
    for col, le in encoders.items():
        result[col] = {str(i): label for i, label in enumerate(le.classes_)}
    return result

def predict_price(data):
    start_time = time.time()
    features = np.array([[
        data['location'], data['status'], data['transaction'],
        data['furnishing'], data['bathroom'], data['balcony'],
        data['ownership'], data['floor_num']
    ]])
    log_price = model.predict(features)[0]
    price = np.expm1(log_price)
    response_time = time.time() - start_time

    with mlflow.start_run(run_name="prediction", nested=True):
        mlflow.log_param("location", data['location'])
        mlflow.log_param("bathroom", data['bathroom'])
        mlflow.log_metric("predicted_price", float(price))
        mlflow.log_metric("price_in_lac", round(float(price) / 100000, 2))
        mlflow.log_metric("response_time_sec", round(response_time, 4))

    return {
        "predicted_price": round(float(price), 2),
        "price_in_lac": round(float(price) / 100000, 2),
        "price_in_crore": round(float(price) / 10000000, 4)
    }

def get_stats():
    client = MlflowClient()
    experiment = client.get_experiment_by_name("house-price-prediction")
    if not experiment:
        return {"total_predictions": 0}
    runs = client.search_runs(
        experiment_ids=[experiment.experiment_id],
        filter_string="tags.mlflow.runName = 'prediction'",
        order_by=["start_time DESC"],
        max_results=50
    )
    predictions = []
    total_price = 0
    response_times = []
    for run in runs:
        metrics = run.data.metrics
        params = run.data.params
        price = metrics.get("predicted_price", 0)
        total_price += price
        response_times.append(metrics.get("response_time_sec", 0))
        predictions.append({
            "price": round(price, 2),
            "price_in_lac": metrics.get("price_in_lac", 0),
            "location": params.get("location", "?"),
            "bathroom": params.get("bathroom", "?"),
            "timestamp": run.info.start_time
        })
    avg_price = total_price / len(predictions) if predictions else 0
    avg_response = sum(response_times) / len(response_times) if response_times else 0
    return {
        "total_predictions": len(predictions),
        "avg_price": round(avg_price, 2),
        "avg_price_in_lac": round(avg_price / 100000, 2),
        "avg_response_time": round(avg_response, 4),
        "last_predictions": predictions[:10]
    }