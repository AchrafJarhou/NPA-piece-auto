import "./index.scss";
import StatusBadge from "../StatusBadge";

// Bandeau "Commande confirmée" en haut de la page de confirmation
export default function OrderSuccessHero({ order }) {
  const date = order.date
    ? new Date(order.date).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <section className="order-success-hero">
      <span className="order-success-hero-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </span>
      <div className="order-success-hero-content">
        <span className="order-success-hero-eyebrow">Commande n° {order.number}</span>
        <h1 className="order-success-hero-title">Merci{order.first_name ? ` ${order.first_name}` : ""}, votre commande est confirmée</h1>
        <div className="order-success-hero-meta">
          <StatusBadge status={order.status} />
          {date && <span className="order-success-hero-date">Passée le {date}</span>}
        </div>
      </div>
    </section>
  );
}
