import "./index.scss";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setFilters } from "../../slices/filtersSlice";
import { categoryContent, defaultCatalogueIntro } from "../../config/categories";
import { stripHtml } from "../../utils/stripHtml";
import carIcon from "../../assets/icons/car.svg";

export default function CatalogueHero() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { category: categoryId, search, vehicle } = useSelector(
    (state) => state.filters,
  );
  const categories = useSelector((state) => state.categories.items);
  const category = categories.find((cat) => String(cat.id) === categoryId);
  const content = categoryContent[category?.slug] || {};

  let title = "Toutes nos pièces auto";
  if (category) title = stripHtml(category.name);
  else if (search) title = `Résultats pour « ${search} »`;

  const intro = stripHtml(category?.description) || defaultCatalogueIntro;
  const vehicleName = vehicle
    ? [vehicle.brand, vehicle.model, vehicle.engine].filter(Boolean).join(" ")
    : "";

  const clearVehicle = () => dispatch(setFilters({ vehicle: null }));

  return (
    <section className="catalogue-hero">
      <div className="catalogue-hero-inner">
        <div className="catalogue-hero-content">
          {(content.badge || content.label) && (
            <div className="catalogue-hero-tags">
              {content.badge && (
                <span className="catalogue-hero-badge">{content.badge}</span>
              )}
              {content.label && (
                <span className="catalogue-hero-label">{content.label}</span>
              )}
            </div>
          )}
          <h1 className="catalogue-hero-title">{title}</h1>
          <p className="catalogue-hero-text">{intro}</p>
        </div>

        {vehicle && (
          <div className="catalogue-vehicle">
            <span className="catalogue-vehicle-icon">
              <img src={carIcon} alt="" />
            </span>
            <div className="catalogue-vehicle-text">
              <span className="catalogue-vehicle-label">
                Véhicule compatible sélectionné
              </span>
              <span className="catalogue-vehicle-name">{vehicleName}</span>
              <span className="catalogue-vehicle-hint">
                Seules les pièces compatibles sont affichées
              </span>
            </div>
            <div className="catalogue-vehicle-actions">
              <button
                type="button"
                className="catalogue-vehicle-change"
                onClick={() => navigate("/")}
              >
                Changer
              </button>
              <button
                type="button"
                className="catalogue-vehicle-clear"
                onClick={clearVehicle}
              >
                Effacer
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
