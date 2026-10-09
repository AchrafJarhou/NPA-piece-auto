import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Loader from "../Loader";
import "./index.scss";
import active from "./review-active.svg";
import inactive from "./review-inactive.svg";
import { sanitizeHtml } from "../../utils/sanitizeHtml";
import { apiFetch } from "../../utils/apiFetch";

const Review = ({ productId }) => {
  const userState = useSelector((state) => state.user || {});

  // Client connecté (cookie) : c'est WordPress qui vérifie l'achat, pas le navigateur
  const user = userState.isAuthenticated ? userState.profile || {} : null;
  const csrf = userState.csrf;

  // États pour les avis
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // États pour la pagination
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // États pour l'achat et le formulaire
  const [hasPurchased, setHasPurchased] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const baseUrl = import.meta.env.VITE_API_URL;

  // --- Chargement des avis ---
  const fetchReviews = () => {
    if (!productId) return;
    setLoading(true);

    fetch(
      `${baseUrl}/wp-json/wc/store/v1/products/reviews?product_id=${productId}&per_page=5&page=${currentPage}`,
    )
      .then((response) => {
        if (!response.ok) throw new Error("Erreur réseau");

        // WooCommerce renvoie le total des pages dans les headers
        const totalPagesHeader = response.headers.get("X-WP-TotalPages");
        if (totalPagesHeader) {
          setTotalPages(parseInt(totalPagesHeader, 10));
        }

        return response.json();
      })
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };
  // 1. Relance le fetch à chaque fois que le produit OU la page change
  useEffect(() => {
    fetchReviews();
  }, [productId, currentPage]);

  // 2. Remet la page à 1 uniquement si on change de produit
  useEffect(() => {
    setCurrentPage(1);
  }, [productId]);

  // --- Le client peut-il noter ce produit ? (achat vérifié par WordPress, mu-plugins/reviews.php) ---
  const isLoggedIn = Boolean(user);
  useEffect(() => {
    if (!isLoggedIn || !productId) {
      setHasPurchased(false);
      setAlreadyReviewed(false);
      return;
    }

    let cancelled = false;
    setCheckingPurchase(true);
    apiFetch(`${baseUrl}/wp-json/custom/v1/reviews/eligibility?product_id=${productId}`)
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data) => {
        if (cancelled) return;
        setHasPurchased(Boolean(data.bought));
        setAlreadyReviewed(Boolean(data.already_reviewed));
      })
      .catch(() => {
        if (!cancelled) setHasPurchased(false);
      })
      .finally(() => {
        if (!cancelled) setCheckingPurchase(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, productId, baseUrl]);

  // --- Soumission d'un avis ---
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim() || !rating) return;

    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      // Le nom et l'e-mail sont ceux du compte, ajoutés par WordPress
      const response = await apiFetch(`${baseUrl}/wp-json/custom/v1/reviews`, {
        method: "POST",
        csrf,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          review: comment,
          rating: rating,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Erreur lors de l'envoi de l'avis");
      }

      // L'avis est en attente de validation par le comptoir : il n'apparaît pas encore
      setSubmitSuccess(true);
      setAlreadyReviewed(true);
      setComment("");
      setRating(0);
    } catch (err) {
      setSubmitError(err.message || "Erreur lors de la publication.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating = 0) => {
    const normalizedRating = Math.max(0, Math.min(Number(rating) || 0, 5));
    const fullStars = Math.round(normalizedRating);

    return [1, 2, 3, 4, 5].map((star) => (
      <img
        key={star}
        className="review-star-icon"
        src={star <= fullStars ? active : inactive}
        alt="avis"
      />
    ));
  };

  // --- Calculs pour la pagination ---

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  const getPaginationRange = (current, total) => {
    const delta = 1; // Nombre de pages affichées autour de la page active
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= total; i++) {
      if (
        i === 1 ||
        i === total ||
        (i >= current - delta && i <= current + delta)
      ) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };
  return (
    <div id="reviews-section" className="review-list">
      <h2 className="review-title">Avis clients</h2>

      {/* --- BLOC NOUVEL AVIS --- */}
      <div className="add-review-section">
        {!user ? (
          <p className="review-info">Connectez-vous pour ajouter un avis.</p>
        ) : checkingPurchase ? (
          <p className="review-info">Vérification de vos achats...</p>
        ) : submitSuccess ? (
          <p className="review-info">
            Merci ! Votre avis sera publié après validation par notre comptoir.
          </p>
        ) : alreadyReviewed ? (
          <p className="review-info">
            Vous avez déjà donné votre avis sur ce produit. Il apparaît après validation par
            notre comptoir.
          </p>
        ) : hasPurchased ? (
          <form onSubmit={handleSubmitReview} className="review-form">
            <h3 className="review-form-title">Rédiger un avis</h3>

            {submitError && <p className="review-error">{submitError}</p>}

            <div>
              <div className="review-rating">
                <label>Note : </label>

                {[1, 2, 3, 4, 5].map((star) => (
                  <img
                    type="button"
                    className="review-star-button"
                    key={star}
                    onClick={() => setRating(star)}
                    aria-label={`Choisir ${star} étoiles`}
                    src={star <= rating ? active : inactive}
                    alt="avis"
                  />
                ))}
              </div>
              {!rating && (
                <p className="review-helper-text">
                  Choisissez une note de 1 à 5.
                </p>
              )}
            </div>

            <div>
              <textarea
                rows="3"
                className="review-textarea"
                placeholder="Votre avis sur ce produit..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Envoi..." : "Publier l'avis"}
            </button>
          </form>
        ) : (
          <p className="review-info">
            Seuls les clients ayant acheté cet article peuvent laisser un
            avis.
          </p>
        )}
      </div>

      {/* --- LISTE DES AVIS --- */}
      {/* {loading && <Loader size="lg" />} */}
      {error && <p className="review-error">Erreur : {error}</p>}
      {!loading && !error && reviews.length === 0 && (
        <p className="review-empty">Aucun avis pour le moment.</p>
      )}
      <div className="reviews-block">
        {reviews.map((review) => (
          <article key={review.id || review.review_id} className="review-item">
            <div className="review-stars">{renderStars(review.rating)}</div>
            <div className="review-meta">
              <strong>
                {review.reviewer ?? "Anonyme"}
                {" - "}
              </strong>
              <span>
                {review.date_created
                  ? new Date(review.date_created).toLocaleDateString("fr-FR")
                  : ""}
              </span>
            </div>
            <div
              className="review-content"
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(review.review),
              }}
            />
          </article>
        ))}
      </div>
      {/* --- BARRE DE PAGINATION --- */}
      {totalPages > 1 && (
        <div className="review-pagination">
          {currentPage > 1 ? (
            <a
              className="pageChange"
              href="#reviews-section"
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(currentPage - 1);
              }}
            >
              Précédent
            </a>
          ) : (
            <a className="pageChange inactive">Précédent</a>
          )}

          {getPaginationRange(currentPage, totalPages).map((page, index) => {
            // Affichage des points de suspension
            if (page === "...") {
              return (
                <span key={`dots-${index}`} className="pagination-dots">
                  ...
                </span>
              );
            }

            // Affichage des numéros de page
            return (
              <a
                key={page}
                href="#reviews-section"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(page);
                }}
                className={currentPage === page ? "active" : ""}
              >
                {page}
              </a>
            );
          })}

          {currentPage < totalPages ? (
            <a
              className="pageChange"
              href="#reviews-section"
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(currentPage + 1);
              }}
            >
              Suivant
            </a>
          ) : (
            <a className="pageChange inactive">Suivant</a>
          )}
        </div>
      )}
    </div>
  );
};

export default Review;
