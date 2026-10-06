import "./index.scss";
import { useEffect, useState } from "react";
import { stripHtml } from "../../utils/stripHtml";

// Galerie de la fiche produit : image principale (images[0]) + images de la galerie WooCommerce
export default function ProductGallery({ product }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const images = product.images || [];
  const name = stripHtml(product.name);
  const badges = (product.tags || []).slice(0, 2).map((tag) => stripHtml(tag.name));
  const active = images[activeIndex];

  useEffect(() => {
    setActiveIndex(0);
  }, [product.id]);

  const showPrevious = () =>
    setActiveIndex((activeIndex - 1 + images.length) % images.length);
  const showNext = () => setActiveIndex((activeIndex + 1) % images.length);

  // Flèches gauche / droite du clavier sur l'image principale
  const handleKeyDown = (e) => {
    if (images.length < 2) return;
    if (e.key === "ArrowLeft") showPrevious();
    if (e.key === "ArrowRight") showNext();
  };

  let stockBadge = { label: "En stock", className: "is-in-stock" };
  if (product.is_on_backorder) stockBadge = { label: "Sur commande", className: "is-backorder" };
  else if (!product.is_in_stock) stockBadge = { label: "Rupture de stock", className: "is-out-of-stock" };

  return (
    <div className="product-gallery">
      <div
        className="product-gallery-main"
        tabIndex={images.length > 1 ? 0 : -1}
        onKeyDown={handleKeyDown}
        aria-label={images.length > 1 ? "Photos du produit, flèches pour changer" : undefined}
      >
        {active ? (
          <img
            src={active.src}
            srcSet={active.srcset || undefined}
            sizes="(max-width: 1024px) 100vw, 720px"
            alt={active.alt || name}
            className="product-gallery-image"
          />
        ) : (
          <span className="product-gallery-placeholder">Photo à venir</span>
        )}

        {badges.length > 0 && (
          <div className="product-gallery-badges">
            {badges.map((badge, index) => (
              <span
                key={badge}
                className={`product-gallery-badge ${index === 0 ? "is-dark" : ""}`}
              >
                {badge}
              </span>
            ))}
          </div>
        )}

        <span className={`product-gallery-stock ${stockBadge.className}`}>
          {stockBadge.label}
        </span>

        {images.length > 1 && (
          <>
            <button
              type="button"
              className="product-gallery-arrow is-previous"
              onClick={showPrevious}
              aria-label="Photo précédente"
            >
              ‹
            </button>
            <button
              type="button"
              className="product-gallery-arrow is-next"
              onClick={showNext}
              aria-label="Photo suivante"
            >
              ›
            </button>
            <span className="product-gallery-counter">
              {activeIndex + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="product-gallery-thumbnails">
          {images.map((image, index) => (
            <button
              key={image.id || index}
              type="button"
              className={`product-gallery-thumbnail ${index === activeIndex ? "is-active" : ""}`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Afficher la photo ${index + 1}`}
              aria-current={index === activeIndex ? "true" : undefined}
            >
              <img src={image.thumbnail || image.src} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
