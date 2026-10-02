import { useDispatch, useSelector } from "react-redux";
import "./index.scss";
import { openModal, closeModal } from "../../slices/modalSlice";

export function OrderAll() {
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.user.orders);

  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );

  const handleSubmit = (order) => {
    dispatch(openModal({ name: "orderDetails", props: order }));
    return;
  };
  return (
    <>
      {!orders?.length ? (
        <p>Aucune commande trouvée.</p>
      ) : (
        <div className="orders-history">
          {sortedOrders.map((order) => (
            <div key={order.id} className="history-order">
              <div className="history-header">
                <div>
                  <strong>Commande n°{order.number ?? order.id}</strong>

                  <p>
                    {order.date &&
                      new Date(order.date).toLocaleDateString("fr-FR")}
                  </p>

                  <p>{order.status}</p>
                </div>

                {/* <button type="button" onClick={() => setOpened(order.id)}> */}
                <button type="button" onClick={() => handleSubmit(order.id)}>
                  Voir plus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
