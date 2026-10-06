import "./index.scss";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectShippingRateThunk } from "../../thunkActionsCreator/cartThunks";
import { showToast } from "../../slices/toastSlice";
import { site } from "../../config/site";
import { formatPrice } from "../../utils/formatPrice";

// "Récapitulatif financier" : tous les montants sont calculés par WooCommerce
export default function CartSummary() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { totals, shipping_rates: packages, needs_shipping, loading } = useSelector(
    (state) => state.cart,
  );

  if (!totals) return null;

  const minorUnit = totals.currency_minor_unit;
  const amount = (...keys) => keys.reduce((sum, key) => sum + Number(totals[key] || 0), 0);
  const discount = amount("total_discount", "total_discount_tax");
  const fees = amount("total_fees", "total_fees_tax");
  const shipping = amount("total_shipping", "total_shipping_tax");
  const vatPercent = Math.round(site.vatRate * 100);

  const pickupRate = packages
    .flatMap((pack) => pack.shipping_rates.map((rate) => ({ pack, rate })))
    .find(({ rate }) => rate.method_id === "local_pickup");

  // "Régler au comptoir" : on choisit le retrait comptoir, le paiement se fait sur /commande
  const payAtCounter = async () => {
    if (!pickupRate.rate.selected) {
      const result = await dispatch(
        selectShippingRateThunk({
          packageId: pickupRate.pack.package_id,
          rateId: pickupRate.rate.rate_id,
        }),
      );
      if (selectShippingRateThunk.rejected.match(result)) {
        dispatch(showToast(result.payload || "Impossible de choisir le retrait comptoir"));
        return;
      }
    }
    navigate("/commande");
  };

  return (
    <section className="cart-summary">
      <div className="cart-summary-heading">
        <h2 className="cart-summary-title">Récapitulatif financier</h2>
        <span className="cart-summary-vat-note">TVA {vatPercent}% incluse</span>
      </div>

      <dl className="cart-summary-lines">
        <div className="cart-summary-line">
          <dt>Total articles brut HT</dt>
          <dd>{formatPrice(totals.total_items, minorUnit)}</dd>
        </div>
        <div className="cart-summary-line">
          <dt>TVA ({vatPercent}%)</dt>
          <dd>{formatPrice(totals.total_items_tax, minorUnit)}</dd>
        </div>
        {discount > 0 && (
          <div className="cart-summary-line is-discount">
            <dt>Remise code promo</dt>
            <dd>-{formatPrice(discount, minorUnit)}</dd>
          </div>
        )}
        {fees > 0 && (
          <div className="cart-summary-line">
            <dt>Frais</dt>
            <dd>{formatPrice(fees, minorUnit)}</dd>
          </div>
        )}
        {needs_shipping && (
          <div className="cart-summary-line">
            <dt>Mise à disposition / Port</dt>
            <dd className="cart-summary-shipping">
              {shipping > 0
                ? formatPrice(shipping, minorUnit)
                : `Gratuit (${formatPrice(0, minorUnit)})`}
            </dd>
          </div>
        )}
      </dl>

      <div className="cart-summary-total">
        <div className="cart-summary-total-content">
          <span className="cart-summary-total-label">Total général à payer</span>
          <span className="cart-summary-total-price">
            {formatPrice(totals.total_price, minorUnit)}
          </span>
        </div>
        <span className="cart-summary-total-tag">TTC</span>
      </div>

      <button
        type="button"
        className="btn btn-primary cart-summary-checkout"
        onClick={() => navigate("/commande")}
        disabled={loading}
      >
        Valider ma commande & payer
      </button>
      {pickupRate && (
        <button
          type="button"
          className="btn cart-summary-counter"
          onClick={payAtCounter}
          disabled={loading}
        >
          Régler directement au comptoir Capelette
        </button>
      )}

      <ul className="cart-summary-guarantees">
        {site.cart.guarantees.map((guarantee) => (
          <li key={guarantee}>{guarantee}</li>
        ))}
        <li>
          {site.cart.assistance}{" "}
          <a href={site.phoneHref} className="cart-summary-phone">
            {site.phone}
          </a>
        </li>
      </ul>
    </section>
  );
}
