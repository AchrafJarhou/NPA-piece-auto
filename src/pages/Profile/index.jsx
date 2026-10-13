import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { logoutThunk } from "../../thunkActionsCreator/userThunks";

import DeleteAccountButton from "../../components/DeleteAccountButton";
import { UserDisplay } from "../../components/UserDisplay";
import AddressCard from "../../components/AddressCard";
import { OrderAll } from "../../components/OrderAll";
import "./index.scss";

export default function Profile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthentificated = useSelector((state) => state.user.isAuthenticated);
  const authChecked = useSelector((state) => state.user.authChecked);
  const customer = useSelector((state) => state.user.customer);

  // On attend la réponse de WordPress (session vérifiée) avant de rediriger
  useEffect(() => {
    authChecked && !isAuthentificated && navigate("/catalogue", { replace: true });
  }, [authChecked, isAuthentificated, navigate]);

  if (!isAuthentificated) return null;

  return (
    <main className="profile">
      <div className="profile__container">
        <div className="profile__header">
          <h1 className="profile__title">Mon profil</h1>
          <button
            type="button"
            className="profile__logout"
            onClick={() => dispatch(logoutThunk())}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="M16 17l5-5-5-5" />
              <path d="M21 12H9" />
            </svg>
            <span>Déconnexion</span>
          </button>
        </div>

        <UserDisplay />

        {customer && (
          <div className="profile__addresses">
            <AddressCard type="billing" />
            <AddressCard type="shipping" />
          </div>
        )}

        <OrderAll />

        <DeleteAccountButton />
      </div>
    </main>
  );
}
