import "./index.scss";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { closeModal, updateModalProps } from "../../slices/modalSlice";
import {
  loginThunk,
  registerThunk,
} from "../../thunkActionsCreator/userThunks";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Portable français : 06 / 07, avec ou sans +33, espaces, points ou tirets
const mobilePattern = /^(?:(?:\+|00)33\s?|0)[67](?:[\s.-]?\d{2}){4}$/;

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  isPro: false,
  siret: "",
  password: "",
  confirmPassword: "",
  remember: false,
};

const validate = (view, form) => {
  const errors = {};

  if (!form.email.trim()) {
    errors.email = "L'adresse email est requise.";
  } else if (!emailPattern.test(form.email.trim())) {
    errors.email = "Entrez une adresse email valide.";
  }

  if (view === "login" && !form.password) {
    errors.password = "Le mot de passe est requis.";
  }

  if (view === "register") {
    if (!form.firstName.trim()) errors.firstName = "Le prénom est requis.";
    if (!form.lastName.trim()) errors.lastName = "Le nom est requis.";
    if (form.phone.trim() && !mobilePattern.test(form.phone.trim())) {
      errors.phone = "Entrez un numéro de portable valide (06 ou 07).";
    }
    if (form.isPro) {
      // 14 chiffres, espaces tolérés (ex : 123 456 789 00012)
      const siret = form.siret.replace(/\s/g, "");
      if (!siret) {
        errors.siret = "Le numéro de SIRET est requis.";
      } else if (!/^\d{14}$/.test(siret)) {
        errors.siret = "Le SIRET doit contenir 14 chiffres.";
      }
    }
    if (!form.password) {
      errors.password = "Le mot de passe est requis.";
    } else {
      const missing = [
        form.password.length < 8 && "8 caractères",
        !/\p{Lu}/u.test(form.password) && "une majuscule",
        !/\p{Ll}/u.test(form.password) && "une minuscule",
        !/[^\p{L}\p{N}\s]/u.test(form.password) && "un caractère spécial",
      ].filter(Boolean);
      if (missing.length > 0) {
        errors.password = `Il manque au moins : ${missing.join(", ")}.`;
      }
    }
    if (!form.confirmPassword) {
      errors.confirmPassword = "Veuillez confirmer votre mot de passe.";
    } else if (form.confirmPassword !== form.password) {
      errors.confirmPassword = "Les mots de passe ne correspondent pas.";
    }
  }

  return errors;
};

export default function AuthForm({ view = "login" }) {
  const dispatch = useDispatch();
  const { loading, error, token } = useSelector((state) => state.user);

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  // L'erreur serveur n'est affichée qu'après un envoi depuis ce formulaire
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (token) dispatch(closeModal());
  }, [dispatch, token]);

  const isLogin = view === "login";
  const switchView = (next) => dispatch(updateModalProps({ view: next }));

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const updatedForm = { ...form, [name]: type === "checkbox" ? checked : value };
    // Décocher "professionnel" efface le SIRET, pour ne pas l'envoyer à notre insu
    if (name === "isPro" && !checked) {
      updatedForm.siret = "";
      setErrors({ ...errors, siret: "" });
    }
    setForm(updatedForm);
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = validate(view, form);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setSubmitted(true);
    // TODO backend : "maintenir ma session"
    if (isLogin) {
      dispatch(
        loginThunk({ username: form.email.trim(), password: form.password }),
      );
    } else {
      dispatch(
        registerThunk({
          username: form.email.trim(),
          email: form.email.trim(),
          password: form.password,
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          phone: form.phone.trim() || undefined,
          // Le SIRET permet au back-end de pré-remplir les adresses du pro
          siret: form.isPro ? form.siret.replace(/\s/g, "") : undefined,
        }),
      );
    }
  };

  // Champ + message d'erreur, relié par aria-describedby
  const fieldProps = (name) => ({
    id: `auth-${name}`,
    name,
    value: form[name],
    onChange: handleChange,
    className: `auth-form-input ${errors[name] ? "has-error" : ""}`,
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": errors[name] ? `auth-${name}-error` : undefined,
  });

  const fieldError = (name) =>
    errors[name] && (
      <span id={`auth-${name}-error`} className="auth-form-error">
        {errors[name]}
      </span>
    );

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      {!isLogin && (
        <div className="auth-form-row">
          <div className="auth-form-field">
            <label htmlFor="auth-firstName" className="auth-form-label">
              Prénom
            </label>
            <input
              {...fieldProps("firstName")}
              type="text"
              autoComplete="given-name"
              autoFocus
            />
            {fieldError("firstName")}
          </div>
          <div className="auth-form-field">
            <label htmlFor="auth-lastName" className="auth-form-label">
              Nom
            </label>
            <input
              {...fieldProps("lastName")}
              type="text"
              autoComplete="family-name"
            />
            {fieldError("lastName")}
          </div>
        </div>
      )}

      <div className="auth-form-field">
        <label htmlFor="auth-email" className="auth-form-label">
          Email
        </label>
        <input
          {...fieldProps("email")}
          type="email"
          autoComplete={isLogin ? "username" : "email"}
          placeholder="votre.email@domaine.fr"
          autoFocus={isLogin}
        />
        {fieldError("email")}
      </div>

      {!isLogin && (
        <div className="auth-form-field">
          <label htmlFor="auth-phone" className="auth-form-label">
            Téléphone portable <span className="auth-form-optional">(facultatif)</span>
          </label>
          <input
            {...fieldProps("phone")}
            type="tel"
            autoComplete="tel"
            placeholder="06 12 34 56 78"
          />
          {fieldError("phone")}
        </div>
      )}

      {!isLogin && (
        <label className="auth-form-checkbox">
          <input
            type="checkbox"
            name="isPro"
            checked={form.isPro}
            onChange={handleChange}
          />
          <span>Je suis professionnel</span>
        </label>
      )}

      {!isLogin && form.isPro && (
        <div className="auth-form-field">
          <label htmlFor="auth-siret" className="auth-form-label">
            Numéro de SIRET
          </label>
          <input
            {...fieldProps("siret")}
            type="text"
            inputMode="numeric"
            placeholder="123 456 789 00012"
            maxLength={17}
            autoFocus
          />
          {fieldError("siret")}
        </div>
      )}

      <div className="auth-form-field">
        <div className="auth-form-label-row">
          <label htmlFor="auth-password" className="auth-form-label">
            Mot de passe
          </label>
          {isLogin && (
            <button
              type="button"
              className="auth-form-link"
              onClick={() => switchView("reset-password")}
            >
              Mot de passe oublié ?
            </button>
          )}
        </div>
        <input
          {...fieldProps("password")}
          type="password"
          autoComplete={isLogin ? "current-password" : "new-password"}
          placeholder="••••••••••••"
          {...(!isLogin &&
            !errors.password && { "aria-describedby": "auth-password-hint" })}
        />
        {fieldError("password")}
        {!isLogin && !errors.password && (
          <span id="auth-password-hint" className="auth-form-hint">
            8 caractères minimum, dont au moins une majuscule, une minuscule et
            un caractère spécial.
          </span>
        )}
      </div>

      {!isLogin && (
        <div className="auth-form-field">
          <label htmlFor="auth-confirmPassword" className="auth-form-label">
            Confirmez le mot de passe
          </label>
          <input
            {...fieldProps("confirmPassword")}
            type="password"
            autoComplete="new-password"
          />
          {fieldError("confirmPassword")}
        </div>
      )}

      {isLogin && (
        <label className="auth-form-checkbox">
          <input
            type="checkbox"
            name="remember"
            checked={form.remember}
            onChange={handleChange}
          />
          <span>Maintenir ma session active</span>
        </label>
      )}

      {submitted && error && !loading && (
        <p className="auth-form-server-error" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="btn btn-primary auth-form-submit"
        disabled={loading}
      >
        {loading
          ? "Patientez…"
          : isLogin
            ? "Se connecter"
            : "Créer mon compte"}
      </button>

      <p className="auth-form-footer">
        {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}{" "}
        <button
          type="button"
          className="auth-form-switch"
          onClick={() => switchView(isLogin ? "register" : "login")}
        >
          {isLogin ? "Créer un compte en 1 min" : "Se connecter"}
        </button>
      </p>
    </form>
  );
}
