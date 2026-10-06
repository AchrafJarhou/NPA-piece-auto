import "./index.scss";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import CheckoutSteps from "../../components/CheckoutSteps";
import CartStoreBanner from "../../components/CartStoreBanner";
import CartItems from "../../components/CartItems";
import CartCompatibility from "../../components/CartCompatibility";
import Coupon from "../../components/Coupon";
import CartShipping from "../../components/CartShipping";
import CartSummary from "../../components/CartSummary";
import CartGoogleRating from "../../components/CartGoogleRating";
import ReassuranceBand from "../../components/ReassuranceBand";
import Loader from "../../components/Loader";

export default function Cart() {
  const { items, totals, needs_shipping, shipping_rates, loading } = useSelector(
    (state) => state.cart,
  );

  // Retrait sous 2h seulement si aucun article n'est sur commande
  const allInStock = items.every((item) => !item.show_backorder_badge);
  const isEmpty = items.length === 0;

  return (
    <main className="cart-page">
      <div className="cart-page-body">
        <div className="cart-page-inner">
          <CheckoutSteps current={1} />

          {isEmpty && !totals && loading ? (
            <Loader size="lg" />
          ) : isEmpty ? (
            <div className="cart-page-empty">
              <h2 className="cart-page-empty-title">Votre panier est vide</h2>
              <p className="cart-page-empty-text">
                Trouvez vos pièces dans le catalogue ou par véhicule.
              </p>
              <Link to="/catalogue" className="btn btn-primary">
                Voir le catalogue
              </Link>
            </div>
          ) : (
            <div className="cart-page-layout">
              <div className="cart-page-main">
                <CartStoreBanner allInStock={allInStock} />
                <CartItems items={items} />
                <CartCompatibility />
                <Coupon />
                <Link to="/catalogue" className="cart-page-continue">
                  ← Poursuivre mes achats de pièces
                </Link>
              </div>

              <aside className="cart-page-aside">
                {needs_shipping && shipping_rates.length > 0 && (
                  <CartShipping allInStock={allInStock} />
                )}
                <CartSummary />
                <CartGoogleRating />
              </aside>
            </div>
          )}
        </div>
      </div>

      <ReassuranceBand />
    </main>
  );
}
