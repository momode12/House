from models.user_models import UserModel
import jwt
from flask import current_app
from datetime import datetime, timedelta

def register_user(data):
    email = data.get("email")
    username = data.get("username")
    password = data.get("password")
    
    # Validation basique
    if not email or not password or not username:
        return False, "Email, username and password are required"
    
    # Vérifier si l'email existe déjà
    if UserModel.find_by_email(email):
        return False, "Email already registered"
    
    # Vérifier si le username existe déjà
    if UserModel.find_by_username(username):
        return False, "Username already taken"
    
    # Créer l'objet utilisateur
    user_data = {
        "email": email,
        "username": username,
        "password": password,
        "created_at": datetime.utcnow()
    }
    
    print(f"DEBUG Register - Email: {email}, Username: {username}")
    UserModel.insert_user(user_data)
    return True, "User registered successfully"

def login_user(data):
    email = data.get("email")
    password = data.get("password")
    
    print(f"DEBUG Login - Email: {email}, Password length: {len(password) if password else 0}")
    
    if not email or not password:
        return None, "Email and password are required"
    
    # Vérifier l'utilisateur
    user = UserModel.find_by_email(email)
    print(f"DEBUG - User found: {user is not None}")
    
    if user:
        print(f"DEBUG - Stored password hash: {user.get('password')[:20]}...")
        result = UserModel.verify_password(email, password)
        print(f"DEBUG - Password verification result: {result}")
        
        if result:
            token = jwt.encode({
                "email": email,
                "username": user.get("username"),
                "exp": datetime.utcnow() + timedelta(hours=24)
            }, current_app.config["JWT_SECRET_KEY"], algorithm="HS256")
            return token, "Login successful"
    
    return None, "Invalid credentials"