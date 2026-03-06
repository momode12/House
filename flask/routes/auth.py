from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from models.user_models import UserModel
from werkzeug.security import generate_password_hash
from datetime import timedelta

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """Inscription d'un nouvel utilisateur"""
    data = request.get_json()
    email = data.get('email')
    username = data.get('username')
    password = data.get('password')

    # Validation des champs
    if not email or not password or not username:
        return jsonify(
            success=False, 
            message='Email, nom d\'utilisateur et mot de passe requis'
        ), 400

    # Vérifier si l'email existe déjà
    if UserModel.find_by_email(email):
        return jsonify(
            success=False, 
            message='Cet email est déjà utilisé'
        ), 409
    
    # Vérifier si le username existe déjà
    if UserModel.find_by_username(username):
        return jsonify(
            success=False, 
            message='Ce nom d\'utilisateur est déjà pris'
        ), 409

    # Hasher le mot de passe
    hashed_password = generate_password_hash(password)
    
    print(f"📝 Création d'un nouveau compte:")
    print(f"   Email: {email}")
    print(f"   Username: {username}")
    print(f"   Password hash: {hashed_password[:50]}...")
    
    # Créer l'utilisateur
    user_data = {
        'email': email,
        'username': username,
        'password': hashed_password
    }
    
    try:
        user_id = UserModel.create_user(user_data)
        print(f"✅ Utilisateur créé avec ID: {user_id}")
    except Exception as e:
        print(f"❌ Erreur lors de la création: {e}")
        return jsonify(
            success=False, 
            message='Erreur lors de la création du compte'
        ), 500
    
    # Générer le token JWT pour connexion automatique
    access_token = create_access_token(
        identity=email,
        additional_claims={
            'username': username,
            'email': email
        },
        expires_delta=timedelta(days=30)
    )
    
    print(f"✅ Token généré pour nouvelle inscription: {access_token[:50]}...")

    return jsonify(
        success=True,
        token=access_token,
        user={
            'email': email,
            'username': username
        },
        message='Compte créé avec succès'
    ), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    """Connexion d'un utilisateur existant"""
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # Validation des champs
    if not email or not password:
        return jsonify(
            success=False, 
            message='Email et mot de passe requis'
        ), 400

    # Chercher l'utilisateur
    user = UserModel.find_by_email(email)
    
    if not user:
        print(f"❌ Utilisateur non trouvé: {email}")
        return jsonify(
            success=False, 
            message='Email ou mot de passe incorrect'
        ), 401

    # Vérifier le mot de passe
    stored_password = user.get('password', '')
    
    print(f"🔐 Tentative de connexion:")
    print(f"   Email: {email}")
    print(f"   Password hash: {stored_password[:50]}...")
    
    # Vérifier le format du hash
    if not stored_password or not (stored_password.startswith('scrypt:') or stored_password.startswith('pbkdf2:')):
        print(f"❌ Mot de passe mal formaté pour {email}")
        return jsonify(
            success=False, 
            message='Erreur de configuration du compte. Veuillez contacter un administrateur.'
        ), 500

    # Vérifier le mot de passe
    if not UserModel.verify_password(email, password):
        print(f"❌ Mot de passe incorrect pour {email}")
        return jsonify(
            success=False, 
            message='Email ou mot de passe incorrect'
        ), 401

    # Générer le token JWT
    access_token = create_access_token(
        identity=email,
        additional_claims={
            'username': user.get('username', ''),
            'email': email
        },
        expires_delta=timedelta(days=30)
    )
    
    print(f"✅ Connexion réussie pour: {email}")
    print(f"   Token généré: {access_token[:50]}...")

    return jsonify(
        success=True,
        token=access_token,
        user={
            'email': user['email'],
            'username': user.get('username', '')
        },
        message='Connexion réussie'
    ), 200