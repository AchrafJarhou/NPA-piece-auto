import "./index.scss";
import { site } from "../../config/site";
import storeIcon from "../../assets/icons/store.svg";
import truckIcon from "../../assets/icons/truck.svg";
import shieldIcon from "../../assets/icons/shield.svg";
import phoneIcon from "../../assets/icons/phone.svg";

const items = [
  {
    title: "Retrait 2h Capelette",
    text: "Comptoir 158 Av. Capelette, gratuit",
    icon: storeIcon,
    highlight: true,
  },
  {
    title: "Livraison 24/48h",
    text: "Garages & particuliers sur toute la région",
    icon: truckIcon,
  },
  {
    title: "100% neuves OEM",
    text: "Qualité première monte certifiée",
    icon: shieldIcon,
  },
  {
    title: "Conseils experts",
    text: `Support marseillais au ${site.phone}`,
    icon: phoneIcon,
  },
];

export default function Reassurance() {
  return (
    <section className="reassurance" aria-label="Nos engagements">
      <div className="reassurance-grid">
        {items.map((item) => (
          <div key={item.title} className="reassurance-card">
            <span
              className={`reassurance-icon ${
                item.highlight ? "reassurance-icon-highlight" : ""
              }`}
            >
              <img src={item.icon} alt="" />
            </span>
            <div className="reassurance-content">
              <span className="reassurance-title">{item.title}</span>
              <span className="reassurance-text">{item.text}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
