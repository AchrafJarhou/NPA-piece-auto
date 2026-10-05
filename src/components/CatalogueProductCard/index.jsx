import "./index.scss";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { addProductToCart } from "../../thunkActionsCreator/cartThunks";
import { showToast } from "../../slices/toastSlice";
import { site } from "../../config/site";
import { formatPrice } from "../../utils/formatPrice";
import { stripHtml } from "../../utils/stripHtml";
import WishlistButton from "../WishlistButton";

// Disponibilité affichée sous la description
function getAvailability(product) {
  if (product.is_on_backorder) {
    return { text: "Sur commande", detail: "Livraison 24/48h", status: "backorder" };
  }
  if (product.is_in_stock && product.low_stock_remaining) {
    return {
      text: `Plus que ${product.low_stock_remaining} en stock`,
      detail: "Retrait 2h",
      status: "low",
    };
  }
  if (product.is_in_stock) {
    return {
      text: `En stock magasin ${site.address.city}`,
      detail: "Retrait 2h",
      status: "in-stock",
    };
  }
  return { text: "Rupture de stock", detail: "", status: "out-of-stock" };
}

export default function CatalogueProductCard({ product }) {
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  const name = stripHtml(product.name);
  const brand = stripHtml(product.brands?.[0]?.name);
  const badge = product.tags?.[0]?.name
    ? stripHtml(product.tags[0].name)
    : product.on_sale
      ? "Promo"
      : "";
  const image = product.images?.[0];
  const description = stripHtml(product.short_description);
  // Caractéristiques : les attributs qui ne servent pas à choisir une variante
  const specs = (product.attributes || [])
    .filter((attribute) => !attribute.has_variations && attribute.terms?.length)
    .slice(0, 4);
  const availability = getAvailability(product);
  const { prices } = product;
  const productUrl = `/product/${product.id}`;

  const addToCart = async () => {
    setAdding(true);
    const result = await dispatch(
      addProductToCart({ productId: product.id, quantity, variation: {} }),
    );
    setAdding(false);
    if (addProductToCart.fulfilled.match(result)) {
      dispatch(showToast(`${name} ajouté au panier`));
      setQuantity(1);
    } else {
      dispatch(showToast(result.payload || "Erreur lors de l'ajout au panier"));
    }
  };

  return (
    <article className="catalogue-card">
      <div className="catalogue-card-header">
        <div className="catalogue-card-brand">
          {brand && <span className="catalogue-card-brand-name">{brand}</span>}
          {product.sku && (
            <span className="catalogue-card-sku">Réf : {product.sku}</span>
          )}
        </div>
        <div className="catalogue-card-header-aside">
          {badge && (
            <span
              className={`catalogue-card-badge ${
                product.on_sale ? "catalogue-card-badge-highlight" : ""
              }`}
            >
              {badge}
            </span>
          )}
          <WishlistButton product={product} />
        </div>
      </div>

      <Link to={productUrl} className="catalogue-card-image" tabIndex="-1">
        {image ? (
          <img src={image.thumbnail || image.src} alt={image.alt || name} loading="lazy" />
        ) : (
          <span className="catalogue-card-placeholder">Photo à venir</span>
        )}
      </Link>

      <Link to={productUrl} className="catalogue-card-name">
        {name}
      </Link>

      {description && <p className="catalogue-card-description">{description}</p>}

      {specs.length > 0 && (
        <dl className="catalogue-card-specs">
          {specs.map((spec) => (
            <div key={spec.id || spec.name} className="catalogue-card-spec">
              <dt>{spec.name} :</dt>
              <dd>{spec.terms.map((term) => stripHtml(term.name)).join(", ")}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className={`catalogue-card-stock is-${availability.status}`}>
        <span className="catalogue-card-stock-text">{availability.text}</span>
        {availability.detail && (
          <span className="catalogue-card-stock-detail">{availability.detail}</span>
        )}
      </div>

      <div className="catalogue-card-footer">
        <div className="catalogue-card-prices">
          {product.on_sale && (
            <span className="catalogue-card-regular-price">
              {formatPrice(prices.regular_price, prices.currency_minor_unit)}
            </span>
          )}
          <span className="catalogue-card-price">
            {product.has_options && prices.price_range && "Dès "}
            {formatPrice(
              prices.price_range?.min_amount || prices.price,
              prices.currency_minor_unit,
            )}
            <span className="catalogue-card-tax">TTC</span>
          </span>
        </div>

        {product.has_options ? (
          <Link to={productUrl} className="btn btn-primary catalogue-card-choose">
            Choisir
          </Link>
        ) : (
          <div className="catalogue-card-actions">
            <div className="catalogue-card-quantity">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                aria-label="Diminuer la quantité"
                disabled={!product.is_purchasable || quantity <= 1}
              >
                –
              </button>
              <span aria-live="polite">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                aria-label="Augmenter la quantité"
                disabled={!product.is_purchasable}
              >
                +
              </button>
            </div>
            <button
              type="button"
              className="catalogue-card-add"
              onClick={addToCart}
              disabled={!product.is_purchasable || !product.is_in_stock || adding}
              title="Ajouter au panier"
              aria-label={`Ajouter ${name} au panier`}
            >
              +
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
