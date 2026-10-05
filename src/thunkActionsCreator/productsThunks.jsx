import { createAsyncThunk } from "@reduxjs/toolkit";

const hasValue = (value) =>
  value !== undefined && value !== null && value !== "";

// Transforme les filtres du store en paramètres de l'API WooCommerce Store
export function buildProductsQuery(params = {}) {
  const query = new URLSearchParams();
  query.set("page", String(params.page || 1));
  query.set("per_page", String(params.per_page || 12));

  ["search", "category", "orderby", "order", "stock_status"].forEach((key) => {
    if (hasValue(params[key])) query.set(key, String(params[key]));
  });

  // Les prix sont envoyés en centimes
  ["min_price", "max_price"].forEach((key) => {
    if (hasValue(params[key])) {
      query.set(key, String(Math.round(parseFloat(params[key]) * 100)));
    }
  });

  if (params.brands?.length) query.set("brand", params.brands.join(","));
  // Seul l'identifiant du véhicule est envoyé, le serveur vérifie qu'il existe
  if (params.vehicle?.id) query.set("vehicle", String(params.vehicle.id));

  Object.entries(params.attributes || {}).forEach(([taxonomy, slugs], i) => {
    query.set(`attributes[${i}][attribute]`, taxonomy);
    slugs.forEach((slug, j) => query.set(`attributes[${i}][slug][${j}]`, slug));
  });
  if (Object.keys(params.attributes || {}).length > 1) {
    query.set("attribute_relation", "and");
  }

  return query;
}

export const fetchProductsThunk = createAsyncThunk(
  "products/fetchAll",
  async (params = {}, thunkAPI) => {
    try {
      const query = buildProductsQuery(params);
      const url = `${import.meta.env.VITE_API_URL}/wp-json/custom/v1/products?${query}`;
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        // Véhicule refusé par le serveur (supprimé, ou donnée modifiée dans le navigateur)
        const errorData = await response.json().catch(() => ({}));
        if (errorData.code === "invalid_vehicle") {
          return thunkAPI.rejectWithValue("invalid_vehicle");
        }
        throw new Error("Impossible de récupérer les produits.");
      }
      const data = await response.json();

      return {
        data,
        page: Number(query.get("page")),
        perPage: Number(query.get("per_page")),
        total: Number(response.headers.get("X-WP-Total")) || data.length,
        totalPages: Number(response.headers.get("X-WP-TotalPages")) || 1,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

// Suggestions de recherche (autocomplétion du Header) : état séparé de
// products.list pour ne pas écraser le catalogue ni les produits du slider.
export const fetchSearchSuggestionsThunk = createAsyncThunk(
  "products/fetchSearchSuggestions",
  async ({ search, per_page = 5 } = {}, thunkAPI) => {
    try {
      const queryString = new URLSearchParams({
        search: search || "",
        per_page: String(per_page),
      }).toString();
      const url = `${import.meta.env.VITE_API_URL}/wp-json/wc/store/v1/products?${queryString}`;
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error("Impossible de récupérer les suggestions.");
      }
      return await response.json();
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

// Action pour récupérer un seul produit par son ID
export const fetchProductByIdThunk = createAsyncThunk(
  "products/fetchById",
  async (productId, thunkAPI) => {
    try {
      const url = `${import.meta.env.VITE_API_URL}/wp-json/custom/v1/products/${productId}`;

      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        // Capture du message d'erreur réel de WooCommerce s'il existe
        const errorData = await response.json().catch(() => ({}));
        const serverMessage =
          errorData.message || "Impossible de récupérer le produit.";
        throw new Error(serverMessage);
      }

      const data = await response.json();

      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);
