import { createSlice } from "@reduxjs/toolkit";
import {
  checkSessionThunk,
  loginThunk,
  registerThunk,
  fetchCurrentUserThunk,
  updateCurrentUserThunk,
  fetchCurrentCustomerThunk,
  fetchCurrentUserOrdersThunk,
  updateCurrentCustomerThunk,
  deleteCurrentUserThunk,
} from "../thunkActionsCreator/userThunks";

export const userSlice = createSlice({
  name: "user",
  initialState: {
    profile: null,
    customer: null,
    orders: [],
    // Le jeton de connexion est dans un cookie HttpOnly (mu-plugins/auth.php) :
    // le site sait seulement si le client est connecté, et garde le code CSRF en mémoire
    isAuthenticated: false,
    csrf: null,
    // Passe à true quand WordPress a répondu à /auth/me (évite de rediriger trop tôt)
    authChecked: false,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.profile = null;
      state.customer = null;
      state.orders = [];
      state.isAuthenticated = false;
      state.csrf = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkSessionThunk.fulfilled, (state, action) => {
        state.authChecked = true;
        state.isAuthenticated = Boolean(action.payload.logged_in);
        state.csrf = action.payload.csrf || null;
        if (action.payload.profile) state.profile = action.payload.profile;
      })
      .addCase(checkSessionThunk.rejected, (state) => {
        state.authChecked = true;
      })
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.csrf = action.payload.csrf;
        state.profile = action.payload.profile;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.csrf = action.payload.csrf;
        state.profile = action.payload.profile;
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCurrentUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchCurrentUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateCurrentUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCurrentUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updateCurrentUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCurrentCustomerThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentCustomerThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.customer = action.payload;
      })
      .addCase(fetchCurrentCustomerThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCurrentUserOrdersThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUserOrdersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchCurrentUserOrdersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateCurrentCustomerThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCurrentCustomerThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.customer = action.payload;
      })
      .addCase(updateCurrentCustomerThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteCurrentUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCurrentUserThunk.fulfilled, (state) => {
        state.loading = false;
        // Remet tout l'état utilisateur à zéro (déconnexion automatique)
        state.isAuthenticated = false;
        state.csrf = null;
        state.profile = null;
        state.customer = null;
        state.orders = [];
        state.error = null;
      })
      .addCase(deleteCurrentUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = userSlice.actions;
