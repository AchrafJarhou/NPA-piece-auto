import { createSlice } from "@reduxjs/toolkit";
// Importation de la nouvelle action thunk
import {
  fetchProductsThunk,
  fetchProductByIdThunk,
  fetchSearchSuggestionsThunk,
} from "../thunkActionsCreator/productsThunks";

export const productsSlice = createSlice({
  name: "products",
  initialState: {
    list: {
      data: [],
      page: 1,
      perPage: 12,
      total: 0,
      totalPages: 1,
    },
    loading: false,
    error: null,
    currentRequestId: null,
    // Suggestions de la recherche du header, séparées du catalogue
    suggestions: [],
    // Nouveaux états pour stocker les détails d'un seul produit
    singleProduct: null,
    loadingSingle: false,
    errorSingle: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductsThunk.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.currentRequestId = action.meta.requestId;
      })
      .addCase(fetchProductsThunk.fulfilled, (state, action) => {
        // On ignore les réponses d'anciennes requêtes arrivées en retard
        if (action.meta.requestId !== state.currentRequestId) return;
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchProductsThunk.rejected, (state, action) => {
        if (action.meta.requestId !== state.currentRequestId) return;
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchSearchSuggestionsThunk.fulfilled, (state, action) => {
        state.suggestions = action.payload;
      })
      
      // Nouveaux cas pour le produit unique
      .addCase(fetchProductByIdThunk.pending, (state) => {
        state.loadingSingle = true;
        state.errorSingle = null;
        state.singleProduct = null;
      })
      .addCase(fetchProductByIdThunk.fulfilled, (state, action) => {
        state.loadingSingle = false;
        // Enregistrement des données du produit dans notre nouvelle boîte
        state.singleProduct = action.payload;
      })
      .addCase(fetchProductByIdThunk.rejected, (state, action) => {
        state.loadingSingle = false;
        state.errorSingle = action.payload;
        state.singleProduct = null;
      });
  },
});