import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setFilters } from "../slices/filtersSlice";
import { fetchCategoriesThunk } from "../thunkActionsCreator/categoriesThunks";

// Renvoie une fonction qui ouvre le catalogue filtré sur la catégorie
// WooCommerce dont le slug correspond (catalogue complet si introuvable).
export default function useOpenCategory() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const categories = useSelector((state) => state.categories.items);

  useEffect(() => {
    if (categories.length === 0) dispatch(fetchCategoriesThunk());
  }, [categories.length, dispatch]);

  return (slug) => {
    const category = categories.find((cat) => cat.slug === slug);
    // Les filtres d'une autre catégorie ne s'appliquent plus : on repart de zéro,
    // sauf le véhicule choisi, qui reste actif d'une catégorie à l'autre
    dispatch(
      setFilters({
        category: category ? String(category.id) : "",
        search: "",
        min_price: "",
        max_price: "",
        stock_status: "",
        brands: [],
        attributes: {},
      }),
    );
    navigate("/catalogue");
  };
}
