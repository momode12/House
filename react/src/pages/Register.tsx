import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { authService } from '../services/authService';
import { showAlert } from '../utils/Alerts';
import { validation } from '../utils/Validation';
import Swal from 'sweetalert2';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!validation.email(formData.email)) {
      showAlert.error('Email invalide', 'Veuillez entrer une adresse email valide');
      return;
    }

    if (!validation.username(formData.username)) {
      showAlert.error('Username invalide', "Le nom d'utilisateur doit contenir au moins 3 caractères");
      return;
    }

    if (!validation.password(formData.password)) {
      showAlert.error('Mot de passe invalide', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showAlert.error('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    // Appel API
    showAlert.loading('Création du compte...');
    
    const { success } = await authService.register({
      email: formData.email,
      username: formData.username,
      password: formData.password
    });

    Swal.close();

    if (success) {
      await showAlert.success('Compte créé !');
      navigate('/login');
    } else {
      showAlert.error('Erreur');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Créer un compte</h1>
          <p className="text-sm text-gray-600">Rejoignez-nous aujourd'hui</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="votre@email.com"
            required
            icon={
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            }
          />

          <Input
            label="Nom d'utilisateur"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="john_doe"
            required
            icon={
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          />

          <Input
            label="Mot de passe"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
            icon={
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            }
          />

          <Input
            label="Confirmer le mot de passe"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            required
            icon={
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />

          <Button type="submit" fullWidth variant="primary">
            S'inscrire
          </Button>
        </form>

    

        <div className="text-center">
          <p className="text-xs text-gray-600">
            Vous avez déjà un compte ?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              Se connecter
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Register;