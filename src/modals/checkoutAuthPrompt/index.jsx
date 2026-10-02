import { useDispatch } from "react-redux";
import { openModal, closeModal } from "../../slices/modalSlice";
import "./index.scss";

export default function CheckoutAuthPromptModal() {
  const dispatch = useDispatch();

  return (
    <div className="checkout-auth-prompt">
      <h2>Créer un compte ou se connecter ?</h2>
      <p>
        Vous êtes actuellement en train de commander en tant qu'invité. Sans
        compte, vous ne pourrez pas suivre votre historique de commande ni
        retrouver cette facture plus tard sur le site.
      </p>
      <div className="checkout-auth-prompt__buttons">
        <button
          className="login"
          type="button"
          onClick={() => {
            dispatch(openModal({ name: "auth", props: { view: "login" } }));
          }}
        >
          Se connecter / S'inscrire
        </button>
        <button
          type="button"
          className="signin"
          onClick={() => {
            dispatch(closeModal());
            window.dispatchEvent(new Event("checkoutContinueAsGuest"));
          }}
        >
          Continuer sans compte
        </button>
      </div>
    </div>
  );
}
