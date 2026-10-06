import { createSlice } from "@reduxjs/toolkit";
import {
  initializeCartThunk,
  emptyCartThunk,
  addProductToCart,
  deleteProductFromCart,
  substractProductFromCart,
  applyCouponThunk,
  removeCouponThunk,
  selectShippingRateThunk,
} from "../thunkActionsCreator/cartThunks";
import { createOptimisticHandlers } from "../utils/optimisticFactory";

const { takeSnapshot, onFulfilled, onRejected } = createOptimisticHandlers({
  keys: [
    "items",
    "coupons",
    "totals",
    "shipping_rates",
    "needs_shipping",
    "nonce",
  ],
  onFulfilledPayload: (_state, payload) => {
    if (payload?.nonce) {
      localStorage.setItem("wc_cart_nonce", payload.nonce);
    }
  },
});

const VEHICLE_CHECK_KEY = "npa_vehicle_check";

function readVehicleCheck() {
  try {
    return localStorage.getItem(VEHICLE_CHECK_KEY) || "";
  } catch {
    return "";
  }
}

export const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    coupons: [],
    totals: null,
    // Modes de livraison proposés par WooCommerce, par colis
    shipping_rates: [],
    needs_shipping: false,
    // Immatriculation ou VIN pour la vérification de compatibilité, envoyé avec la commande
    vehicleCheck: readVehicleCheck(),
    nonce:
      typeof window !== "undefined"
        ? localStorage.getItem("wc_cart_nonce")
        : null,
    _snapshot: null,
    loading: false,
    error: null,
  },
  reducers: {
    setVehicleCheck: (state, action) => {
      state.vehicleCheck = action.payload;
      try {
        localStorage.setItem(VEHICLE_CHECK_KEY, action.payload);
      } catch {
        // stockage indisponible : la valeur reste en mémoire
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeCartThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeCartThunk.fulfilled, onFulfilled)
      .addCase(initializeCartThunk.rejected, onRejected)
      .addCase(addProductToCart.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        takeSnapshot(state);
        const { productId, quantity } = action.meta.arg;
        const existing = state.items.find((i) => i.id === productId);
        if (existing) {
          existing.quantity += quantity;
        } else {
          state.items.push({
            id: productId,
            key: `_optimistic_${productId}_${Date.now()}`,
            quantity,
            name: "…",
            images: [],
            prices: null,
            totals: null,
            _optimistic: true,
          });
        }
      })
      .addCase(addProductToCart.fulfilled, onFulfilled)
      .addCase(addProductToCart.rejected, onRejected)
      .addCase(deleteProductFromCart.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        takeSnapshot(state);
        const { itemKey } = action.meta.arg;
        state.items = state.items.filter((i) => i.key !== itemKey);
      })
      .addCase(deleteProductFromCart.fulfilled, onFulfilled)
      .addCase(deleteProductFromCart.rejected, onRejected)
      .addCase(substractProductFromCart.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        takeSnapshot(state);
        const { itemKey, quantity } = action.meta.arg;
        const newQuantity = quantity - 1;
        if (newQuantity <= 0) {
          state.items = state.items.filter((i) => i.key !== itemKey);
        } else {
          const item = state.items.find((i) => i.key === itemKey);
          if (item) item.quantity = newQuantity;
        }
      })
      .addCase(substractProductFromCart.fulfilled, onFulfilled)
      .addCase(substractProductFromCart.rejected, onRejected)
      .addCase(emptyCartThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        takeSnapshot(state);
        state.items = [];
        state.totals = null;
      })
      .addCase(emptyCartThunk.fulfilled, onFulfilled)
      .addCase(emptyCartThunk.rejected, onRejected)
      .addCase(applyCouponThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(applyCouponThunk.fulfilled, onFulfilled)
      .addCase(applyCouponThunk.rejected, onRejected)
      .addCase(removeCouponThunk.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        takeSnapshot(state);
        const { code } = action.meta.arg;
        state.coupons = state.coupons.filter((c) => c !== code);
      })
      .addCase(removeCouponThunk.fulfilled, onFulfilled)
      .addCase(removeCouponThunk.rejected, onRejected)
      .addCase(selectShippingRateThunk.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        takeSnapshot(state);
        // Le mode choisi est coché tout de suite, les totaux arrivent avec la réponse
        const { packageId, rateId } = action.meta.arg;
        const pack = state.shipping_rates.find(
          (p) => p.package_id === packageId,
        );
        pack?.shipping_rates.forEach((rate) => {
          rate.selected = rate.rate_id === rateId;
        });
      })
      .addCase(selectShippingRateThunk.fulfilled, onFulfilled)
      .addCase(selectShippingRateThunk.rejected, onRejected);
  },
});

export const cartActions = cartSlice.actions;
export const { setVehicleCheck } = cartSlice.actions;