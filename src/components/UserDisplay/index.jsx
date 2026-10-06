import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../Loader";
import { showToast } from "../../slices/toastSlice";
import {
  fetchCurrentUserThunk,
  updateCurrentUserThunk,
} from "../../thunkActionsCreator/userThunks";
import "../AddressFields/index.scss";
import "./index.scss";

export function UserDisplay() {
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.user.profile);
  const customer = useSelector((state) => state.user.customer);
  const [form, setForm] = useState({ email: "", firstName: "", lastName: "", password: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    dispatch(fetchCurrentUserThunk());
  }, [dispatch]);

  useEffect(() => {
    if (!profile) return;
    setForm((prev) => ({
      ...prev,
      email: profile.email || "",
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
    }));
  }, [profile]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await dispatch(
        updateCurrentUserThunk({
          email: form.email || undefined,
          firstName: form.firstName || undefined,
          lastName: form.lastName || undefined,
          password: form.password || undefined,
        }),
      ).unwrap();
      setForm((prev) => ({ ...prev, password: "" }));
      dispatch(showToast("Informations mises à jour"));
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  // Le chargement des adresses/commandes partage le même état : on n'affiche
  // le loader que tant que le profil n'est pas arrivé.
  if (!profile) return <Loader size="lg" />;

  const field = (name, label, type = "text", autoComplete) => (
    <div className="user-display__field">
      <label htmlFor={`user-${name}`} className="address-fields__label">
        {label}
      </label>
      <input
        id={`user-${name}`}
        name={name}
        type={type}
        value={form[name]}
        onChange={handleChange}
        autoComplete={autoComplete}
        className="address-fields__input"
      />
    </div>
  );

  return (
    <section className="user-display" aria-labelledby="user-display-title">
      <header className="user-display__header">
        <h2 id="user-display-title" className="user-display__title">
          Mes informations
        </h2>
        <span className="user-display__type">
          {customer?.accountType === "pro" ? "Compte professionnel" : "Compte particulier"}
        </span>
      </header>
      <form onSubmit={handleUpdateProfile} className="user-display__form">
        {field("firstName", "Prénom", "text", "given-name")}
        {field("lastName", "Nom", "text", "family-name")}
        {field("email", "Email", "email", "email")}
        {field("password", "Nouveau mot de passe", "password", "new-password")}
        {error && (
          <p className="user-display__error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Mise à jour…" : "Mettre à jour"}
        </button>
      </form>
    </section>
  );
}
