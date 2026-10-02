import { addProductToCart } from "../../thunkActionsCreator/cartThunks";
import { showToast } from "../../slices/toastSlice";
import { useDispatch } from "react-redux";
import { Link, redirect } from "react-router-dom";
import { useState, useEffect } from "react";
import WishlistButton from "../WishlistButton";
import "./index.scss";

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const [itemVariation, setItemVariation] = useState({});

  const addProduct = async (productId, quantity, variation, name) => {
    const result = await dispatch(
      addProductToCart({
        productId,
        quantity,
        variation,
      }),
    );
    if (addProductToCart.fulfilled.match(result)) {
      dispatch(showToast(`${name} ajouté au panier`));
    } else {
      dispatch(showToast(result.payload || "Erreur lors de l'ajout au panier"));
    }
  };

  function changeVariation(name, value) {
    setItemVariation((prev) => ({ ...prev, [name]: value }));
  }

  function checkInStock(product) {
    if (product.is_in_stock === false) return false;
    const variation = product.variations.find((variation) =>
      variation.attributes.every(
        (attribute) => itemVariation[attribute.name] === attribute.value,
      ),
    );

    return variation ? variation.is_in_stock : true;
  }

  useEffect(() => {
    if (!product.attributes) return;

    const defaults = {};

    product.attributes.forEach((attribute) => {
      if (attribute.terms.length > 0) {
        defaults[attribute.name] = attribute.terms[0].name;
      }
    });

    setItemVariation(defaults);
  }, [product]);

  const truncateWords = (str, max = 20) => {
    if (!str) return "-";
    if (str.length <= max) return str;
    const sub = str.slice(0, max);
    const lastSpace = sub.lastIndexOf(" ");
    const trimmed = lastSpace > 0 ? sub.slice(0, lastSpace) : sub;

    return `${trimmed}...`;
  };

  return (
    <div className="product-card">
      <WishlistButton product={product} className="wishlist-button" />
      <Link to={"/product/" + product.slug} className="product-link">
        <img
          src={
            product.images[0]?.src ||
            "https://placeholder.pics/svg/300/DEDEDE/555555/Placeholder"
          }
          alt={product.name || "photo produit"}
        />
        <h4
          dangerouslySetInnerHTML={{
            __html: product.name || "-",
            /* __html: truncateWords(product.name) || "-", */
          }}
        />
        <p className="brand-title">{product.brands?.[0]?.name} </p>
      </Link>

      <div className="description">
        <span>
          {product.low_stock_remaining ? (
            <p className="low-stock"> {product.low_stock_remaining} restants</p>
          ) : product.is_in_stock ? (
            <p className="stock-status-available">En stock</p>
          ) : (
            <p className="stock-status-unavailable">Rupture de stock</p>
          )}
          <span>Prix: </span>
          <span dangerouslySetInnerHTML={{ __html: product.price_html }} />
        </span>

        <span>
          {product.attributes?.map((attribute) => (
            <div key={attribute.name}>
              <label htmlFor={attribute.name}>{attribute.name}</label>
              <select
                name={attribute.name}
                onChange={(e) =>
                  changeVariation(attribute.name, e.target.value)
                }
              >
                {attribute.terms.map((term) => (
                  <option key={term.name} value={term.name}>
                    {term.name}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </span>
      </div>
      {checkInStock(product) ? (
        <button
          onClick={() => addProduct(product.id, 1, itemVariation, product.name)}
        >
          Ajouter au panier
        </button>
      ) : (
        <button disabled>Rupture de stock</button>
      )}
    </div>
  );
}
