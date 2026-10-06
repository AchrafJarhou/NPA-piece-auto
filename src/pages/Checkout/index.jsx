import "./index.scss";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import CheckoutSteps from "../../components/CheckoutSteps";
import StripeWrapper from "../../components/StripeWrapper";

// Page /commande : coordonnées et paiement (formulaire existant, visuel à refaire)
export default function Checkout() {
  const items = useSelector((state) => state.cart.items);

  return (
    <main className="checkout-page">
      <div className="checkout-page-inner">
        <CheckoutSteps current={2} />
        {items.length === 0 ? (
          <div className="checkout-page-empty">
            <p className="checkout-page-empty-text">Votre panier est vide.</p>
            <Link to="/catalogue" className="btn btn-primary">
              Voir le catalogue
            </Link>
          </div>
        ) : (
          <>
            <Link to="/panier" className="checkout-page-back">
              ← Retour au panier
            </Link>
            <StripeWrapper />
          </>
        )}
      </div>
    </main>
  );
}
