import "./index.scss";
import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { openModal } from "../../slices/modalSlice";
import CheckoutSteps from "../../components/CheckoutSteps";
import OrderSuccessHero from "../../components/OrderSuccessHero";
import OrderNextSteps from "../../components/OrderNextSteps";
import OrderRecap from "../../components/OrderRecap";
import ReassuranceBand from "../../components/ReassuranceBand";
import Loader from "../../components/Loader";
import { apiFetch } from "../../utils/apiFetch";

// Page de confirmation : le récapitulatif est demandé à WordPress avec la clé de la commande
// (?key=wc_order_...) ou, sans clé, pour le client connecté à qui elle appartient
export default function Success() {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const key = searchParams.get("key") || "";
  const token = useSelector((state) => state.user.isAuthenticated);
  const dispatch = useDispatch();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    // Sans clé, le cookie de connexion permet au client de revoir ses propres commandes
    apiFetch(
      `${import.meta.env.VITE_API_URL}/wp-json/custom/v1/order-confirmation/${encodeURIComponent(orderId)}?key=${encodeURIComponent(key)}`,
    )
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data) => {
        if (cancelled) return;
        setOrder(data);
        setStatus("ready");
      })
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
    };
  }, [orderId, key, token]);

  return (
    <main className="success-page">
      <div className="success-page-body">
        <div className="success-page-inner">
          <CheckoutSteps current={3} />

          {status === "loading" && <Loader size="lg" />}

          {status === "error" && (
            <section className="success-page-card">
              <h1 className="success-page-title">Commande introuvable</h1>
              <p className="success-page-text">
                Nous ne pouvons pas afficher cette commande. Si vous êtes client, connectez-vous
                pour la retrouver dans votre espace, ou contactez le comptoir.
              </p>
              <div className="success-page-actions">
                <Link to="/catalogue" className="btn btn-primary">
                  Retour au catalogue
                </Link>
                <Link to="/contact" className="btn btn-light">
                  Contacter le comptoir
                </Link>
              </div>
            </section>
          )}

          {status === "ready" && order && (
            <>
              <OrderSuccessHero order={order} />

              <div className="success-page-layout">
                <div className="success-page-main">
                  <OrderNextSteps order={order} />

                  {!token && (
                    <section className="success-page-card">
                      <h2 className="success-page-subtitle">Suivez vos prochaines commandes</h2>
                      <p className="success-page-text">
                        Vous avez commandé en invité. Créez votre compte pour retrouver toutes
                        vos commandes et leur suivi dans votre espace client.
                      </p>
                      <button
                        type="button"
                        className="btn btn-dark success-page-account"
                        onClick={() => dispatch(openModal({ name: "auth", props: { view: "register" } }))}
                      >
                        Créer mon compte
                      </button>
                    </section>
                  )}

                  <div className="success-page-actions">
                    <Link to="/catalogue" className="btn btn-primary">
                      Poursuivre mes achats
                    </Link>
                    {token && (
                      <Link to="/profile" className="btn btn-light">
                        Voir mes commandes
                      </Link>
                    )}
                  </div>
                </div>

                <aside className="success-page-aside">
                  <OrderRecap order={order} />
                </aside>
              </div>
            </>
          )}
        </div>
      </div>

      <ReassuranceBand />
    </main>
  );
}
