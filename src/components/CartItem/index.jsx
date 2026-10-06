import "./index.scss";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  addProductToCart,
  deleteProductFromCart,
  substractProductFromCart,
} from "../../thunkActionsCreator/cartThunks";
import { formatPrice } from "../../utils/formatPrice";
import { stripHtml } from "../../utils/stripHtml";

// Une ligne du panier : photo, marque, référence, disponibilité, prix et quantité
export default function CartItem({ item }) {
  const dispatch = useDispatch();

  // Article ajouté à l'instant : on attend la réponse de WooCommerce
  if (item._optimistic) {
    return <li className="cart-item is-loading">Ajout en cours…</li>;
  }

  const slug = item.permalink?.split("/").filter(Boolean).pop();
  const name = stripHtml(item.name) || "Produit sans nom";
  const brand = item.extensions?.npa?.brand;
  const description = stripHtml(item.short_description);
  const variation = (item.variation || [])
    .map((attribute) => `${stripHtml(attribute.attribute)} : ${stripHtml(attribute.value)}`)
    .join(" • ");
  const minorUnit = item.prices?.currency_minor_unit;
  const lineTotal = Number(item.totals?.line_total || 0) + Number(item.totals?.line_total_tax || 0);
  const limits = item.quantity_limits || {};
  const canEdit = limits.editable !== false;

  const increase = () =>
    dispatch(
      addProductToCart({
        productId: item.id,
        quantity: 1,
        variation: Object.fromEntries(
          (item.variation || []).map((attribute) => [
            attribute.raw_attribute || attribute.attribute,
            attribute.value,
          ]),
        ),
      }),
    );
  const decrease = () =>
    dispatch(substractProductFromCart({ itemKey: item.key, quantity: item.quantity }));
  const remove = () => dispatch(deleteProductFromCart({ itemKey: item.key }));

  return (
    <li className="cart-item">
      <Link to={`/product/${slug}`} className="cart-item-photo">
        {item.images?.[0]?.src ? (
          <img src={item.images[0].thumbnail || item.images[0].src} alt={name} />
        ) : (
          <span className="cart-item-photo-empty">photo</span>
        )}
      </Link>

      <div className="cart-item-info">
        <div className="cart-item-badges">
          {brand && <span className="cart-item-brand">{brand}</span>}
          {item.sku && <span className="cart-item-sku">Réf : {item.sku}</span>}
          {item.show_backorder_badge ? (
            <span className="cart-item-stock is-on-order">Sur commande</span>
          ) : (
            <span className="cart-item-stock">En stock Capelette</span>
          )}
        </div>
        <Link to={`/product/${slug}`} className="cart-item-name">
          {name}
        </Link>
        {description && <span className="cart-item-description">{description}</span>}
        {variation && <span className="cart-item-variation">{variation}</span>}
      </div>

      <div className="cart-item-side">
        <span className="cart-item-total">{formatPrice(lineTotal, minorUnit)}</span>
        <span className="cart-item-unit">
          {formatPrice(item.prices?.price, minorUnit)} / unité TTC
        </span>
        <div className="cart-item-actions">
          <div className="cart-item-quantity">
            <button
              type="button"
              onClick={decrease}
              disabled={!canEdit || item.quantity <= (limits.minimum || 1)}
              aria-label={`Diminuer la quantité de ${name}`}
            >
              –
            </button>
            <span aria-live="polite">{item.quantity}</span>
            <button
              type="button"
              onClick={increase}
              disabled={!canEdit || (limits.maximum && item.quantity >= limits.maximum)}
              aria-label={`Augmenter la quantité de ${name}`}
            >
              +
            </button>
          </div>
          <button
            type="button"
            className="cart-item-remove"
            onClick={remove}
            title="Retirer"
            aria-label={`Retirer ${name} du panier`}
          >
            ×
          </button>
        </div>
      </div>
    </li>
  );
}
