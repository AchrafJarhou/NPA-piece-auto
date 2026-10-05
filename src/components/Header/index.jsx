import "./index.scss";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Autocomplete from "../Autocomplete";
import { logout } from "../../slices/userSlice";
import { openModal } from "../../slices/modalSlice";
import useOpenCategory from "../../hooks/useOpenCategory";
import { site } from "../../config/site";
import { headerCategories } from "./categories";
import logo from "../../assets/images/logo.png";
import { formatPrice } from "../../utils/formatPrice";

export default function Header() {
  const [isHidden, setIsHidden] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dispatch = useDispatch();
  const openCategory = useOpenCategory();
  const token = useSelector((state) => state.user.token);
  const cartItems = useSelector((state) => state.cart.items);
  const cartTotals = useSelector((state) => state.cart.totals);
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const cartCount = cartItems.reduce(
    (total, item) => total + (Number(item.quantity) || 0),
    0,
  );

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;
    const threshold = 10;
    const updateScroll = () => {
      const y = window.scrollY;
      setIsScrolled(y > 0);
      if (y <= 0) {
        setIsHidden(false);
        lastScrollY = 0;
        ticking = false;
        return;
      }
      const delta = y - lastScrollY;
      if (Math.abs(delta) > threshold) {
        setIsHidden(delta > 0);
        lastScrollY = y;
      }
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openLogin = () =>
    dispatch(openModal({ name: "auth", props: { view: "login" } }));

  return (
    <header
      className={`header ${isHidden ? "header-hidden" : ""} ${
        isScrolled ? "header-scrolled" : ""
      }`}
    >
      <div className="header-topbar">
        {site.topbar.map((message) => (
          <span key={message} className="header-topbar-item">
            {message}
          </span>
        ))}
        <span className="header-topbar-item header-topbar-highlight">
          {site.topbarHighlight}
        </span>
      </div>

      <div className="header-main">
        <Link to="/" className="header-brand" aria-label="Accueil">
          <img src={logo} alt={site.name} className="header-logo" />
          <span className="header-brand-text">
            <span className="header-brand-name">{site.name}</span>
            <span className="header-brand-tagline">{site.tagline}</span>
          </span>
        </Link>

        <div className="header-search">
          <Autocomplete placeholder="Rechercher une pièce, une référence…" />
          <Link to="/catalogue" className="header-search-button">
            Rechercher
          </Link>
        </div>

        <a href={site.phoneHref} className="header-info header-phone">
          <span className="header-info-label">Comptoir direct</span>
          <span className="header-info-value">{site.phone}</span>
        </a>

        <div className="header-info header-account">
          <span className="header-info-label">Espace client</span>
          {token ? (
            <span className="header-account-links">
              <Link to="/profile" className="header-info-value">
                Mon compte
              </Link>
              <button
                type="button"
                className="header-logout"
                onClick={() => dispatch(logout())}
              >
                Déconnexion
              </button>
            </span>
          ) : (
            <button
              type="button"
              className="header-info-value header-login"
              onClick={openLogin}
            >
              Compte pro / part.
            </button>
          )}
        </div>

        <Link
          to="/wishlist"
          className="header-wishlist"
          aria-label={`Favoris (${wishlistItems.length})`}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.8 4.5c2.1 0 3.6 1.1 5.2 3 1.6-1.9 3.1-3 5.2-3 3.8 0 5.9 3.9 4.4 7.3C19.5 16.4 12 21 12 21z" />
          </svg>
          {wishlistItems.length > 0 && (
            <span className="header-badge">
              {wishlistItems.length > 9 ? "9+" : wishlistItems.length}
            </span>
          )}
        </Link>

        <Link
          to="/panier"
          className="header-cart"
          aria-label={`Mon panier (${cartCount} article${cartCount > 1 ? "s" : ""})`}
        >
          <span className="header-cart-count">{cartCount} · Mon panier</span>
          <span className="header-cart-total">{formatPrice(cartTotals?.total_price, cartTotals?.currency_minor_unit)}</span>
        </Link>
      </div>

      <nav className="header-categories" aria-label="Catégories de pièces">
        {headerCategories.map((category) => (
          <button
            key={category.slug}
            type="button"
            className="header-category"
            onClick={() => openCategory(category.slug)}
          >
            <span className="header-category-icon">
              <img src={category.icon} alt="" />
            </span>
            <span className="header-category-label">{category.label}</span>
          </button>
        ))}
      </nav>
    </header>
  );
}
