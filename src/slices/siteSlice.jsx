import { createSlice } from "@reduxjs/toolkit";

export const siteSlice = createSlice({
  name: "site",
  initialState: {
    // name: "",
    // description: "",
    // url: "",
    // logoUrl: "",
    // faviconUrl: "",
  },
  reducers: {
    setSite: (state, action) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { setSite } = siteSlice.actions;
