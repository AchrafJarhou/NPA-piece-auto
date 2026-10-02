// Catégories affichées dans la barre de navigation du header.
import freinage from "../../assets/icons/nav-freinage.svg";
import filtration from "../../assets/icons/nav-filtration.svg";
import distribution from "../../assets/icons/nav-distribution.svg";
import embrayage from "../../assets/icons/nav-embrayage.svg";
import suspension from "../../assets/icons/nav-suspension.svg";
import echappement from "../../assets/icons/nav-echappement.svg";
import eclairage from "../../assets/icons/nav-eclairage.svg";
import outillage from "../../assets/icons/nav-outillage.svg";

// slug : identifiant de la catégorie WooCommerce correspondante
export const headerCategories = [
  { label: "Freinage & étriers", slug: "freinage", icon: freinage },
  { label: "Filtration & vidange", slug: "filtration", icon: filtration },
  { label: "Distribution & moteur", slug: "distribution", icon: distribution },
  { label: "Embrayage & boîte", slug: "embrayage", icon: embrayage },
  { label: "Suspension & direction", slug: "suspension", icon: suspension },
  { label: "Échappement", slug: "echappement", icon: echappement },
  { label: "Éclairage & électrique", slug: "eclairage", icon: eclairage },
  { label: "Outillage & accessoires", slug: "outillage", icon: outillage },
];
