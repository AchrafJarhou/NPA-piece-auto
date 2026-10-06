import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

import DeleteAccountButton from "../../components/DeleteAccountButton";
import { UserDisplay } from "../../components/UserDisplay";
import AddressCard from "../../components/AddressCard";
import { OrderAll } from "../../components/OrderAll";
import "./index.scss";

export default function Profile() {
  const navigate = useNavigate();
  const isAuthentificated = useSelector((state) => state.user?.token);
  const customer = useSelector((state) => state.user.customer);

  useEffect(() => {
    !isAuthentificated && navigate("/catalogue", { replace: true });
  }, [isAuthentificated, navigate]);

  if (!isAuthentificated) return null;

  return (
    <main className="profile">
      <div className="profile__container">
        <h1 className="profile__title">Mon profil</h1>

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
