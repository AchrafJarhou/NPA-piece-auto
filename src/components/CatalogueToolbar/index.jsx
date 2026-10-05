import "./index.scss";
import { useDispatch, useSelector } from "react-redux";
import { setFilters } from "../../slices/filtersSlice";

const sortOptions = [
  { value: "menu_order-asc", label: "Pertinence" },
  { value: "popularity-desc", label: "Meilleures ventes" },
  { value: "date-desc", label: "Nouveautés" },
  { value: "price-asc", label: "Prix croissant" },
  { value: "price-desc", label: "Prix décroissant" },
];

export default function CatalogueToolbar() {
  const dispatch = useDispatch();
  const { orderby, order } = useSelector((state) => state.filters);
  const total = useSelector((state) => state.products.list.total);
  const inStockCount = useSelector((state) => state.catalogue.inStockCount);

  const handleSortChange = (e) => {
    const [nextOrderby, nextOrder] = e.target.value.split("-");
    dispatch(setFilters({ orderby: nextOrderby, order: nextOrder }));
  };

  return (
    <div className="catalogue-toolbar">
      <div className="catalogue-toolbar-inner">
        <span className="catalogue-toolbar-count">
          <span className="catalogue-toolbar-number">{total}</span>
          <span className="catalogue-toolbar-label">
            Référence{total > 1 ? "s" : ""}
          </span>
        </span>
        {inStockCount > 0 && (
          <span className="catalogue-toolbar-stock">
            {inStockCount} référence{inStockCount > 1 ? "s" : ""} prête
            {inStockCount > 1 ? "s" : ""} à l'enlèvement comptoir
          </span>
        )}
        <label className="catalogue-toolbar-sort">
          Trier par :
          <select
            value={`${orderby}-${order}`}
            onChange={handleSortChange}
            className="catalogue-toolbar-select"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
