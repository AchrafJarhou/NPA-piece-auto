import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "../../slices/toastSlice";
import OrderDetails from "../../modals/orderDetails";
import "./index.scss";
export default function Success() {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.user.token);
  const { orders } = useSelector((state) => state.user);

  const order = orders.find(
    (item) => String(item.id) === orderId || String(item.number) === orderId,
  );

  useEffect(() => {
    dispatch(showToast(`Commande n°${orderId} confirmée`));
  }, [orderId, dispatch]);

  return (
    <main className="success-page">
      <div className="success-header">
        <h1>Commande confirmée</h1>
        <p className="success-subtitle">
          Merci pour votre commande n°{orderId}.
        </p>
      </div>

      {!token && (
        <div className="success-guest">
          <p>
            Vous avez commandé en tant qu'invité. Un email de confirmation vous
            a été envoyé avec le récapitulatif de votre commande.
          </p>
        </div>
      )}
    </main>
  );
}
