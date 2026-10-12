import "./index.scss";

import { Link } from "react-router-dom";
import { site } from "../../config/site";
import logo from "../../assets/images/logo.png";

export default function Footer() {
  return (
    <>
      <footer className="footer">
        <div className="footer-grid">
          <div className="footer-col">
            <Link to="/" className="footer-brand">
              <img src={logo} alt={site.name} className="footer-logo" />
              <span className="footer-brand-name">{site.name}</span>
            </Link>
            <span className="footer-text">{site.description}</span>
            <div className="footer-contact">
              <span>
                {site.address.street}, {site.address.zip} {site.address.city}
              </span>
              <span>
                <a href={site.phoneHref}>{site.phone}</a> / WhatsApp :{" "}
                <a href={site.whatsappHref} target="_blank" rel="noreferrer">
                  {site.whatsapp}
                </a>
              </span>
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </div>
          </div>

          <div className="footer-col">
            <h2 className="footer-title">Accès &amp; horaires comptoir</h2>
            {site.hours.map((line) => (
              <span key={line} className="footer-hours">
                {line}
              </span>
            ))}
            <div className="footer-access">
              <span className="footer-access-title">Repère accès facile</span>
              <span className="footer-text">{site.accessNote}</span>
            </div>
          </div>

          <div className="footer-col">
            <h2 className="footer-title">Une question ?</h2>
            <Link to="/contact" className="footer-cta">
              Contactez-nous
            </Link>
          </div>
        </div>
      </footer>

      <div className="footer-bottom">
        <span className="footer-copyright">
          © {new Date().getFullYear()} {site.name}. Tous droits réservés.
        </span>
        <nav className="footer-legal" aria-label="Informations légales">
          <Link to="/mentions-legales">Mentions légales</Link>
          <Link to="/cgv">Conditions générales de vente</Link>
          <Link to="/cgu">Conditions générales d'utilisation</Link>
          <Link to="/faq">FAQ</Link>
        </nav>
      </div>
    </>
  );
}
