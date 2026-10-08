import "./index.scss";
import { useState } from "react";
import { getProductSpecs } from "../../utils/productHelpers";
import { sanitizeHtml } from "../../utils/sanitizeHtml";

function VehiclesPanel({ vehicles }) {
  const [query, setQuery] = useState("");
  const search = query.trim().toLowerCase();
  const filtered = vehicles.filter((vehicle) =>
    `${vehicle.brand} ${vehicle.model} ${vehicle.engines.join(" ")}`
      .toLowerCase()
      .includes(search),
  );

  if (vehicles.length === 0) {
    return (
      <p className="product-tabs-empty">
        Aucun véhicule renseigné pour cette pièce. Appelez le comptoir pour vérifier la
        compatibilité avec votre véhicule.
      </p>
    );
  }

  return (
    <>
      <div className="product-tabs-toolbar">
        <span>Liste des véhicules sur lesquels cette pièce se monte.</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filtrer un modèle (ex : Clio IV…)"
          aria-label="Filtrer les véhicules compatibles"
          maxLength={60}
          className="product-tabs-search"
        />
      </div>
      {filtered.length === 0 ? (
        <p className="product-tabs-empty">Aucun véhicule ne correspond à « {query} ».</p>
      ) : (
        <div className="product-tabs-vehicles">
          {filtered.map((vehicle) => (
            <div key={`${vehicle.brand}-${vehicle.model}`} className="product-tabs-vehicle">
              <span className="product-tabs-vehicle-name">
                {vehicle.brand} {vehicle.model}
              </span>
              {vehicle.engines.length > 0 ? (
                <ul className="product-tabs-engines">
                  {vehicle.engines.map((engine) => (
                    <li key={engine}>{engine}</li>
                  ))}
                </ul>
              ) : (
                <span className="product-tabs-engines-all">Toutes motorisations</span>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function SpecsPanel({ product }) {
  const specs = getProductSpecs(product);
  if (product.formatted_weight) specs.push({ name: "Poids", value: product.formatted_weight });
  if (product.formatted_dimensions && product.formatted_dimensions !== "N/A") {
    specs.push({ name: "Dimensions colis", value: product.formatted_dimensions });
  }
  if (product.sku) specs.unshift({ name: "Référence", value: product.sku });

  return (
    <table className="product-tabs-specs">
      <tbody>
        {specs.map((spec) => (
          <tr key={spec.name}>
            <th scope="row">{spec.name}</th>
            <td>{spec.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function ProductTabs({ product }) {
  const vehicles = product.npa?.vehicles || [];
  const vehicleCount = vehicles.reduce(
    (total, vehicle) => total + Math.max(vehicle.engines.length, 1),
    0,
  );
  const tabs = [
    { id: "vehicles", label: "Véhicules compatibles", badge: vehicleCount || null },
    { id: "specs", label: "Caractéristiques techniques" },
  ];
  if (product.description) tabs.push({ id: "description", label: "Description & montage" });

  const [activeTab, setActiveTab] = useState("vehicles");

  return (
    <section className="product-tabs">
      <div className="product-tabs-list" role="tablist" aria-label="Informations du produit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            className={`product-tabs-tab ${activeTab === tab.id ? "is-active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.badge && <span className="product-tabs-badge">{tab.badge}</span>}
          </button>
        ))}
      </div>

      <div
        className="product-tabs-panel"
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
      >
        {activeTab === "vehicles" && <VehiclesPanel vehicles={vehicles} />}
        {activeTab === "specs" && <SpecsPanel product={product} />}
        {activeTab === "description" && (
          // Description rédigée dans l'admin WordPress
          <div
            className="product-tabs-description"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.description) }}
          />
        )}
      </div>
    </section>
  );
}
