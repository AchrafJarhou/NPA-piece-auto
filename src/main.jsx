import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";

import store from "./store";

import { initializeCartThunk } from "./thunkActionsCreator/cartThunks";
import {
  fetchCurrentUserThunk,
  fetchCurrentCustomerThunk,
  fetchCurrentUserOrdersThunk,
  validateTokenThunk,
} from "./thunkActionsCreator/userThunks";
import { logout } from "./slices/userSlice";
import { fetchSiteThunk } from "./thunkActionsCreator/siteThunk";
import { fetchWishlistThunk } from "./thunkActionsCreator/wishlistThunks";

import Home from "./pages/Home";
import Store from "./pages/Store";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Success from "./pages/Success";
import NewPassword from "./pages/NewPassword";
import Profile from "./pages/Profile";
import Wishlist from "./pages/Wishlist"; // TEMP: wishlist testing, remove before commit
import BlogPage from "./pages/Blog";
import SinglePost from "./pages/SinglePost";
import Contact from "./pages/Contact";
import LegalMentions from "./pages/LegalMentions";
import CGU from "./pages/CGU";
import CGV from "./pages/CGV";
import Error404 from "./pages/Error404";

import Seo from "./components/Seo";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Toast from "./components/Toast";
import Modal from "./components/Modal";

import "./index.scss";
import ScrollToTop from "./components/ScrollToTop";

store.dispatch(fetchSiteThunk());

if (store.getState().user.token) {
  // On vérifie d'abord le jeton : un jeton refusé ferait échouer tous les appels
  store.dispatch(validateTokenThunk()).then(({ payload }) => {
    if (payload?.valid === false) {
      // La déconnexion recharge un panier invité (cartIdentityListener)
      store.dispatch(logout());
      return;
    }
    store.dispatch(initializeCartThunk());
    store.dispatch(fetchCurrentUserThunk());
    store.dispatch(fetchCurrentCustomerThunk());
    store.dispatch(fetchCurrentUserOrdersThunk());
    store.dispatch(fetchWishlistThunk());
  });
} else {
  store.dispatch(initializeCartThunk());
}

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
  <HelmetProvider>
    <Provider store={store}>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
        basename="/"
      >
        <ScrollToTop />
        <Header />
        <Seo />
        <Routes>
          {<Route path="/" element={<Home />} />}
          <Route path="/new-password" element={<NewPassword />} />
          <Route path="/catalogue" element={<Store />} />
          <Route path="/mentions-legales" element={<LegalMentions />} />
          <Route path="/cgu" element={<CGU />} />
          <Route path="/cgv" element={<CGV />} />
          <Route path="/panier" element={<Cart />} />
          <Route path="*" element={<Error404 />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<SinglePost />} />
          <Route path="/success/:orderId" element={<Success />} />
          <Route path="/profile" element={<Profile />} />
          {/* TEMP: wishlist testing, remove before commit */}
          <Route path="/wishlist" element={<Wishlist />} />
        </Routes>
        <Footer />
        <Toast />
        <Modal />
      </Router>
    </Provider>
  </HelmetProvider>,
  /* </React.StrictMode>, */
);
