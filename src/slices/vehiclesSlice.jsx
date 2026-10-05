import { createSlice } from "@reduxjs/toolkit";
import { fetchVehicleChildrenThunk } from "../thunkActionsCreator/vehiclesThunks";
import { decodeHtml } from "../utils/decodeHtml";

export const vehiclesSlice = createSlice({
  name: "vehicles",
  initialState: {
    byParent: {}, // { idDuParent: [{ id, name }] }, 0 = les marques
    loading: {},
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVehicleChildrenThunk.pending, (state, action) => {
        state.loading[action.meta.arg] = true;
        state.error = null;
      })
      .addCase(fetchVehicleChildrenThunk.fulfilled, (state, action) => {
        state.loading[action.meta.arg] = false;
        state.byParent[action.meta.arg] = action.payload.map((vehicle) => ({
          id: vehicle.id,
          name: decodeHtml(vehicle.name),
        }));
      })
      .addCase(fetchVehicleChildrenThunk.rejected, (state, action) => {
        state.loading[action.meta.arg] = false;
        state.error = action.payload;
      });
  },
});
