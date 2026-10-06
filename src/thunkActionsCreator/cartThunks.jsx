import { createAsyncThunk } from "@reduxjs/toolkit";

const buildCartHeaders = (thunkAPI, currentNonce) => {
  const token = thunkAPI.getState().user.token;
  return {
    "Content-Type": "application/json",
    ...(currentNonce && { Nonce: currentNonce }),
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const initializeCartThunk = createAsyncThunk(
  "cart/initialize",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().user.token;
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/wp-json/wc/store/v1/cart`,
        {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        },
      );
      if (!response.ok) {
        throw new Error("Impossible de récupérer le panier initial.");
      }
      const nonce = response.headers.get("Nonce");
      const cart = await response.json();
      return { ...cart, nonce };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

export const emptyCartThunk = createAsyncThunk(
  "cart/empty",
  async (_, thunkAPI) => {
    const currentNonce = thunkAPI.getState().cart.nonce;
    try {
      if (!currentNonce) {
        throw new Error("Jeton de session manquant.");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/wp-json/wc/store/v1/cart/items`,
        {
          method: "DELETE",
          headers: buildCartHeaders(thunkAPI, currentNonce),
        },
      );

      if (!response.ok) {
        throw new Error("Impossible de vider le panier.");
      }

      const nonce = response.headers.get("Nonce");
      const cart = await response.json();
      cart.items = [];
      return { ...cart, nonce };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

export const addProductToCart = createAsyncThunk(
  "cart/addProduct",
  async ({ productId, quantity, variation = [] }, thunkAPI) => {
    const currentNonce = thunkAPI.getState().cart.nonce;

    try {
      if (!currentNonce) {
        throw new Error("Jeton de session manquant.");
      }

      const variationData = Object.entries(variation).map(
        ([attribute, value]) => ({
          attribute,
          value,
        }),
      );

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/wp-json/wc/store/v1/cart/add-item`,
        {
          method: "POST",
          headers: buildCartHeaders(thunkAPI, currentNonce),
          body: JSON.stringify({
            id: productId,
            quantity,
            variation: variationData,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Impossible d'ajouter l'article au panier.");
      }
      // Si WooCommerce renouvelle le jeton dans la réponse, on met à jour le store et le localStorage
      const nonce = response.headers.get("Nonce");
      const cart = await response.json();
      return { ...cart, nonce };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

export const deleteProductFromCart = createAsyncThunk(
  "cart/deleteProduct",
  async ({ itemKey }, thunkAPI) => {
    const currentNonce = thunkAPI.getState().cart.nonce;

    try {
      if (!currentNonce) {
        throw new Error("Jeton de session manquant.");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/wp-json/wc/store/v1/cart/remove-item`,
        {
          method: "POST",
          headers: buildCartHeaders(thunkAPI, currentNonce),
          body: JSON.stringify({ key: itemKey }),
        },
      );

      if (!response.ok) {
        throw new Error("Impossible de supprimer l'article du panier.");
      }
      // Si WooCommerce renouvelle le jeton dans la réponse, on met à jour le store et le localStorage
      const nonce = response.headers.get("Nonce");
      const cart = await response.json();
      return { ...cart, nonce };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

export const substractProductFromCart = createAsyncThunk(
  "cart/substractProduct",
  async ({ itemKey, quantity }, thunkAPI) => {
    const currentNonce = thunkAPI.getState().cart.nonce;

    try {
      if (!currentNonce) {
        throw new Error("Jeton de session manquant.");
      }

      const newQuantity = quantity - 1;

      let url = "";
      let body = {};

      if (newQuantity > 0) {
        url = `${import.meta.env.VITE_API_URL}/wp-json/wc/store/v1/cart/update-item`;
        body = {
          method: "POST",
          headers: buildCartHeaders(thunkAPI, currentNonce),
          body: JSON.stringify({
            key: itemKey,
            quantity: newQuantity,
          }),
        };
      } else {
        url = `${import.meta.env.VITE_API_URL}/wp-json/wc/store/v1/cart/remove-item`;
        body = {
          method: "POST",
          headers: buildCartHeaders(thunkAPI, currentNonce),
          body: JSON.stringify({ key: itemKey }),
        };
      }

      const response = await fetch(url, body);

      if (!response.ok) {
        throw new Error("Impossible de modifier l'article.");
      }

      const nonce = response.headers.get("Nonce");
      const cart = await response.json();
      return { ...cart, nonce };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

export const applyCouponThunk = createAsyncThunk(
  "cart/applyCoupon",
  async ({ code }, thunkAPI) => {
    const currentNonce = thunkAPI.getState().cart.nonce;

    try {
      if (!currentNonce) {
        throw new Error("Jeton de session manquant.");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/wp-json/wc/store/v1/cart/apply-coupon`,
        {
          method: "POST",
          headers: buildCartHeaders(thunkAPI, currentNonce),
          body: JSON.stringify({ code }),
        },
      );

      const cart = await response.json();

      if (!response.ok) {
        throw new Error(cart.message || "Ce code promo n'est pas valide.");
      }

      const nonce = response.headers.get("Nonce");
      return { ...cart, nonce };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

export const selectShippingRateThunk = createAsyncThunk(
  "cart/selectShippingRate",
  async ({ packageId, rateId }, thunkAPI) => {
    const currentNonce = thunkAPI.getState().cart.nonce;

    try {
      if (!currentNonce) {
        throw new Error("Jeton de session manquant.");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/wp-json/wc/store/v1/cart/select-shipping-rate`,
        {
          method: "POST",
          headers: buildCartHeaders(thunkAPI, currentNonce),
          body: JSON.stringify({ package_id: packageId, rate_id: rateId }),
        },
      );

      if (!response.ok) {
        throw new Error("Impossible de choisir ce mode de livraison.");
      }

      const nonce = response.headers.get("Nonce");
      const cart = await response.json();
      return { ...cart, nonce };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

export const removeCouponThunk = createAsyncThunk(
  "cart/removeCoupon",
  async ({ code }, thunkAPI) => {
    const currentNonce = thunkAPI.getState().cart.nonce;

    try {
      if (!currentNonce) {
        throw new Error("Jeton de session manquant.");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/wp-json/wc/store/v1/cart/remove-coupon`,
        {
          method: "POST",
          headers: buildCartHeaders(thunkAPI, currentNonce),
          body: JSON.stringify({ code }),
        },
      );

      if (!response.ok) {
        throw new Error("Impossible de retirer ce code promo.");
      }

      const nonce = response.headers.get("Nonce");
      const cart = await response.json();
      return { ...cart, nonce };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);