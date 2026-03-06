import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    # MongoDB
    MONGO_URI = os.getenv("MONGODB_URI")
    
    # JWT Configuration
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=30)
    
    # IMPORTANT: Configuration pour accepter les tokens dans les headers
    JWT_TOKEN_LOCATION = ['headers']
    JWT_HEADER_NAME = 'Authorization'
    JWT_HEADER_TYPE = 'Bearer'
    
    FRONTEND_URL = "http://localhost:5173"

    GOOGLE_OAUTH_CLIENT_ID = "GOOGLE_CLIENT_ID"
    GOOGLE_OAUTH_CLIENT_SECRET = "GOOGLE_CLIENT_SECRET"

    GITHUB_OAUTH_CLIENT_ID = "Ov23li9FiDPVV8ccsnwl"
    GITHUB_OAUTH_CLIENT_SECRET = "fd8f72f1e0d61e40562e4d69352af5e7f23606d2"

    FACEBOOK_OAUTH_CLIENT_ID = "764733799388812"
    FACEBOOK_OAUTH_CLIENT_SECRET = "5fb6d1136b73eb902f5781d2693f1501"

    LINKEDIN_OAUTH_CLIENT_ID = "77vbi335wuavvf"
    LINKEDIN_OAUTH_CLIENT_SECRET = "WPL_AP1.EfqqM5FwEvkWnSvU.fQeeOQ=="
    # Désactiver la vérification CSRF pour les APIs
    JWT_COOKIE_CSRF_PROTECT = False
    
    # Debug
    DEBUG = True
    
    @staticmethod
    def validate():
        """Valide que toutes les variables d'environnement sont présentes"""
        if not Config.MONGO_URI:
            raise ValueError("❌ MONGODB_URI n'est pas défini dans .env")
        if not Config.JWT_SECRET_KEY:
            raise ValueError("❌ JWT_SECRET_KEY n'est pas défini dans .env")
        print("✅ Configuration validée")
        print(f"   MongoDB URI: {Config.MONGO_URI[:30]}...")
        print(f"   JWT Secret: {'*' * len(Config.JWT_SECRET_KEY)}")