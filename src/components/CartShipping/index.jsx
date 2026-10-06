import "./index.scss";
import { useDispatch, useSelector } from "react-redux";
import { selectShippingRateThunk } from "../../thunkActionsCreator/cartThunks";
import { showToast } from "../../slices/toastSlice";
import { site } from "../../config/site";
import { formatPrice } from "../../utils/formatPrice";

// Textes de site.js correspondant à un mode de livraison WooCommerce
const findTexts = (rate) =>
  site.cart.shippingModes.find(
    (mode) => mode.match === rate.method_id || rate.name.includes(mode.match),
  ) || {};

const ratePrice = (rate) => Number(rate.price || 0) + Number(rate.taxes || 0);

// "Mode d'obtention de vos pièces" : les modes et leurs prix viennent de WooCommerce
export default function CartShipping({ allInStock }) {
  const dispatch = useDispatch();
  const { shipping_rates: packages, loading } = useSelector((state) => state.cart);

  const choose = async (packageId, rate) => {
    if (rate.selected || loading) return;
    const result = await dispatch(
      selectShippingRateThunk({ packageId, rateId: rate.rate_id }),
    );
    if (selectShippingRateThunk.rejected.match(result)) {
      dispatch(showToast(result.payload || "Impossible de choisir ce mode de livraison"));
    }
  };

  return (
    <section className="cart-shipping">
      <h2 className="cart-shipping-title">Mode d'obtention de vos pièces</h2>

      {packages.map((pack) => (
        <div key={pack.package_id} className="cart-shipping-options" role="radiogroup">
          {pack.shipping_rates.map((rate) => {
            const texts = findTexts(rate);
            const price = ratePrice(rate);
            const isPickup = rate.method_id === "local_pickup";
            const priceLabel =
              price > 0
                ? formatPrice(price, rate.currency_minor_unit)
                : isPickup
                  ? `${formatPrice(0, rate.currency_minor_unit)} (Gratuit)`
                  : "Offert";
            const note = isPickup
              ? allInStock
                ? texts.noteInStock
                : texts.noteOnOrder
              : texts.note;

            return (
              <label
                key={rate.rate_id}
                className={`cart-shipping-option ${rate.selected ? "is-selected" : ""}`}
              >
                <input
                  type="radio"
                  className="cart-shipping-radio"
                  name={`shipping-${pack.package_id}`}
                  checked={rate.selected}
                  onChange={() => choose(pack.package_id, rate)}
                />
                <span className="cart-shipping-content">
                  <span className="cart-shipping-heading">
                    <span className="cart-shipping-name">{rate.name}</span>
                    <span className="cart-shipping-price">{priceLabel}</span>
                  </span>
                  {texts.text && <span className="cart-shipping-text">{texts.text}</span>}
                  {price > 0 && texts.freeFrom && (
                    <span className="cart-shipping-text">
                      Offerte dès {texts.freeFrom} € d'achat
                    </span>
                  )}
                  {note && <span className="cart-shipping-note">{note}</span>}
                </span>
              </label>
            );
          })}
        </div>
      ))}
    </section>
  );
}
