import "./index.scss";
import { site } from "../../config/site";
import storeIcon from "../../assets/icons/store.svg";

export default function StoreLocation() {
  return (
    <section className="store-location">
      <div className="store-location-inner">
        <div className="store-location-content">
          <span className="store-location-icon">
            <img src={storeIcon} alt="" />
          </span>
          <div className="store-location-text">
            <span className="store-location-eyebrow">
              Comptoir {site.address.zip} {site.address.city}
            </span>
            <h2 className="store-location-title">{site.address.street}</h2>
            <span className="store-location-hours">{site.hoursShort}</span>
          </div>
        </div>

        <div className="store-location-actions">
          <a
            href={site.mapsHref}
            target="_blank"
            rel="noreferrer"
            className="btn btn-dark"
          >
            Itinéraire GPS
          </a>
          <a href={site.phoneHref} className="btn btn-primary">
            {site.phone}
          </a>
        </div>
      </div>
    </section>
  );
}
