import "./index.scss";
import { site } from "../../config/site";

// Bandeau sombre du comptoir au-dessus des articles du panier
export default function CartStoreBanner({ allInStock }) {
  return (
    <div className="cart-store-banner">
      <span className="cart-store-banner-title">
        <span className="cart-store-banner-dot" aria-hidden="true" />
        {site.cart.storeBanner}
      </span>
      <span className="cart-store-banner-text">
        {allInStock ? site.cart.pickupInStock : site.cart.pickupOnOrder}
      </span>
    </div>
  );
}
