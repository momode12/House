from models.init_models import mongo
from bson import ObjectId
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class UserModel:
    @staticmethod
    def collection():
        """Retourne la collection users"""
        if mongo.db is None:
            raise Exception("MongoDB non initialisé")
        return mongo.db.users

    @staticmethod
    def find_by_email(email):
        """Trouve un utilisateur par son email"""
        return UserModel.collection().find_one({"email": email})
    
    @staticmethod
    def find_by_username(username):
        """Trouve un utilisateur par son username"""
        return UserModel.collection().find_one({"username": username})
    
    @staticmethod
    def find_by_id(user_id):
        """Trouve un utilisateur par son ID"""
        return UserModel.collection().find_one({"_id": ObjectId(user_id)})
    
    @staticmethod
    def create_user(user_data):
        """
        Crée un nouvel utilisateur
        user_data doit contenir: email, username, password (haché)
        """
        # Ajouter la date de création
        user_data['created_at'] = datetime.utcnow()
        
        # Insérer dans la base de données
        result = UserModel.collection().insert_one(user_data)
        return str(result.inserted_id)
    
    @staticmethod
    def insert_user(user_data):
        """
        Alias pour create_user (pour compatibilité)
        Hash automatiquement le mot de passe si pas déjà fait
        """
        # Si le mot de passe n'est pas haché, le hasher
        if "password" in user_data:
            pwd = user_data["password"]
            if not (pwd.startswith('scrypt:') or pwd.startswith('pbkdf2:')):
                user_data["password"] = generate_password_hash(pwd)
        
        return UserModel.create_user(user_data)
    
    @staticmethod
    def verify_password(email, password):
        """Vérifie le mot de passe d'un utilisateur"""
        user = UserModel.find_by_email(email)
        if not user or 'password' not in user:
            return False
        
        try:
            return check_password_hash(user['password'], password)
        except Exception as e:
            print(f"❌ Erreur vérification mot de passe: {e}")
            return False
    
    @staticmethod
    def update_user(email, update_data):
        """Met à jour les données d'un utilisateur"""
        update_data['updated_at'] = datetime.utcnow()
        result = UserModel.collection().update_one(
            {"email": email},
            {"$set": update_data}
        )
        return result.modified_count > 0
    
    @staticmethod
    def delete_user(email):
        """Supprime un utilisateur"""
        result = UserModel.collection().delete_one({"email": email})
        return result.deleted_count > 0
    
    @staticmethod
    def list_all_users():
        """Liste tous les utilisateurs (sans les mots de passe)"""
        return list(UserModel.collection().find(
            {},
            {"password": 0}  # Exclure le mot de passe
        ))