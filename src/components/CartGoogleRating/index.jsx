import "./index.scss";
import { site } from "../../config/site";

// Note Google du comptoir (texte statique de site.js en attendant les vrais avis)
export default function CartGoogleRating() {
  const { score, label, text } = site.googleRating;

  return (
    <div className="cart-google-rating">
      <div className="cart-google-rating-score">
        <span className="cart-google-rating-logo" aria-hidden="true">
          G
        </span>
        <span className="cart-google-rating-title">
          {score}
          <br />
          {label}
        </span>
      </div>
      <span className="cart-google-rating-text">{text}</span>
    </div>
  );
}
