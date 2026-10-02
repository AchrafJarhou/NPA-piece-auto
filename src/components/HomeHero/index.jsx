import "./index.scss";
import VehicleSearch from "../VehicleSearch";

const features = ["Dispo en 2h", "100% neuves OEM", "Conseil d'atelier"];

export default function HomeHero() {
  return (
    <section className="home-hero">
      <div className="home-hero-inner">
        <div className="home-hero-content">
          <span className="home-hero-badge">
            Comptoir stock permanent • 13010 Marseille
          </span>
          <h1 className="home-hero-title">
            Vos pièces auto au meilleur prix immédiatement
          </h1>
          <p className="home-hero-text">
            Plus de 150 000 références neuves certifiées constructeur en stock
            ou disponibles sous 2h à notre comptoir de La Capelette. Commandez
            en ligne, retirez sur place ou faites-vous livrer sur Marseille
            &amp; alentours.
          </p>
          <ul className="home-hero-features">
            {features.map((feature) => (
              <li key={feature} className="home-hero-feature">
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <VehicleSearch />
      </div>
    </section>
  );
}
