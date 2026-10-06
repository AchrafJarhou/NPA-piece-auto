import "./index.scss";
import { site } from "../../config/site";
import CartItem from "../CartItem";

// Carte "Articles sélectionnés" du panier
export default function CartItems({ items }) {
  const count = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <section className="cart-items">
      <div className="cart-items-header">
        <h2 className="cart-items-title">Articles sélectionnés ({count})</h2>
        <span className="cart-items-note">{site.cart.itemsNote}</span>
      </div>
      <ul className="cart-items-list">
        {items.map((item) => (
          <CartItem key={item.key} item={item} />
        ))}
      </ul>
    </section>
  );
}
