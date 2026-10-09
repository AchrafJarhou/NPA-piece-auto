import "./index.scss";
import { site } from "../../config/site";
import storeIcon from "../../assets/icons/store.svg";
import clockIcon from "../../assets/icons/clock.svg";
import phoneIcon from "../../assets/icons/phone.svg";

// Coordonnées du comptoir à côté du formulaire de contact (textes dans site.js)
export default function ContactInfo() {
  return (
    <aside className="contact-info">
      <div className="contact-info-block">
        <span className="contact-info-icon">
          <img src={storeIcon} alt="" />
        </span>
        <div className="contact-info-content">
          <span className="contact-info-eyebrow">Comptoir {site.address.city} Capelette</span>
          <span className="contact-info-title">{site.address.street}</span>
          <span className="contact-info-text">
            {site.address.zip} {site.address.city}
          </span>
          <span className="contact-info-text">{site.accessNote}</span>
        </div>
      </div>

      <div className="contact-info-block">
        <span className="contact-info-icon">
          <img src={clockIcon} alt="" />
        </span>
        <div className="contact-info-content">
          <span className="contact-info-eyebrow">Horaires du comptoir</span>
          <ul className="contact-info-hours">
            {site.hours.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="contact-info-block">
        <span className="contact-info-icon">
          <img src={phoneIcon} alt="" />
        </span>
        <div className="contact-info-content">
          <span className="contact-info-eyebrow">Une réponse immédiate</span>
          <a href={site.phoneHref} className="contact-info-title contact-info-link">
            {site.phone}
          </a>
          <a href={`mailto:${site.email}`} className="contact-info-text contact-info-link">
            {site.email}
          </a>
        </div>
      </div>

      <div className="contact-info-actions">
        <a href={site.phoneHref} className="btn btn-primary">
          Appeler le comptoir
        </a>
        <a href={site.whatsappHref} target="_blank" rel="noreferrer" className="btn btn-whatsapp">
          WhatsApp : {site.whatsapp}
        </a>
        <a href={site.mapsHref} target="_blank" rel="noreferrer" className="btn btn-dark">
          Itinéraire GPS
        </a>
      </div>
    </aside>
  );
}
