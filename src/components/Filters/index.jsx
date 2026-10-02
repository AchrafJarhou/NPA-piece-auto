import "./index.scss";
import { useEffect, useState } from "react";
import { fetchCategoriesThunk } from "../../thunkActionsCreator/categoriesThunks";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductsThunk } from "../../thunkActionsCreator/productsThunks";
import { setFilters } from "../../slices/filtersSlice";
import PriceRangeSlider from "../PriceRangeSlider";
export default function Filters() {
  const dispatch = useDispatch();
  const { items: categories, loading: categoriesLoading } = useSelector(
    (state) => state.categories,
  );
  const { list, loading, error } = useSelector((state) => state.products);
  const filters = useSelector((state) => state.filters);
  const [isOpen, setIsOpen] = useState(false);

  const hasActiveFilters =
    filters.category ||
    filters.min_price ||
    filters.max_price ||
    filters.orderby !== "date" ||
    filters.order !== "desc";

  useEffect(() => {
    dispatch(fetchCategoriesThunk());
  }, [dispatch]);

  const handleCategoryChange = (e) => {
    dispatch(setFilters({ category: e.target.value, search: "" }));
    setIsOpen(false);
  };

  const handleSortChange = (e) => {
    const [orderby, order] = e.target.value.split("-");
    dispatch(setFilters({ orderby, order }));
    setIsOpen(false);
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    dispatch(setFilters({ [name]: value }));
  };

  const handleControlsBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsOpen(false);
    }
  };

  return (
    <div className="filters">
      <div className="margin"></div>
      <div className={`content${isOpen ? " open" : ""}`}>
        <button
          type="button"
          className={`filter-toggle${isOpen ? " active" : ""}`}
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-controls="filter-controls"
        >
          <svg viewBox="0 0 64 51" fill="none">
            <path d="M0 7.28571H64V0H0V7.28571Z" fill="currentColor" />
            <path d="M8 21.8571H56V14.5714H8V21.8571Z" fill="currentColor" />
            <path d="M16 36.4286H48V29.1429H16V36.4286Z" fill="currentColor" />
            <path d="M40 51H24V43.7143H40V51Z" fill="currentColor" />
          </svg>
          <span>Filtres</span>
          {hasActiveFilters && <span className="filter-toggle-dot"></span>}
        </button>
        <div
          id="filter-controls"
          className={`filter-controls${isOpen ? " open" : ""}`}
          inert={!isOpen ? "" : undefined}
          // inert={isOpen ? false : true}
          onBlur={handleControlsBlur}
        >
          <div className="filter-controls-inner">
            <div className="filter-controls-fields">
              <select value={filters.category} onChange={handleCategoryChange}>
                <option value="">Toutes les catégories</option>
                {categories.map((cat) => (
                  <option
                    key={cat.id}
                    value={cat.id}
                    dangerouslySetInnerHTML={{ __html: cat.name }}
                  ></option>
                ))}
              </select>
              <PriceRangeSlider onApply={() => setIsOpen(false)} />

              <select
                value={`${filters.orderby}-${filters.order}`}
                onChange={handleSortChange}
              >
                <option value="date-desc">Nouveautés</option>
                <option value="price-asc">Prix : du - cher au + cher</option>
                <option value="price-desc">Prix : du + cher au - cher</option>
                <option value="title-asc">Nom : A à Z</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
