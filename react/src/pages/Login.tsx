import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Input from "../ui/Input";
import Button from "../ui/Button";
import Card from "../ui/Card";
import { authService } from "../services/authService";
import { showAlert } from "../utils/Alerts";
import { validation } from "../utils/Validation";
import Swal from "sweetalert2";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validation.email(formData.email)) {
      showAlert.error(
        "Email invalide",
        "Veuillez entrer une adresse email valide",
      );
      return;
    }

    if (!formData.password) {
      showAlert.error("Erreur", "Veuillez entrer votre mot de passe");
      return;
    }

    showAlert.loading("Connexion en cours...");

    const { success, data } = await authService.login(formData);

    Swal.close();

    const responseData = data as any;
    if (success && responseData?.token) {
      localStorage.setItem("token", responseData.token);

      if (responseData.user) {
        localStorage.setItem("user", JSON.stringify(responseData.user));
      }

      await showAlert.success("Connecté !", "Bienvenue");
      navigate("/dashboard");
    } else {
      showAlert.error(
        "Erreur de connexion",
        responseData?.message || "Identifiants invalides",
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            Bon retour !
          </h1>
          <p className="text-sm text-gray-600">Connectez-vous à votre compte</p>
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
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                />
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
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            }
          />

          <div className="text-right">
            <a href="#" className="text-xs text-blue-600 hover:text-blue-700">
              Mot de passe oublié ?
            </a>
          </div>

          <Button type="submit" fullWidth variant="primary">
            Se connecter
          </Button>
        </form>

        <div className="text-center">
          <p className="text-xs text-gray-600">
            Vous n'avez pas de compte ?{" "}
            <Link
              to="/register"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              S'inscrire
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
