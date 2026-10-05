import "./index.scss";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setFilters } from "../../slices/filtersSlice";
import { fetchVehicleChildrenThunk } from "../../thunkActionsCreator/vehiclesThunks";
import { site } from "../../config/site";

// Liste déroulante remplie uniquement avec les véhicules créés dans WordPress
function VehicleSelect({ label, placeholder, options, value, onChange, disabled }) {
  return (
    <select
      className="vehicle-search-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      aria-label={label}
    >
      <option value="">{placeholder}</option>
      {(options || []).map((option) => (
        <option key={option.id} value={option.id}>
          {option.name}
        </option>
      ))}
    </select>
  );
}

export default function VehicleSearch() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const byParent = useSelector((state) => state.vehicles.byParent);
  const currentVehicle = useSelector((state) => state.filters.vehicle);

  // On repart du véhicule déjà choisi (bouton "Changer" du catalogue)
  const [brandId, setBrandId] = useState(currentVehicle?.brandId || "");
  const [modelId, setModelId] = useState(currentVehicle?.modelId || "");
  const [engineId, setEngineId] = useState(currentVehicle?.engineId || "");
  const [reference, setReference] = useState("");

  useEffect(() => {
    dispatch(fetchVehicleChildrenThunk(0));
  }, [dispatch]);
  useEffect(() => {
    if (brandId) dispatch(fetchVehicleChildrenThunk(brandId));
  }, [brandId, dispatch]);
  useEffect(() => {
    if (modelId) dispatch(fetchVehicleChildrenThunk(modelId));
  }, [modelId, dispatch]);

  const brands = byParent[0];
  const models = brandId ? byParent[brandId] : [];
  const engines = modelId ? byParent[modelId] : [];
  const findName = (list, id) => list?.find((item) => String(item.id) === String(id))?.name || "";

  const changeBrand = (id) => {
    setBrandId(id);
    setModelId("");
    setEngineId("");
  };
  const changeModel = (id) => {
    setModelId(id);
    setEngineId("");
  };

  const canSubmit = Boolean(brandId || reference.trim());

  // On filtre sur le niveau le plus précis choisi (motorisation > modèle > marque)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    const vehicleId = engineId || modelId || brandId;
    const vehicle = vehicleId
      ? {
          id: Number(vehicleId),
          brandId,
          modelId,
          engineId,
          brand: findName(brands, brandId),
          model: findName(models, modelId),
          engine: findName(engines, engineId),
        }
      : null;
    dispatch(
      setFilters({
        vehicle,
        search: reference.trim(),
        category: "",
        min_price: "",
        max_price: "",
        stock_status: "",
        brands: [],
        attributes: {},
      }),
    );
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
          <VehicleSelect
            label="Marque"
            placeholder={brands ? "1. Marque" : "Chargement…"}
            options={brands}
            value={brandId}
            onChange={changeBrand}
            disabled={!brands?.length}
          />
          <VehicleSelect
            label="Modèle"
            placeholder="2. Modèle"
            options={models}
            value={modelId}
            onChange={changeModel}
            disabled={!brandId || !models?.length}
          />
          <VehicleSelect
            label="Motorisation"
            placeholder="3. Motorisation"
            options={engines}
            value={engineId}
            onChange={setEngineId}
            disabled={!modelId || !engines?.length}
          />
        </div>
      </fieldset>

      <div className="vehicle-search-step">
        <div className="vehicle-search-reference-header">
          <label htmlFor="vehicle-search-reference" className="vehicle-search-label">
            Étape 2 : référence d'origine constructeur OEM ou mot-clé
          </label>
          <span className="vehicle-search-example">
            Ex: 7701208422, 1611837880, Plaquettes
          </span>
        </div>
        <div className="vehicle-search-reference">
          <input
            id="vehicle-search-reference"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Référence OEM, code article équipementier…"
            maxLength={80}
            className="vehicle-search-input vehicle-search-input-reference"
          />
          <button
            type="submit"
            className="btn btn-primary vehicle-search-submit"
            disabled={!canSubmit}
          >
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
