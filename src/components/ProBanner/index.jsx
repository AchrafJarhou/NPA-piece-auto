import "./index.scss";
import { site } from "../../config/site";
import proIcon from "../../assets/icons/pro.svg";

export default function ProBanner() {
  return (
    <section className="pro-banner">
      <div className="pro-banner-inner">
        <div className="pro-banner-content">
          <span className="pro-banner-icon">
            <img src={proIcon} alt="" />
          </span>
          <div className="pro-banner-text">
            <div className="pro-banner-heading">
              <h2 className="pro-banner-title">Espace pros &amp; garages PACA</h2>
              <span className="pro-banner-tag">Tarifs ateliers</span>
            </div>
            <span className="pro-banner-description">
              Navettes quotidiennes express, compte avec facturation mensuelle
              et remises directes.
            </span>
          </div>
        </div>

        <div className="pro-banner-actions">
          <a
            href={site.whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="btn btn-whatsapp"
          >
            WhatsApp Pro : {site.whatsapp}
          </a>
          <a href={site.phoneHref} className="btn btn-light">
            Ligne pro directe
          </a>
        </div>
      </div>
    </section>
  );
}
