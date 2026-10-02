import "./index.scss";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setFilters } from "../../slices/filtersSlice";
import { site } from "../../config/site";

const emptyForm = { brand: "", model: "", engine: "", reference: "" };

export default function VehicleSearch() {
  const [form, setForm] = useState(emptyForm);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // La référence est prioritaire, sinon on cherche avec les infos du véhicule
  const handleSubmit = (e) => {
    e.preventDefault();
    const search =
      form.reference.trim() ||
      [form.brand, form.model, form.engine]
        .map((value) => value.trim())
        .filter(Boolean)
        .join(" ");
    dispatch(setFilters({ search, category: "" }));
    navigate("/catalogue");
  };

  return (
    <form className="vehicle-search" onSubmit={handleSubmit}>
      <div className="vehicle-search-header">
        <h2 className="vehicle-search-title">
          Identifiez votre véhicule &amp; vos pièces
        </h2>
        <span className="vehicle-search-guarantee">
          Garantie compatibilité 100%
        </span>
      </div>

      <fieldset className="vehicle-search-step vehicle-search-vehicle">
        <legend className="vehicle-search-label">
          Étape 1 : choisissez votre véhicule
        </legend>
        <div className="vehicle-search-fields">
          <input
            name="brand"
            value={form.brand}
            onChange={handleChange}
            placeholder="1. Marque (ex: Renault)"
            aria-label="Marque"
            className="vehicle-search-input"
          />
          <input
            name="model"
            value={form.model}
            onChange={handleChange}
            placeholder="2. Modèle"
            aria-label="Modèle"
            className="vehicle-search-input"
          />
          <input
            name="engine"
            value={form.engine}
            onChange={handleChange}
            placeholder="3. Motorisation / Année"
            aria-label="Motorisation ou année"
            className="vehicle-search-input"
          />
        </div>
      </fieldset>

      <div className="vehicle-search-step">
        <div className="vehicle-search-reference-header">
          <label htmlFor="vehicle-search-reference" className="vehicle-search-label">
            Étape 2 : référence d'origine constructeur OEM ou mot-clé
          </label>
          <span className="vehicle-search-example">
            Ex: 7701208422, 1611837880, Plaquettes Clio 4
          </span>
        </div>
        <div className="vehicle-search-reference">
          <input
            id="vehicle-search-reference"
            name="reference"
            value={form.reference}
            onChange={handleChange}
            placeholder="Référence OEM, code article équipementier…"
            className="vehicle-search-input vehicle-search-input-reference"
          />
          <button type="submit" className="btn btn-primary vehicle-search-submit">
            Trouver mes pièces compatibles
          </button>
        </div>
      </div>

      <p className="vehicle-search-tip">
        Astuce : Vous n'avez pas la référence OEM ? Nos techniciens l'identifient
        par téléphone en 30 secondes.{" "}
        <a href={site.phoneHref} className="vehicle-search-phone">
          {site.phone}
        </a>
      </p>
    </form>
  );
}
