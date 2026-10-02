import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { addProductToCart } from "../../thunkActionsCreator/cartThunks";
import { showToast } from "../../slices/toastSlice";
import AverageRating from "../AverageRating";
import Seo from "../Seo";
import WishlistButton from "../WishlistButton"; // TEMP: wishlist testing, remove before commit
import { decodeHtml } from "../../utils/decodeHtml.js";

import "./index.scss";

export default function Product({ product }) {
  const dispatch = useDispatch();
  const [itemVariation, setItemVariation] = useState({});
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  function checkInStock(targetProduct) {
    const variation = targetProduct.variations.find((variation) =>
      variation.attributes.every(
        (attribute) => itemVariation[attribute.name] === attribute.value,
      ),
    );

    return variation ? variation.is_in_stock : true;
  }

  useEffect(() => {
    setActiveImageIndex(0);
  }, [product?.id]);

  const handleAddToCart = async () => {
    if (product && product.id) {
      const result = await dispatch(
        addProductToCart({
          productId: product.id,
          quantity: 1,
          variation: itemVariation,
        }),
      );
      if (addProductToCart.fulfilled.match(result)) {
        dispatch(showToast(`${decodeHtml(product.name)} ajouté au panier`));
      } else {
        dispatch(
          showToast(result.payload || "Erreur lors de l'ajout au panier"),
        );
      }
    }
  };

  function changeVariation(name, value) {
    setItemVariation((prev) => ({ ...prev, [name]: value }));
  }

  useEffect(() => {
    if (!product || !product.attributes) return;

    const defaults = {};

    product.attributes.forEach((attribute) => {
      if (attribute.terms.length > 0) {
        defaults[attribute.name] = attribute.terms[0].name;
      }
    });

    setItemVariation(defaults);
  }, [product]);

  const productImages = product.images || [];
  const mainImage = productImages[activeImageIndex]?.src || null;

  return (
    <div className="product-page-container">
      <Seo
        title={decodeHtml(product.name)}
        description={product.short_description || product.description}
        image={product.images?.[0]?.src}
        url={window.location.href}
        jsonLd={{
          "@context": "https://schema.org/",
          "@type": "Product",
          name: decodeHtml(product.name),
          description: product.short_description || product.description,
          image: product.images?.[0]?.src,
          offers: {
            "@type": "Offer",
            priceCurrency: product.prices?.currency_code || "EUR",
            price: product.prices?.price
              ? (parseFloat(product.prices.price) / 100).toFixed(2)
              : undefined,
            availability:
              product.stock_status === "instock"
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
          },
        }}
      />

      <div className="product-main-card">
        <div className="product-content-grid">
          <div className="gallery-wrapper">
            {mainImage ? (
              <>
                <div className="main-image-container">
                  <img src={mainImage} alt={decodeHtml(product.name)} />
                </div>

                {productImages.length > 1 && (
                  <div className="thumbnail-list">
                    {productImages.map((img, index) => (
                      <div
                        key={
                          "pictureDetails" + img.id + index ||
                          "pictureDetails" + index
                        }
                        className={`thumbnail-item ${index === activeImageIndex ? "active" : ""}`}
                        onClick={() => setActiveImageIndex(index)}
                      >
                        <img
                          src={img.src}
                          alt={`${decodeHtml(product.name)} thumbnail ${index + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="no-image-placeholder">
                Aucune image disponible
              </div>
            )}
          </div>

          <div className="info-wrapper">
            <h1 className="product-title">{decodeHtml(product.name)}</h1>
            <AverageRating
              avgRating={product?.average_rating ?? 0}
              totalReviews={product?.review_count ?? 0}
            />
            <div
              className="short-description"
              dangerouslySetInnerHTML={{
                __html:
                  product.short_description ||
                  product.description ||
                  "<p>Aucune introduction disponible.</p>",
              }}
            />

            <div className="price-action-card">
              <h3 className="price-text">
                {product.prices?.price
                  ? `${(parseFloat(product.prices.price) / 100).toFixed(2)} ${product.prices.currency_code || "EUR"}`
                  : "Prix non disponible"}
              </h3>

              <div className="actions-row">
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
                {checkInStock(product) ? (
                  <button className="addToCart" onClick={handleAddToCart}>
                    🧺 Ajouter au panier
                  </button>
                ) : (
                  <button className="addToCart" disabled>
                    Rupture de stock
                  </button>
                )}
                <WishlistButton product={product} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
