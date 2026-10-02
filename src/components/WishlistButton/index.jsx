import { useDispatch, useSelector } from "react-redux";
import {
  addToWishlistThunk,
  removeFromWishlistThunk,
} from "../../thunkActionsCreator/wishlistThunks";
import {
  addLocalWishlistItem,
  removeLocalWishlistItem,
} from "../../slices/wishlistSlice";
import { showToast } from "../../slices/toastSlice";
import "./index.scss";
import active from "./favorite-active.svg";
import inactive from "./favorite-inactive.svg";

export default function WishlistButton({ product }) {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.user.token);
  const isWishlisted = useSelector((state) =>
    state.wishlist.items.some((item) => item.id === product.id),
  );

  const toggleWishlist = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    // Invite : pas de compte donc pas de user meta cote serveur. On garde la
    // wishlist en localStorage (cf. wishlistSlice) ; elle sera fusionnee dans
    // le compte a la connexion (cartIdentityListener).
    if (!token) {
      if (isWishlisted) {
        dispatch(removeLocalWishlistItem(product.id));
      } else {
        dispatch(addLocalWishlistItem(product));
        dispatch(showToast(`${product.name || "Produit"} ajouté aux favoris`));
      }
      return;
    }

    const result = await dispatch(
      isWishlisted
        ? removeFromWishlistThunk(product.id)
        : addToWishlistThunk(product),
    );

    if (
      addToWishlistThunk.rejected.match(result) ||
      removeFromWishlistThunk.rejected.match(result)
    ) {
      dispatch(showToast(result.payload || "Erreur avec les favoris"));
    } else if (!isWishlisted) {
      dispatch(showToast(`${product.name || "Produit"} ajouté aux favoris`));
    }
  };

  return (
    <img
      type="button"
      className={`wishlist-button ${isWishlisted ? "active" : ""}`}
      aria-pressed={isWishlisted}
      aria-label={isWishlisted ? "Retirer des favoris" : "Ajouter aux favoris"}
      title={isWishlisted ? "Retirer des favoris" : "Ajouter aux favoris"}
      onClick={toggleWishlist}
      src={isWishlisted ? active : inactive}
    />
  );
}
