import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import DeleteAccountButton from "../../components/DeleteAccountButton";
import { UserDisplay } from "../../components/UserDisplay";
import { OrderAll } from "../../components/OrderAll";
import { useEffect } from "react";
import "./index.scss";

export default function Profile() {
  const isAuthentificated = useSelector((state) => state.user?.token);
  useEffect(() => {
    !isAuthentificated && navigate("/catalogue", { replace: true });
  }, [isAuthentificated]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  if (isAuthentificated) {
    return (
      <main>
        <div className="profile-container">
          <UserDisplay />
          <DeleteAccountButton />
          <OrderAll />
        </div>
      </main>
    );
  }
}
