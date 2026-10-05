import { createAsyncThunk } from "@reduxjs/toolkit";
import { buildProductsQuery } from "./productsThunks";

const storeApi = () => `${import.meta.env.VITE_API_URL}/wp-json/wc/store/v1`;

async function getJson(url) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error("Impossible de charger les filtres.");
  return response.json();
}

// Liste des marques et des attributs (avec leurs valeurs) créés dans WooCommerce.
// Chargée une seule fois : elle ne dépend pas des filtres.
export const fetchFacetDefinitionsThunk = createAsyncThunk(
  "catalogue/fetchFacetDefinitions",
  async (_, thunkAPI) => {
    try {
      const [brands, attributes] = await Promise.all([
        getJson(`${storeApi()}/products/brands?per_page=100`).catch(() => []),
        getJson(`${storeApi()}/products/attributes`),
      ]);
      const attributesWithTerms = await Promise.all(
        attributes.map(async (attribute) => ({
          id: attribute.id,
          name: attribute.name,
          taxonomy: attribute.taxonomy,
          terms: await getJson(
            `${storeApi()}/products/attributes/${attribute.id}/terms?per_page=100`,
          ),
        })),
      );
      return { brands, attributes: attributesWithTerms };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

// Compteurs pour les filtres actuels : nombre de pièces par valeur d'attribut,
// par marque, en stock, et fourchette de prix.
export const fetchCollectionDataThunk = createAsyncThunk(
  "catalogue/fetchCollectionData",
  async ({ filters, taxonomies }, thunkAPI) => {
    try {
      const query = buildProductsQuery(filters);
      ["page", "per_page", "orderby", "order"].forEach((key) => query.delete(key));
      query.set("calculate_price_range", "true");
      query.set("calculate_stock_status_counts", "true");
      query.set("calculate_taxonomy_counts[0]", "product_brand");
      taxonomies.forEach((taxonomy, i) => {
        query.set(`calculate_attribute_counts[${i}][taxonomy]`, taxonomy);
        query.set(`calculate_attribute_counts[${i}][query_type]`, "or");
      });
      // Route du mu-plugin products.php : applique aussi le filtre véhicule
      return await getJson(
        `${import.meta.env.VITE_API_URL}/wp-json/custom/v1/products-collection-data?${query}`,
      );
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);
