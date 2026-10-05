import "./index.scss";
import { site } from "../../config/site";
import shieldIcon from "../../assets/icons/shield.svg";
import storeIcon from "../../assets/icons/store.svg";
import truckIcon from "../../assets/icons/truck.svg";
import phoneIcon from "../../assets/icons/phone.svg";

const items = [
  { title: "100% pièces neuves", text: "Garantie constructeur certifiée OEM", icon: shieldIcon },
  {
    title: "Retrait express 2h",
    text: `Comptoir ${site.address.street}`,
    icon: storeIcon,
    highlight: true,
  },
  { title: "Livraison pro PACA", text: "Navettes express quotidiennes garages", icon: truckIcon },
  { title: "Support technique", text: "Conseillers experts auto à Marseille", icon: phoneIcon },
];

// Bandeau sombre des engagements, affiché en bas des pages boutique
export default function ReassuranceBand() {
  return (
    <section className="reassurance-band" aria-label="Nos engagements">
      <div className="reassurance-band-grid">
        {items.map((item) => (
          <div key={item.title} className="reassurance-band-item">
            <span
              className={`reassurance-band-icon ${
                item.highlight ? "reassurance-band-icon-highlight" : ""
              }`}
            >
              <img src={item.icon} alt="" />
            </span>
            <div className="reassurance-band-content">
              <span className="reassurance-band-title">{item.title}</span>
              <span className="reassurance-band-text">{item.text}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
