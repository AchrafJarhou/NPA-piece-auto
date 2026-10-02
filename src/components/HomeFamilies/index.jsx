import "./index.scss";
import useOpenCategory from "../../hooks/useOpenCategory";
import brakeIcon from "../../assets/icons/brake.svg";
import filterIcon from "../../assets/icons/filter.svg";
import beltIcon from "../../assets/icons/belt.svg";
import clutchIcon from "../../assets/icons/clutch.svg";
import springIcon from "../../assets/icons/spring.svg";
import oilIcon from "../../assets/icons/oil.svg";

// slug : identifiant de la catégorie WooCommerce correspondante
const families = [
  { title: "Freinage", text: "Disques, Plaquettes", slug: "freinage", icon: brakeIcon },
  { title: "Filtration", text: "Huile, Air, Gazole", slug: "filtration", icon: filterIcon },
  { title: "Distribution", text: "Kits & Pompes à eau", slug: "distribution", icon: beltIcon },
  { title: "Embrayage", text: "Kits & Volants bimasse", slug: "embrayage", icon: clutchIcon },
  { title: "Suspension", text: "Amortisseurs & Bras", slug: "suspension", icon: springIcon },
  { title: "Huiles & fluides", text: "5W30, 0W20, DOT", slug: "huiles", icon: oilIcon },
];

export default function HomeFamilies() {
  const openCategory = useOpenCategory();

  return (
    <section className="home-families">
      <div className="home-families-inner">
        <div className="home-families-header">
          <div className="home-families-heading">
            <span className="home-families-eyebrow">Catalogue express</span>
            <h2 className="home-families-title">Les grandes familles en stock</h2>
          </div>
          <p className="home-families-text">
            Références de première monte certifiées disponibles immédiatement au
            comptoir ou en livraison rapide.
          </p>
        </div>

        <div className="home-families-grid">
          {families.map((family) => (
            <button
              key={family.slug}
              type="button"
              className="home-family"
              onClick={() => openCategory(family.slug)}
            >
              <span className="home-family-icon">
                <img src={family.icon} alt="" />
              </span>
              <span className="home-family-title">{family.title}</span>
              <span className="home-family-text">{family.text}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
