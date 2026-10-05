import { createAsyncThunk } from "@reduxjs/toolkit";

// Véhicules enfants d'un parent (0 = les marques), créés dans Produits > Véhicules
export const fetchVehicleChildrenThunk = createAsyncThunk(
  "vehicles/fetchChildren",
  async (parentId, thunkAPI) => {
    try {
      const url = `${import.meta.env.VITE_API_URL}/wp-json/wp/v2/vehicles?parent=${parentId}&per_page=100&orderby=name&order=asc&_fields=id,name,parent`;
      const response = await fetch(url, {
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Impossible de charger les véhicules.");
      return await response.json();
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
  {
    // Chaque liste n'est chargée qu'une fois
    condition: (parentId, { getState }) =>
      getState().vehicles.byParent[parentId] === undefined &&
      !getState().vehicles.loading[parentId],
  },
);
