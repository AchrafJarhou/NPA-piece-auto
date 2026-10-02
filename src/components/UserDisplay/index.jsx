import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../Loader";
import ShippingDisplay from "../ShippingDisplay";
import BillingDisplay from "../BillingDisplay";
import {
  fetchCurrentUserThunk,
  updateCurrentUserThunk,
} from "../../thunkActionsCreator/userThunks";
import "./index.scss";

export function UserDisplay() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const profile = user?.profile;
  const [newEmail, setNewEmail] = useState("");
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const loading = useSelector((state) => state.user.loading);
  const error = useSelector((state) => state.user.error);

  useEffect(() => {
    dispatch(fetchCurrentUserThunk());
  }, [dispatch]);
  useEffect(() => {
    profile && profile.email ? setNewEmail(profile.email) : null;
    profile && profile.firstName ? setNewFirstName(profile.firstName) : null;
    profile && profile.lastName ? setNewLastName(profile.lastName) : null;
  }, [profile]);

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    dispatch(
      updateCurrentUserThunk({
        email: newEmail || undefined,
        firstName: newFirstName || undefined,
        lastName: newLastName || undefined,
        password: newPassword || undefined,
      }),
    );
  };

  if (loading) return <Loader size="lg" />;
  if (error) return <p>{error}</p>;
  if (!profile) return <p>Aucun profil.</p>;

  return (
    <div className="form-container">
      <form onSubmit={handleUpdateProfile} className="update-form">
        <h3>Profil</h3>
        <div className="input-container">
          <p>Nom d'utilisateur : {profile.username}</p>
          <p>
            Email :{" "}
            <input
              type="email"
              placeholder="nouvel email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          </p>
          <p>
            Prénom :{" "}
            <input
              type="text"
              placeholder="prenom"
              value={newFirstName}
              onChange={(e) => setNewFirstName(e.target.value)}
            />
          </p>
          <p>
            Nom :{" "}
            <input
              type="text"
              placeholder="nom"
              value={newLastName}
              onChange={(e) => setNewLastName(e.target.value)}
            />
          </p>
          <p>
            Mot de passe :{" "}
            <input
              type="password"
              placeholder="nouveau mot de passe"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </p>
        </div>
        <button type="submit" disabled={user.loading}>
          {user.loading ? "Mise a jour..." : "Mettre a jour le profil"}
        </button>
      </form>
      <BillingDisplay />
      <ShippingDisplay />
    </div>
  );
}
