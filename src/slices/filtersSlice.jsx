import { createSlice } from "@reduxjs/toolkit";
import { loadSavedVehicle } from "../utils/savedVehicle";

const initialState = {
  search: "",
  category: "",
  min_price: "",
  max_price: "",
  orderby: "menu_order",
  order: "asc",
  stock_status: "", // "instock" pour n'afficher que les pièces en stock
  brands: [], // slugs des marques cochées
  attributes: {}, // { pa_essieu: ["avant"], ... } : valeurs cochées par attribut
  page: 1,
  // véhicule choisi sur l'accueil : { id, brandId, modelId, engineId, brand, model, engine }
  vehicle: loadSavedVehicle(),
};

export const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    // Met à jour un ou plusieurs filtres d'un coup.
    // Tout changement de filtre ramène à la page 1, sauf si la page est fournie.
    setFilters: (state, action) => {
      return { ...state, page: 1, ...action.payload };
    },
    // Coche ou décoche une marque
    toggleBrand: (state, action) => {
      const slug = action.payload;
      state.brands = state.brands.includes(slug)
        ? state.brands.filter((brand) => brand !== slug)
        : [...state.brands, slug];
      state.page = 1;
    },
    // Coche ou décoche une valeur d'attribut
    toggleAttribute: (state, action) => {
      const { taxonomy, slug } = action.payload;
      const current = state.attributes[taxonomy] || [];
      const next = current.includes(slug)
        ? current.filter((value) => value !== slug)
        : [...current, slug];
      if (next.length > 0) {
        state.attributes[taxonomy] = next;
      } else {
        delete state.attributes[taxonomy];
      }
      state.page = 1;
    },
    // Vide les filtres de la colonne de gauche, garde la catégorie et la recherche
    resetSidebarFilters: (state) => {
      state.min_price = "";
      state.max_price = "";
      state.stock_status = "";
      state.brands = [];
      state.attributes = {};
      state.page = 1;
    },
  },
});

export const { setFilters, toggleBrand, toggleAttribute, resetSidebarFilters } =
  filtersSlice.actions;
