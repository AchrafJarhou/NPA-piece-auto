import "./index.scss";
import { getProductSpecs } from "../../utils/productHelpers";

// Les 4 premières caractéristiques du produit, en grandes tuiles sous la galerie
export default function ProductDimensions({ product }) {
  const specs = getProductSpecs(product).slice(0, 4);
  if (specs.length === 0) return null;

  return (
    <section className="product-dimensions" aria-label="Cotes principales">
      <div className="product-dimensions-header">
        <h2 className="product-dimensions-title">Cotes d'encombrement &amp; homologation</h2>
      </div>
      <dl className="product-dimensions-grid">
        {specs.map((spec) => (
          <div key={spec.name} className="product-dimensions-tile">
            <dt>{spec.name}</dt>
            <dd>{spec.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
