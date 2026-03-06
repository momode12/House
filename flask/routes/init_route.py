from routes.auth import auth_bp
from routes.predict import predict_bp

def init_routes(app):    
    # Routes d'authentification
    app.register_blueprint(auth_bp, url_prefix="/auth")
    
    # Routes ML
    app.register_blueprint(predict_bp, url_prefix="")

    print("Routes enregistrées:")
    print("   - /auth/register (POST)")
    print("   - /auth/login (POST)")
    print("   - /labels (GET)")
    print("   - /predict (POST)")
    print("   - /stats (GET)")