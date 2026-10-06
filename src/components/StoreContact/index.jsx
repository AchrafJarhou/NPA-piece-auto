import "./index.scss";
import { site } from "../../config/site";
import storeIcon from "../../assets/icons/store.svg";

// Encart "Votre magasin physique" affiché en bas de la fiche produit
export default function StoreContact() {
  return (
    <section className="store-contact">
      <div className="store-contact-content">
        <span className="store-contact-icon">
          <img src={storeIcon} alt="" />
        </span>
        <div className="store-contact-text">
          <span className="store-contact-eyebrow">Votre magasin physique à {site.address.city}</span>
          <h2 className="store-contact-title">
            Comptoir {site.name} Capelette ({site.address.zip})
          </h2>
          <p className="store-contact-description">
            {site.address.street}. {site.product.storeText}
          </p>
        </div>
      </div>
      <div className="store-contact-actions">
        <a href={site.phoneHref} className="btn btn-light store-contact-call">
          Appeler le comptoir ({site.phone})
        </a>
        <a href={site.mapsHref} target="_blank" rel="noreferrer" className="btn btn-dark">
          Itinéraire GPS
        </a>
      </div>
    </section>
  );
}
