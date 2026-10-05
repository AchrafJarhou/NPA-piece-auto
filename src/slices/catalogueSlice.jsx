import { createSlice } from "@reduxjs/toolkit";
import {
  fetchFacetDefinitionsThunk,
  fetchCollectionDataThunk,
} from "../thunkActionsCreator/catalogueThunks";

const toCountMap = (list, key) =>
  (list || []).reduce((acc, item) => {
    acc[item[key]] = Number(item.count);
    return acc;
  }, {});

export const catalogueSlice = createSlice({
  name: "catalogue",
  initialState: {
    brands: [], // [{ id, name, slug }]
    attributes: [], // [{ id, name, taxonomy, terms: [{ id, name, slug }] }]
    definitionsLoaded: false,
    termCounts: {}, // { idDuTerme: nombre de pièces }
    brandCounts: {}, // { idDeLaMarque: nombre de pièces }
    inStockCount: 0,
    priceRange: null, // { min, max } en euros
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFacetDefinitionsThunk.fulfilled, (state, action) => {
        state.brands = action.payload.brands;
        state.attributes = action.payload.attributes;
        state.definitionsLoaded = true;
      })
      .addCase(fetchCollectionDataThunk.fulfilled, (state, action) => {
        const data = action.payload;
        state.termCounts = toCountMap(data.attribute_counts, "term");
        const brandCounts = (data.taxonomy_counts || []).find(
          (item) => item.taxonomy === "product_brand",
        );
        state.brandCounts = toCountMap(brandCounts?.counts || data.taxonomy_counts, "term");
        const inStock = (data.stock_status_counts || []).find(
          (item) => item.status === "instock",
        );
        state.inStockCount = Number(inStock?.count || 0);
        // Les bornes du budget ne bougent pas pendant qu'un budget est appliqué
        const { min_price, max_price } = action.meta.arg.filters;
        if (min_price !== "" || max_price !== "") return;
        const range = data.price_range;
        state.priceRange = range
          ? {
              min: Math.floor(Number(range.min_price) / 10 ** range.currency_minor_unit),
              max: Math.ceil(Number(range.max_price) / 10 ** range.currency_minor_unit),
            }
          : null;
      });
  },
});
