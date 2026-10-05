import "./index.scss";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setFilters,
  toggleBrand,
  toggleAttribute,
  resetSidebarFilters,
} from "../../slices/filtersSlice";
import { site } from "../../config/site";
import { stripHtml } from "../../utils/stripHtml";

function FilterGroup({ title, aside, children }) {
  return (
    <div className="catalogue-filter">
      <div className="catalogue-filter-header">
        <span className="catalogue-filter-title">{title}</span>
        {aside && <span className="catalogue-filter-aside">{aside}</span>}
      </div>
      {children}
    </div>
  );
}

function FilterCheckbox({ checked, onChange, label, description, count }) {
  return (
    <label className={`catalogue-checkbox ${checked ? "is-checked" : ""}`}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="catalogue-checkbox-box" aria-hidden="true" />
      <span className="catalogue-checkbox-text">
        <span className="catalogue-checkbox-label">{label}</span>
        {description && (
          <span className="catalogue-checkbox-description">{description}</span>
        )}
      </span>
      {count !== undefined && (
        <span className="catalogue-checkbox-count">{count}</span>
      )}
    </label>
  );
}

// Double curseur min / max, appliqué quand on relâche le curseur
function BudgetFilter({ range, minPrice, maxPrice, onApply }) {
  const [values, setValues] = useState([range.min, range.max]);

  useEffect(() => {
    setValues([
      minPrice !== "" ? Number(minPrice) : range.min,
      maxPrice !== "" ? Number(maxPrice) : range.max,
    ]);
  }, [minPrice, maxPrice, range.min, range.max]);

  const span = Math.max(range.max - range.min, 1);
  const left = ((values[0] - range.min) / span) * 100;
  const right = 100 - ((values[1] - range.min) / span) * 100;

  const commit = () => onApply(values[0], values[1]);

  return (
    <FilterGroup title="Budget pièce (TTC)" aside={`${values[0]} € – ${values[1]} €`}>
      <div className="catalogue-budget">
        <div className="catalogue-budget-track">
          <span
            className="catalogue-budget-selection"
            style={{ left: `${left}%`, right: `${right}%` }}
          />
        </div>
        <input
          type="range"
          min={range.min}
          max={range.max}
          value={values[0]}
          onChange={(e) =>
            setValues([Math.min(Number(e.target.value), values[1]), values[1]])
          }
          onPointerUp={commit}
          onKeyUp={commit}
          aria-label="Prix minimum"
        />
        <input
          type="range"
          min={range.min}
          max={range.max}
          value={values[1]}
          onChange={(e) =>
            setValues([values[0], Math.max(Number(e.target.value), values[0])])
          }
          onPointerUp={commit}
          onKeyUp={commit}
          aria-label="Prix maximum"
        />
      </div>
      <div className="catalogue-budget-limits">
        <span>Min : {range.min} €</span>
        <span>Max : {range.max} €</span>
      </div>
    </FilterGroup>
  );
}

export default function CatalogueFilters() {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const filters = useSelector((state) => state.filters);
  const { brands, attributes, termCounts, brandCounts, inStockCount, priceRange } =
    useSelector((state) => state.catalogue);

  // On n'affiche que les valeurs présentes dans la sélection actuelle (ou cochées)
  const visibleBrands = brands.filter(
    (brand) => brandCounts[brand.id] > 0 || filters.brands.includes(brand.slug),
  );
  const visibleAttributes = attributes
    .map((attribute) => ({
      ...attribute,
      terms: attribute.terms.filter(
        (term) =>
          termCounts[term.id] > 0 ||
          filters.attributes[attribute.taxonomy]?.includes(term.slug),
      ),
    }))
    .filter((attribute) => attribute.terms.length > 0);

  // Filtres actifs, affichés en étiquettes cliquables pour les retirer
  const activeFilters = [];
  if (filters.stock_status === "instock") {
    activeFilters.push({
      label: "En stock comptoir",
      remove: () => dispatch(setFilters({ stock_status: "" })),
    });
  }
  if (filters.min_price !== "" || filters.max_price !== "") {
    activeFilters.push({
      label: `${filters.min_price || priceRange?.min || 0} € – ${
        filters.max_price || priceRange?.max || "…"
      } €`,
      remove: () => dispatch(setFilters({ min_price: "", max_price: "" })),
    });
  }
  filters.brands.forEach((slug) => {
    const brand = brands.find((item) => item.slug === slug);
    activeFilters.push({
      label: stripHtml(brand?.name) || slug,
      remove: () => dispatch(toggleBrand(slug)),
    });
  });
  Object.entries(filters.attributes).forEach(([taxonomy, slugs]) => {
    const attribute = attributes.find((item) => item.taxonomy === taxonomy);
    slugs.forEach((slug) => {
      const term = attribute?.terms.find((item) => item.slug === slug);
      activeFilters.push({
        label: stripHtml(term?.name) || slug,
        remove: () => dispatch(toggleAttribute({ taxonomy, slug })),
      });
    });
  });

  const applyBudget = (min, max) => {
    dispatch(
      setFilters({
        min_price: min > priceRange.min ? min : "",
        max_price: max < priceRange.max ? max : "",
      }),
    );
  };

  return (
    <aside className="catalogue-filters">
      <button
        type="button"
        className="catalogue-filters-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="catalogue-filters-panel"
      >
        {isOpen ? "Masquer les filtres" : "Afficher les filtres"}
        {activeFilters.length > 0 && ` (${activeFilters.length})`}
      </button>

      <div
        id="catalogue-filters-panel"
        className={`catalogue-filters-panel ${isOpen ? "is-open" : ""}`}
      >
        {activeFilters.length > 0 && (
          <FilterGroup
            title="Filtres actifs"
            aside={
              <button
                type="button"
                className="catalogue-filters-reset"
                onClick={() => dispatch(resetSidebarFilters())}
              >
                Réinitialiser ({activeFilters.length})
              </button>
            }
          >
            <div className="catalogue-chips">
              {activeFilters.map((filter, index) => (
                <button
                  key={`${index}-${filter.label}`}
                  type="button"
                  className="catalogue-chip"
                  onClick={filter.remove}
                  aria-label={`Retirer le filtre ${filter.label}`}
                >
                  {filter.label} ✕
                </button>
              ))}
            </div>
          </FilterGroup>
        )}

        <FilterGroup title="Disponibilité express">
          <FilterCheckbox
            checked={filters.stock_status === "instock"}
            onChange={() =>
              dispatch(
                setFilters({
                  stock_status: filters.stock_status === "instock" ? "" : "instock",
                }),
              )
            }
            label="En stock Comptoir Capelette"
            description={`Prêt en 2h (${site.address.street}, ${site.address.zip})`}
            count={inStockCount}
          />
        </FilterGroup>

        {visibleBrands.length > 0 && (
          <FilterGroup
            title="Équipementiers OEM"
            aside={`${visibleBrands.length} marque${visibleBrands.length > 1 ? "s" : ""}`}
          >
            {visibleBrands.map((brand) => (
              <FilterCheckbox
                key={brand.id}
                checked={filters.brands.includes(brand.slug)}
                onChange={() => dispatch(toggleBrand(brand.slug))}
                label={stripHtml(brand.name)}
                count={brandCounts[brand.id] || 0}
              />
            ))}
          </FilterGroup>
        )}

        {priceRange && priceRange.max > priceRange.min && (
          <BudgetFilter
            range={priceRange}
            minPrice={filters.min_price}
            maxPrice={filters.max_price}
            onApply={applyBudget}
          />
        )}

        {visibleAttributes.map((attribute) => (
          <FilterGroup key={attribute.id} title={attribute.name}>
            {attribute.terms.map((term) => (
              <FilterCheckbox
                key={term.id}
                checked={
                  filters.attributes[attribute.taxonomy]?.includes(term.slug) || false
                }
                onChange={() =>
                  dispatch(
                    toggleAttribute({ taxonomy: attribute.taxonomy, slug: term.slug }),
                  )
                }
                label={stripHtml(term.name)}
                count={termCounts[term.id] || 0}
              />
            ))}
          </FilterGroup>
        ))}

        <div className="catalogue-help">
          <span className="catalogue-help-title">Un doute sur une pièce ?</span>
          <span className="catalogue-help-text">
            Nos magasiniers vérifient gratuitement la compatibilité avec votre
            carte grise (champ E ou D.2).
          </span>
          <a href={site.phoneHref} className="btn btn-primary catalogue-help-phone">
            {site.phone}
          </a>
        </div>
      </div>
    </aside>
  );
}
