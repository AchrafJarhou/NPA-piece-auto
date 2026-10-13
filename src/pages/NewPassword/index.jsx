import "../../components/AuthForm/index.scss";
import "../../modals/auth/index.scss";
import "./index.scss";
import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.png";
import { site } from "../../config/site";

// Même présentation que la modale de connexion : encadré blanc centré, bouton jaune
export default function NewPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const key = searchParams.get("key");
  const login = searchParams.get("login");

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/wp-json/custom/v1/new-password`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, login, password }),
      },
    );
    const data = await response.json();
    setLoading(false);
    setMessage(data.message);
    if (response.ok) navigate("/");
  };

  return (
    <main className="new-password-page">
      <div className="new-password-card auth-modal">
        <div className="auth-modal-header">
          <img src={logo} alt={site.name} className="auth-modal-logo" />
          <h1 className="auth-modal-title">Nouveau mot de passe</h1>
          <p className="auth-modal-subtitle">
            Choisissez un nouveau mot de passe pour votre compte
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form-field">
            <label htmlFor="password" className="auth-form-label">
              Nouveau mot de passe
            </label>
            <input
              id="password"
              type="password"
              className="auth-form-input"
              autoComplete="new-password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {message && (
            <p className="auth-form-server-error" role="alert">
              {message}
            </p>
          )}

          <button
            type="submit"
            className="btn btn-primary auth-form-submit"
            disabled={loading}
          >
            {loading ? "Patientez…" : "Confirmer"}
          </button>
        </form>
      </div>
    </main>
  );
}
