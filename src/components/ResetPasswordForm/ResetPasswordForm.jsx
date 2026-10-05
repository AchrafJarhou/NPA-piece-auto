import "../AuthForm/index.scss";
import { useState } from "react";
import { useDispatch } from "react-redux";

import { updateModalProps } from "../../slices/modalSlice";

export default function ResetPasswordForm() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/wp-json/custom/v1/reset-password`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      },
    );
    const data = await response.json();
    setMessage(data.message);
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="auth-form-field">
        <label htmlFor="reset-email" className="auth-form-label">
          Votre email
        </label>
        <input
          id="reset-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="auth-form-input"
          autoComplete="email"
          placeholder="votre.email@domaine.fr"
          autoFocus
          required
        />
      </div>

      {message && (
        <p className="auth-form-server-error" role="alert">
          {message}
        </p>
      )}

      <button type="submit" className="btn btn-primary auth-form-submit">
        Envoyer le lien
      </button>

      <p className="auth-form-footer">
        <button
          type="button"
          className="auth-form-switch"
          onClick={() => dispatch(updateModalProps({ view: "login" }))}
        >
          Retour à la connexion
        </button>
      </p>
    </form>
  );
}
