import "./index.scss";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  closeModal,
  updateModalProps,
} from "../../slices/modalSlice";
import { showToast } from "../../slices/toastSlice";
import {
  loginThunk,
  registerThunk,
} from "../../thunkActionsCreator/userThunks";

export default function AuthForm({ view = "login" }) {
  const dispatch = useDispatch();
  const { loading, error, token } = useSelector((state) => state.user);

  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (token) dispatch(closeModal());
  }, [dispatch, token]);

  useEffect(() => {
    dispatch(showToast(error));
  }, [error]);

  const validateLogin = (method, updatedForm) => {
    setErrors({});
    const newErrors = {};
    !updatedForm && (updatedForm = form);
    if (!updatedForm.username.trim()) {
      newErrors.username = "Le nom d'utilisateur est requis.";
    }
    if (!updatedForm.password)
      newErrors.password = "Le mot de passe est requis.";
    else if (updatedForm.password.length < 8)
      newErrors.password = " Il faut au moins 8 caractères.";
    if (method === "register") {
      if (!updatedForm.email.trim()) {
        newErrors.email = "L'adresse e-mail est requise.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updatedForm.email)) {
        newErrors.email = "Entrez une adresse e-mail valide.";
      }
      if (!updatedForm.confirmPassword) {
        newErrors.confirmPassword = "Veuillez confirmer votre mot de passe.";
      } else if (updatedForm.confirmPassword !== updatedForm.password) {
        newErrors.confirmPassword = "Les mots de passe ne correspondent pas.";
      }
    }
    setErrors(newErrors);
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...form, [name]: value };
    setForm(updatedForm);
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    validateLogin(e, updatedForm);
  };

  const handleSubmit = (e, method = view) => {
    if (e) e.preventDefault();
    const validation = validateLogin(method);
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }
    if (method === "login") {
      dispatch(
        loginThunk({ username: form.username.trim(), password: form.password }),
      );
    }
    if (method === "register") {
      dispatch(
        registerThunk({
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
        }),
      );
    }
  };

  return (
    <form className="auth-form">
      <h2>
        {view === "login"
          ? "Bonjour"
          : view === "register"
            ? "Créer un compte"
            : "Confirmez votre mot de passe"}
      </h2>
      <div className="auth-form__field">
        <label htmlFor="username">Nom d'utilisateur</label>
        <input
          id="username"
          name="username"
          type="text"
          value={form.username}
          onChange={handleChange}
          className={errors.username ? "input--error" : ""}
          autoComplete="username"
          placeholder={errors.username}
          title={errors.username}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
      </div>
      {view === "register" && (
        <div className="auth-form__field">
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className={errors.email ? "input--error" : ""}
            autoComplete="email"
            placeholder={errors.email}
            title={errors.email}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
        </div>
      )}
      <div className="auth-form__field">
        <label htmlFor="password">Mot de passe</label>
        <input
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          className={errors.password ? "input--error" : ""}
          autoComplete={view === "login" ? "current-password" : "new-password"}
          placeholder={errors.password}
          title={errors.password}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
      </div>
      {view === "register" && (
        <div className="auth-form__field">
          <label htmlFor="confirmPassword">Confirmez le mot de passe</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            className={errors.confirmPassword ? "input--error" : ""}
            autoComplete="new-password"
            autoFocus
            placeholder={errors.confirmPassword}
            title={errors.confirmPassword}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
        </div>
      )}
      <button
        type="button"
        className="auth-form__forgot"
        onClick={() => dispatch(updateModalProps({ view: "reset-password" }))}
      >
        Mot de passe oublié ?
      </button>
      <div className="auth-form__buttons">
        <button
          className="login"
          type="button"
          onClick={(e) => {
            dispatch(updateModalProps({ view: "login" }));
            handleSubmit(e, "login");
          }}
        >
          Se connecter
        </button>
        <button
          type="button"
          className="signin"
          onClick={(e) => {
            dispatch(updateModalProps({ view: "register" }));
            handleSubmit(e, "register");
          }}
        >
          S'inscrire
        </button>{" "}
      </div>
    </form>
  );
}