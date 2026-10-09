import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchWishlistThunk } from "../../thunkActionsCreator/wishlistThunks";
import ProductCard from "../../components/ProductCard";
import "./index.scss";
import Loader from "../../components/Loader";

export default function Wishlist() {
  const dispatch = useDispatch();
  const isAuthentificated = useSelector((state) => state.user.isAuthenticated);
  const { items, loading } = useSelector((state) => state.wishlist);

  // Invite : items vient deja du localStorage (hydrate dans wishlistSlice),
  // pas besoin d'appel serveur. Connecte : on va chercher la liste faisant
  // autorite cote WordPress.
  useEffect(() => {
    if (isAuthentificated) {
      dispatch(fetchWishlistThunk());
    }
  }, [isAuthentificated]);

  return (
    <main className="wishlist-page">
      <h1>Mes favoris</h1>
      {loading && <Loader size="lg" />}
      {!loading && items.length === 0 && <p>Aucun favori pour le moment.</p>}
      <div className="wishlist-grid">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}
