import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  readGuestWishlist,
  clearGuestWishlistStorage,
} from "../utils/guestWishlist";
import { apiFetch } from "../utils/apiFetch";

export const fetchWishlistThunk = createAsyncThunk(
  "wishlist/fetch",
  async (_, thunkAPI) => {
    try {
      const csrf = thunkAPI.getState().user.csrf;
      const response = await apiFetch(
        `${import.meta.env.VITE_API_URL}/wp-json/custom/v1/wishlist`,
        { csrf },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Impossible de récupérer les favoris.");
      }
      return { items: data };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

export const addToWishlistThunk = createAsyncThunk(
  "wishlist/add",
  async (product, thunkAPI) => {
    try {
      const csrf = thunkAPI.getState().user.csrf;
      const response = await apiFetch(
        `${import.meta.env.VITE_API_URL}/wp-json/custom/v1/wishlist`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(csrf && { "X-NPA-CSRF": csrf }),
          },
          body: JSON.stringify({ productId: product.id }),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Impossible d'ajouter aux favoris.");
      }
      return { items: data };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

// A la connexion : on pousse cote serveur les produits ajoutes en tant
// qu'invite (localStorage), puis on renvoie la liste faisant autorite. Les
// requetes sont sequentielles pour eviter que deux ajouts concurrents ne se
// marchent dessus sur le meme user meta cote WordPress.
export const mergeGuestWishlistThunk = createAsyncThunk(
  "wishlist/mergeGuest",
  async (_, thunkAPI) => {
    try {
      const csrf = thunkAPI.getState().user.csrf;
      const guestItems = readGuestWishlist();

      for (const item of guestItems) {
        await apiFetch(
          `${import.meta.env.VITE_API_URL}/wp-json/custom/v1/wishlist`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(csrf && { "X-NPA-CSRF": csrf }),
            },
            body: JSON.stringify({ productId: item.id }),
          },
        );
      }

      const response = await apiFetch(
        `${import.meta.env.VITE_API_URL}/wp-json/custom/v1/wishlist`,
        { csrf },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.message || "Impossible de fusionner les favoris.",
        );
      }

      clearGuestWishlistStorage();
      return { items: data };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

export const removeFromWishlistThunk = createAsyncThunk(
  "wishlist/remove",
  async (productId, thunkAPI) => {
    try {
      const csrf = thunkAPI.getState().user.csrf;
      const response = await apiFetch(
        `${import.meta.env.VITE_API_URL}/wp-json/custom/v1/wishlist`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...(csrf && { "X-NPA-CSRF": csrf }),
          },
          body: JSON.stringify({ productId }),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Impossible de retirer des favoris.");
      }
      return { items: data };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);