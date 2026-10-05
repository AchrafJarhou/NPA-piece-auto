import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setFilters } from "../../slices/filtersSlice";
import { fetchSearchSuggestionsThunk } from "../../thunkActionsCreator/productsThunks";
import "./index.scss";
import { decodeHtml } from "../../utils/decodeHtml";

export default function Autocomplete({ placeholder = "Rechercher..." }) {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const search = useSelector((state) => state.filters.search);
  const [focused, setFocused] = useState(false);
  const suggestions = useSelector((state) => state.products.suggestions);

  // Suggestions chargées 300 ms après la dernière frappe
  useEffect(() => {
    if (!search.trim()) return;
    const timeout = setTimeout(() => {
      dispatch(fetchSearchSuggestionsThunk({ search, per_page: 6 }));
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, dispatch]);

  const handleChange = (e) => {
    if (location.pathname !== "/catalogue") {
      dispatch(
        setFilters({
          category: "",
          min_price: "",
          max_price: "",
          stock_status: "",
          brands: [],
          attributes: {},
          search: e.target.value,
        }),
      );
    } else {
      dispatch(setFilters({ search: e.target.value }));
    }
  };

  const handleSelect = () => {
    dispatch(setFilters({ search: "" }));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      setFocused(false);
      navigate("/catalogue");
    }
  };

  return (
    <div className="autocomplete">
      <input
        type="search"
        className="autocomplete-input"
        placeholder={placeholder}
        value={search}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
        }}
        aria-label="Rechercher"
      />

      {focused && search.trim() && suggestions.length > 0 && (
        <ul
          className="autocomplete-suggestions"
          onMouseDown={(e) => e.preventDefault()}
          tabIndex="-1"
        >
          {suggestions.map((product) => (
            <li key={product.id}>
              <Link
                to={`/product/${product.id}`}
                onClick={handleSelect}
                tabIndex="-1"
              >
                <img
                  src={
                    product.images[0]?.src ||
                    "https://placeholder.pics/svg/300/DEDEDE/555555/Placeholder"
                  }
                  alt={decodeHtml(product.name) || "la photo du produit"}
                />
                <span>{decodeHtml(product.name)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
