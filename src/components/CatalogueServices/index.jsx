import "./index.scss";
import returnIcon from "../../assets/icons/return.svg";
import shieldIcon from "../../assets/icons/shield.svg";
import clockIcon from "../../assets/icons/clock.svg";

const services = [
  {
    title: "Retour & échange 30j",
    text: "Erreur de référence ou mauvaise commande ? Rapportez la pièce intacte à notre comptoir Capelette pour un avoir ou remboursement immédiat.",
    icon: returnIcon,
    highlight: true,
  },
  {
    title: "Garantie fabricant",
    text: "Toutes nos pièces répondent strictement au cahier des charges d'origine des constructeurs automobiles.",
    icon: shieldIcon,
  },
  {
    title: "Enlèvement 2h gratuit",
    text: "Retirez votre commande directement au guichet pro ou particulier sans file d'attente dès réception du SMS.",
    icon: clockIcon,
  },
];

export default function CatalogueServices() {
  return (
    <div className="catalogue-services">
      {services.map((service) => (
        <div key={service.title} className="catalogue-service">
          <span
            className={`catalogue-service-icon ${
              service.highlight ? "catalogue-service-icon-highlight" : ""
            }`}
          >
            <img src={service.icon} alt="" />
          </span>
          <div className="catalogue-service-content">
            <span className="catalogue-service-title">{service.title}</span>
            <span className="catalogue-service-text">{service.text}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
