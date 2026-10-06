import "./index.scss";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addProductToCart } from "../../thunkActionsCreator/cartThunks";
import { showToast } from "../../slices/toastSlice";
import { site } from "../../config/site";
import { formatPrice } from "../../utils/formatPrice";
import { stripHtml } from "../../utils/stripHtml";
import { getDiscountPercent } from "../../utils/productHelpers";
import WishlistButton from "../WishlistButton";
import chatIcon from "../../assets/icons/chat.svg";

// Une valeur choisie correspond à la variante si le nom ou le slug est identique
const sameValue = (a, b) =>
  String(a || "").toLowerCase() === String(b || "").toLowerCase();

export default function ProductPurchase({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selection, setSelection] = useState({});
  const [adding, setAdding] = useState(false);

  const name = stripHtml(product.name);
  const brand = stripHtml(product.brands?.[0]?.name);
  const subtitle = stripHtml(product.short_description);
  const extra = product.npa || {};
  const { prices } = product;
  const minorUnit = prices.currency_minor_unit;
  const discount = getDiscountPercent(prices);
  const price = Number(product.has_options ? prices.price_range?.min_amount || prices.price : prices.price);
  const priceExclTax = Math.round(price / (1 + site.vatRate));
  const rating = Number(product.average_rating) || 0;
  const reviewCount = product.review_count || 0;

  // Attributs qui servent à choisir une variante (taille, côté...)
  const variationAttributes = (product.attributes || []).filter(
    (attribute) => attribute.has_variations && attribute.terms?.length,
  );

  useEffect(() => {
    const defaults = {};
    variationAttributes.forEach((attribute) => {
      defaults[attribute.name] = attribute.terms[0];
    });
    setSelection(defaults);
    setQuantity(1);
  }, [product.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Disponibilité de la variante choisie
  const selectedVariation = (product.variations || []).find((variation) =>
    variation.attributes.every((attribute) => {
      const term = selection[attribute.name];
      return term && (sameValue(term.name, attribute.value) || sameValue(term.slug, attribute.value));
    }),
  );
  const isInStock = selectedVariation
    ? selectedVariation.is_in_stock !== false
    : product.is_in_stock;
  const canBuy = product.is_purchasable && isInStock && !adding;

  const addToCart = async (goToCart = false) => {
    setAdding(true);
    const variation = {};
    Object.entries(selection).forEach(([attributeName, term]) => {
      variation[attributeName] = term.name;
    });
    const result = await dispatch(
      addProductToCart({ productId: product.id, quantity, variation }),
    );
    setAdding(false);
    if (addProductToCart.fulfilled.match(result)) {
      dispatch(showToast(`${name} ajouté au panier`));
      if (goToCart) navigate("/panier");
    } else {
      dispatch(showToast(result.payload || "Erreur lors de l'ajout au panier"));
    }
  };

  return (
    <div className="product-purchase">
      <div className="product-purchase-card">
        <div className="product-purchase-header">
          <div className="product-purchase-heading">
            {brand && <span className="product-purchase-brand">{brand}</span>}
            <h1 className="product-purchase-title">{name}</h1>
          </div>
          <div className="product-purchase-header-aside">
            {extra.brand_logo && (
              <img src={extra.brand_logo} alt={brand} className="product-purchase-logo" />
            )}
            <WishlistButton product={product} />
          </div>
        </div>

        {subtitle && <p className="product-purchase-subtitle">{subtitle}</p>}

        {(product.sku || extra.gtin) && (
          <div className="product-purchase-references">
            {product.sku && <span>Réf : {product.sku}</span>}
            {extra.gtin && <span>EAN : {extra.gtin}</span>}
          </div>
        )}

        <a href="#avis" className="product-purchase-rating">
          {reviewCount > 0 ? (
            <>
              <span className="product-purchase-rating-value">
                {rating.toFixed(1).replace(".", ",")} / 5
              </span>{" "}
              ({reviewCount} avis vérifié{reviewCount > 1 ? "s" : ""})
            </>
          ) : (
            "Aucun avis pour le moment, donnez le vôtre"
          )}
        </a>

        <div className="product-purchase-price-box">
          <div className="product-purchase-prices">
            <span className="product-purchase-price">
              {product.has_options && prices.price_range && "Dès "}
              {formatPrice(price, minorUnit)}
              <span className="product-purchase-tax">TTC</span>
            </span>
            {discount > 0 && (
              <span className="product-purchase-regular">
                Prix conseillé :{" "}
                <span className="product-purchase-regular-price">
                  {formatPrice(prices.regular_price, minorUnit)}
                </span>{" "}
                <span className="product-purchase-discount">-{discount}%</span>
              </span>
            )}
          </div>
          <div className="product-purchase-vat">
            <span>{formatPrice(priceExclTax, minorUnit)} HT</span>
            <span className="product-purchase-vat-pro">TVA récupérable Pro</span>
          </div>
        </div>

        {product.is_on_backorder ? (
          <div className="product-purchase-info">
            <span className="product-purchase-info-title">Sur commande</span>
            <span className="product-purchase-info-text">
              Livraison sous 24/48h au comptoir ou à domicile.
            </span>
          </div>
        ) : isInStock ? (
          <>
            <div className="product-purchase-info">
              <span className="product-purchase-info-title">
                {site.product.pickupTitle}
              </span>
              <span className="product-purchase-info-text">{site.product.pickupText}</span>
            </div>
            <div className="product-purchase-info">
              <span className="product-purchase-info-title">
                {site.product.deliveryTitle}
              </span>
              <span className="product-purchase-info-text">{site.product.deliveryText}</span>
            </div>
          </>
        ) : (
          <div className="product-purchase-info is-out-of-stock">
            <span className="product-purchase-info-title">Rupture de stock</span>
            <span className="product-purchase-info-text">
              Appelez le comptoir au {site.phone} pour connaître la date de retour.
            </span>
          </div>
        )}

        {variationAttributes.map((attribute) => (
          <label key={attribute.name} className="product-purchase-option">
            <span className="product-purchase-option-label">{attribute.name}</span>
            <select
              className="product-purchase-select"
              value={selection[attribute.name]?.slug || ""}
              onChange={(e) =>
                setSelection({
                  ...selection,
                  [attribute.name]: attribute.terms.find((term) => term.slug === e.target.value),
                })
              }
            >
              {attribute.terms.map((term) => (
                <option key={term.slug} value={term.slug}>
                  {stripHtml(term.name)}
                </option>
              ))}
            </select>
          </label>
        ))}

        <div className="product-purchase-actions">
          <div className="product-purchase-quantity">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={!canBuy || quantity <= 1}
              aria-label="Diminuer la quantité"
            >
              –
            </button>
            <span aria-live="polite">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              disabled={!canBuy}
              aria-label="Augmenter la quantité"
            >
              +
            </button>
          </div>
          <button
            type="button"
            className="btn btn-primary product-purchase-add"
            onClick={() => addToCart(false)}
            disabled={!canBuy}
          >
            {isInStock ? "Ajouter au panier" : "Rupture de stock"}
          </button>
        </div>

        {isInStock && !product.is_on_backorder && (
          <button
            type="button"
            className="btn btn-light product-purchase-pickup"
            onClick={() => addToCart(true)}
            disabled={!canBuy}
          >
            Réserver pour retrait comptoir La Capelette (prêt en 1h)
          </button>
        )}

        <div className="product-purchase-help">
          <span className="product-purchase-help-icon">
            <img src={chatIcon} alt="" />
          </span>
          <div className="product-purchase-help-content">
            <span className="product-purchase-help-title">{site.product.helpTitle}</span>
            <span className="product-purchase-help-text">{site.product.helpText}</span>
            <a
              href={site.whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="product-purchase-help-link"
            >
              Écrire sur WhatsApp : {site.whatsapp}
            </a>
          </div>
        </div>
      </div>

      <ul className="product-purchase-guarantees">
        {site.product.guarantees.map((guarantee) => (
          <li key={guarantee}>{guarantee}</li>
        ))}
      </ul>
    </div>
  );
}
