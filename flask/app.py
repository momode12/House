from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from models.init_models import init_models, mongo
from routes.init_route import init_routes
import mlflow

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.secret_key = "ta_clef_secrete_ici_à_remplacer_par_une_vraie_chaine_longue"
    
    # Valider la configuration
    try:
        Config.validate()
    except ValueError as e:
        print(str(e))
        raise

    # Configuration CORS
    CORS(app, 
         resources={r"/*": {
             "origins": ["http://localhost:3000", "http://localhost:5173"],
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
             "allow_headers": ["Content-Type", "Authorization"],
             "expose_headers": ["Content-Type", "Authorization"],
             "supports_credentials": True
         }})

    # Initialiser JWT
    jwt = JWTManager(app)
    
    @jwt.unauthorized_loader
    def unauthorized_callback(callback):
        return {"success": False, "message": "Token manquant ou invalide"}, 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(callback):
        return {"success": False, "message": "Token invalide"}, 401
    
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return {"success": False, "message": "Token expiré"}, 401

    # Initialiser MongoDB
    init_models(app)
    print("MongoDB initialized:", mongo.db is not None)
    import models.user_models

    # Initialiser MLflow
    mlflow.set_experiment("house-price-prediction")
    print("MLflow initialized ✅")

    # Enregistrer les routes
    init_routes(app)

    return app

app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
