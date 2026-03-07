import os
import gdown
import joblib
import numpy as np
import time
import mlflow
from mlflow.tracking import MlflowClient

# ─── Téléchargement + compression automatique ──────────────────────────────
def _download_and_compress(filename: str, file_id: str) -> None:
    compressed = filename + ".gz"

    # Déjà compressé → rien à faire
    if os.path.exists(compressed):
        print(f"✅ {compressed} déjà présent, téléchargement ignoré.")
        return

    # Téléchargement si absent
    if not os.path.exists(filename):
        url = f"https://drive.google.com/uc?id={file_id}"
        print(f"⬇️  Téléchargement {filename}...")
        try:
            gdown.download(url, filename, quiet=False, fuzzy=True)
            print(f"✅ {filename} téléchargé.")
        except Exception as e:
            raise RuntimeError(
                f"❌ Impossible de télécharger {filename} : {e}\n"
                "→ Vérifiez votre connexion et que le fichier Drive est bien public."
            )

    # Compression avec joblib
    print(f"🗜️  Compression de {filename} → {compressed}...")
    obj = joblib.load(filename)
    joblib.dump(obj, compressed, compress=("gzip", 6))
    os.remove(filename)  # supprime l'original pour libérer de la place
    print(f"✅ {compressed} prêt.")


_download_and_compress("model.pkl",    "1GaztCUxWe52X6vt8CmiWKxtHHTB23xEN")
_download_and_compress("encoders.pkl", "1GCHJrkbgNiFDUIElkkg9lJx2eifDMysF")

# ─── Chargement depuis les fichiers compressés ─────────────────────────────
model    = joblib.load("model.pkl.gz")
encoders = joblib.load("encoders.pkl.gz")

print("✅ Modèle et encodeurs chargés.")

# ─── Labels ────────────────────────────────────────────────────────────────
def get_labels() -> dict:
    return {
        col: {str(i): label for i, label in enumerate(le.classes_)}
        for col, le in encoders.items()
    }

# ─── Prédiction ────────────────────────────────────────────────────────────
def predict_price(data: dict) -> dict:
    start_time = time.time()

    features = np.array([[
        data["location"],   data["status"],    data["transaction"],
        data["furnishing"], data["bathroom"],  data["balcony"],
        data["ownership"],  data["floor_num"],
    ]])

    log_price     = model.predict(features)[0]
    price         = np.expm1(log_price)
    response_time = time.time() - start_time

    # Log MLflow — ne bloque pas l'API si MLflow est indisponible
    try:
        with mlflow.start_run(run_name="prediction", nested=True):
            mlflow.log_param("location",           data["location"])
            mlflow.log_param("bathroom",           data["bathroom"])
            mlflow.log_metric("predicted_price",   float(price))
            mlflow.log_metric("price_in_lac",      round(float(price) / 100_000, 2))
            mlflow.log_metric("response_time_sec", round(response_time, 4))
    except Exception as e:
        print(f"⚠️  MLflow log ignoré : {e}")

    return {
        "predicted_price": round(float(price), 2),
        "price_in_lac":    round(float(price) / 100_000,    2),
        "price_in_crore":  round(float(price) / 10_000_000, 4),
    }

# ─── Stats ─────────────────────────────────────────────────────────────────
def get_stats() -> dict:
    client     = MlflowClient()
    experiment = client.get_experiment_by_name("house-price-prediction")

    if not experiment:
        return {"total_predictions": 0}

    runs = client.search_runs(
        experiment_ids=[experiment.experiment_id],
        filter_string="tags.mlflow.runName = 'prediction'",
        order_by=["start_time DESC"],
        max_results=50,
    )

    predictions    = []
    total_price    = 0.0
    response_times = []

    for run in runs:
        metrics = run.data.metrics
        params  = run.data.params
        price   = metrics.get("predicted_price", 0)

        total_price += price
        response_times.append(metrics.get("response_time_sec", 0))
        predictions.append({
            "price":        round(price, 2),
            "price_in_lac": metrics.get("price_in_lac", 0),
            "location":     params.get("location", "?"),
            "bathroom":     params.get("bathroom", "?"),
            "timestamp":    run.info.start_time,
        })

    n         = len(predictions)
    avg_price = total_price / n if n else 0
    avg_resp  = sum(response_times) / len(response_times) if response_times else 0

    return {
        "total_predictions": n,
        "avg_price":         round(avg_price, 2),
        "avg_price_in_lac":  round(avg_price / 100_000, 2),
        "avg_response_time": round(avg_resp, 4),
        "last_predictions":  predictions[:10],
    }