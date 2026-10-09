import { createAsyncThunk } from "@reduxjs/toolkit";
import { stripHtml } from "../utils/stripHtml";
import { apiFetch } from "../utils/apiFetch";

// Codes renvoyés par le plugin JWT quand l'email ou le mot de passe est faux
const badCredentialCodes = ["incorrect_password", "invalid_email", "invalid_username"];

const csrfOf = (thunkAPI) => thunkAPI.getState().user.csrf;

// Au chargement du site : le cookie de connexion est-il toujours valable ?
// WordPress répond avec le profil et le code CSRF, ou "non connecté".
export const checkSessionThunk = createAsyncThunk(
  "user/checkSession",
  async (_, thunkAPI) => {
    try {
      const response = await apiFetch(
        `${import.meta.env.VITE_API_URL}/wp-json/custom/v1/auth/me`,
      );
      if (!response.ok) {
        throw new Error("Impossible de vérifier la session.");
      }
      return await response.json();
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

export const loginThunk = createAsyncThunk(
  "user/login",
  async ({ username, password }, thunkAPI) => {
    try {
      const response = await apiFetch(
        `${import.meta.env.VITE_API_URL}/wp-json/custom/v1/auth/login`,
        {
          method: "POST",
          csrf: csrfOf(thunkAPI),
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        // Le message de WordPress contient du HTML et un lien vers wp-login
        if (badCredentialCodes.some((code) => data.code?.includes(code))) {
          throw new Error("Email ou mot de passe incorrect.");
        }
        throw new Error(stripHtml(data.message) || "Identifiants incorrects.");
      }
      // Le jeton est dans le cookie HttpOnly : on ne reçoit que le profil et le code CSRF
      return { profile: data.profile, csrf: data.csrf };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

// Déconnexion : seul WordPress peut effacer le cookie HttpOnly
export const logoutThunk = createAsyncThunk(
  "user/logoutRequest",
  async (_, thunkAPI) => {
    try {
      await apiFetch(`${import.meta.env.VITE_API_URL}/wp-json/custom/v1/auth/logout`, {
        method: "POST",
        csrf: csrfOf(thunkAPI),
      });
    } catch {
      // Même hors ligne, on déconnecte le client dans le site
    }
  },
);

export const fetchCurrentUserThunk = createAsyncThunk(
  "user/fetchCurrentUser",
  async (_, thunkAPI) => {
    try {
      const response = await apiFetch(
        `${import.meta.env.VITE_API_URL}/wp-json/wp/v2/users/me?context=edit`,
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Impossible de recuperer le profil.");
      }
      return {
        id: data.id,
        username: data.username,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        displayName: data.name,
        roles: data.roles,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

export const updateCurrentUserThunk = createAsyncThunk(
  "user/updateCurrentUser",
  async ({ email, firstName, lastName, password }, thunkAPI) => {
    try {
      const body = {};
      if (email !== undefined) body.email = email;
      if (firstName !== undefined) body.first_name = firstName;
      if (lastName !== undefined) body.last_name = lastName;
      if (password !== undefined) body.password = password;

      const response = await apiFetch(
        `${import.meta.env.VITE_API_URL}/wp-json/wp/v2/users/me`,
        {
          method: "POST",
          csrf: csrfOf(thunkAPI),
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Impossible de mettre a jour le profil.");
      }
      return {
        id: data.id,
        username: data.username,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        displayName: data.name,
        roles: data.roles,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

export const fetchCurrentCustomerThunk = createAsyncThunk(
  "user/fetchCurrentCustomer",
  async (_, thunkAPI) => {
    try {
      const response = await apiFetch(
        `${import.meta.env.VITE_API_URL}/wp-json/custom/v1/customer`,
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.message || "Impossible de recuperer les infos client.",
        );
      }
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

export const fetchCurrentUserOrdersThunk = createAsyncThunk(
  "user/fetchCurrentUserOrders",
  async (_, thunkAPI) => {
    try {
      const response = await apiFetch(
        `${import.meta.env.VITE_API_URL}/wp-json/custom/v1/orders`,
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.message || "Impossible de recuperer les commandes.",
        );
      }
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

export const registerThunk = createAsyncThunk(
  "user/register",
  async (
    { username, email, password, firstName, lastName, phone, siret },
    thunkAPI,
  ) => {
    try {
      // Route custom (mu-plugins/register.php) : WordPress ne permet pas la création de
      // compte anonyme via son API. Le client est connecté directement (cookie HttpOnly).
      const response = await apiFetch(
        `${import.meta.env.VITE_API_URL}/wp-json/custom/v1/register`,
        {
          method: "POST",
          csrf: csrfOf(thunkAPI),
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username,
            email,
            password,
            firstName,
            lastName,
            phone,
            siret,
          }),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Impossible de creer le compte.");
      }
      return { profile: data.profile, csrf: data.csrf };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

export const updateCurrentCustomerThunk = createAsyncThunk(
  "user/updateCurrentCustomer",
  async (customerData, thunkAPI) => {
    try {
      const response = await apiFetch(
        `${import.meta.env.VITE_API_URL}/wp-json/custom/v1/customer`,
        {
          method: "PUT",
          csrf: csrfOf(thunkAPI),
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(customerData),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Impossible de mettre à jour les informations client.",
        );
      }

      // L'API renvoie directement l'objet client complet mis à jour
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

export const deleteCurrentUserThunk = createAsyncThunk(
  "user/deleteCurrentUser",
  async ({ password }, thunkAPI) => {
    try {
      const response = await apiFetch(
        `${import.meta.env.VITE_API_URL}/wp-json/custom/v1/user`,
        {
          method: "DELETE",
          csrf: csrfOf(thunkAPI),
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Impossible de supprimer le compte.");
      }

      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);
