import { useDispatch, useSelector } from "react-redux";
import "./index.scss";
import { openModal } from "../../slices/modalSlice";
import StatusBadge from "../StatusBadge";

// Le endpoint custom/v1/orders renvoie le total en euros ("29.80")
const formatTotal = (total) => `${Number(total || 0).toFixed(2).replace(".", ",")} €`;

export function OrderAll() {
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.user.orders);

  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );

  const openDetails = (orderId) => {
    dispatch(openModal({ name: "orderDetails", props: orderId }));
  };

  return (
    <section className="orders-history" aria-labelledby="orders-history-title">
      <h2 id="orders-history-title" className="orders-history__title">
        Historique des commandes
      </h2>
      {!orders?.length ? (
        <p className="orders-history__empty">Vous n'avez pas encore passé de commande.</p>
      ) : (
        <ul className="orders-history__list">
          {sortedOrders.map((order) => {
            const count = order.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
            return (
              <li key={order.id} className="orders-history__row">
                <div className="orders-history__main">
                  <strong>Commande n°{order.number ?? order.id}</strong>
                  <span className="orders-history__meta">
                    {order.date && new Date(order.date).toLocaleDateString("fr-FR")}
                    {" · "}
                    {count} article{count > 1 ? "s" : ""}
                  </span>
                </div>
                <StatusBadge status={order.status} />
                <span className="orders-history__total">{formatTotal(order.total)}</span>
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => openDetails(order.id)}
                >
                  Voir le détail
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
