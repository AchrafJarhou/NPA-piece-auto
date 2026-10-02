import "./index.scss";

import { useSelector, useDispatch } from "react-redux";
import { CartProduct } from "../CartProduct";
import { emptyCartThunk } from "../../thunkActionsCreator/cartThunks";
import Coupon from "../Coupon";
import StripeWrapper from "../StripeWrapper";

export default function CartComponent() {
  const items = useSelector((state) => state.cart.items);
  const totals = useSelector((state) => state.cart.totals);
  const dispatch = useDispatch();

  return (
    <div className="cart">
      <div className="cart__layout">
        <ul className="cart__items">
          {items.length === 0 && (
            <li className="cart__empty-state">Votre panier est vide.</li>
          )}
          {items.map((item) => (
            <CartProduct key={item.key} item={item} />
          ))}
        </ul>

        <aside className="cart__summary">
          <Coupon />

          <div className="cart__total">
            <span>Total</span>
            <strong>
              {totals &&
                (parseInt(totals.total_price) / 100).toFixed(2) +
                  totals.currency_suffix}
            </strong>
          </div>

          <button
            type="button"
            className="cart__clear-button"
            onClick={() => dispatch(emptyCartThunk())}
          >
            Vider le panier
          </button>
        </aside>
      </div>

      <div className="cart__checkout">
        <StripeWrapper></StripeWrapper>
      </div>
    </div>
  );
}
