import "./index.scss";
import { Link } from "react-router-dom";
import { site } from "../../config/site";
import { formatPrice } from "../../utils/formatPrice";

// Les montants de la route order-confirmation sont en euros ("18.50") : on les passe en centimes
const euros = (amount) => formatPrice(Math.round(Number(amount || 0) * 100), 2);

// Récapitulatif de la commande : articles et totaux calculés par WooCommerce
export default function OrderRecap({ order }) {
  const { totals } = order;
  const vatPercent = Math.round(site.vatRate * 100);

  return (
    <section className="order-recap">
      <h2 className="order-recap-title">Récapitulatif</h2>

      <ul className="order-recap-items">
        {order.items.map((item, index) => (
          <li key={`${item.sku}-${index}`} className="order-recap-item">
            <span className="order-recap-photo">
              {item.image ? <img src={item.image} alt="" /> : <span>photo</span>}
            </span>
            <div className="order-recap-info">
              {item.slug ? (
                <Link to={`/product/${item.slug}`} className="order-recap-name">
                  {item.name}
                </Link>
              ) : (
                <span className="order-recap-name">{item.name}</span>
              )}
              <span className="order-recap-meta">
                {item.sku && `Réf : ${item.sku} · `}Quantité : {item.quantity}
              </span>
            </div>
            <span className="order-recap-price">{euros(item.total)}</span>
          </li>
        ))}
      </ul>

      <dl className="order-recap-lines">
        <div className="order-recap-line">
          <dt>Articles TTC</dt>
          <dd>{euros(totals.items)}</dd>
        </div>
        {Number(totals.discount) > 0 && (
          <div className="order-recap-line is-discount">
            <dt>Remise</dt>
            <dd>-{euros(totals.discount)}</dd>
          </div>
        )}
        <div className="order-recap-line">
          <dt>Mise à disposition / Port</dt>
          <dd>{Number(totals.shipping) > 0 ? euros(totals.shipping) : "Gratuit"}</dd>
        </div>
        <div className="order-recap-line is-muted">
          <dt>Dont TVA ({vatPercent}%)</dt>
          <dd>{euros(totals.tax)}</dd>
        </div>
      </dl>

      <div className="order-recap-total">
        <span className="order-recap-total-label">
          {order.payment_method === "cod" ? "Total à régler au comptoir" : "Total payé"}
        </span>
        <span className="order-recap-total-price">{euros(totals.total)}</span>
      </div>
    </section>
  );
}
