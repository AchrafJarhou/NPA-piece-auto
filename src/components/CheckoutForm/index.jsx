import "./index.scss";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "../../slices/toastSlice";
import { emptyCartThunk } from "../../thunkActionsCreator/cartThunks";
import {
  fetchCurrentCustomerThunk,
  fetchCurrentUserOrdersThunk,
  fetchCurrentUserThunk,
} from "../../thunkActionsCreator/userThunks";
import { openModal } from "../../slices/modalSlice";
import AddressFields from "../AddressFields";
import {
  addressLines,
  hasPostalAddress,
  missingNames,
  toStoreAddress,
  withDefaults,
} from "../../utils/address";

export default function CheckoutForm() {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const formRef = useRef(null);

  const user = useSelector((state) => state.user);
  const cart = useSelector((state) => state.cart);

  const savedShipping = user?.customer?.shipping;
  const savedBilling = user?.customer?.billing;

  // Nom du destinataire : à défaut dans l'adresse, on reprend celui du compte
  const fromSaved = (address) => {
    const base = withDefaults(address);
    return {
      ...base,
      firstName: base.firstName || user?.profile?.firstName || "",
      lastName: base.lastName || user?.profile?.lastName || "",
    };
  };

  const [shippingAddress, setShippingAddress] = useState(() => fromSaved(savedShipping));
  const [billingAddress, setBillingAddress] = useState(() => fromSaved(savedBilling));
  const [email, setEmail] = useState(user?.profile?.email || "");

  // Adresse déjà connue (profil ou SIRET) : on demande seulement de la confirmer
  const [editingShipping, setEditingShipping] = useState(!hasPostalAddress(savedShipping));
  const [editingBilling, setEditingBilling] = useState(!hasPostalAddress(savedBilling));
  const [sameAsShipping, setSameAsShipping] = useState(!hasPostalAddress(savedBilling));

  // Le client et le profil peuvent arriver après le montage du formulaire
  useEffect(() => {
    if (!user?.customer) return;
    setShippingAddress(fromSaved(savedShipping));
    setBillingAddress(fromSaved(savedBilling));
    setEditingShipping(!hasPostalAddress(savedShipping));
    setEditingBilling(!hasPostalAddress(savedBilling));
    setSameAsShipping(!hasPostalAddress(savedBilling));
  }, [user?.customer]);

  useEffect(() => {
    if (user?.profile?.email) setEmail(user.profile.email);
  }, [user?.profile?.email]);

  const finalBilling = editingBilling && sameAsShipping ? shippingAddress : billingAddress;

  useEffect(() => {
    const handleGuestCheckout = () => {
      // Hors soumission du formulaire : on déclenche nous-mêmes la validation
      if (formRef.current?.reportValidity()) processCheckout();
    };
    window.addEventListener("checkoutContinueAsGuest", handleGuestCheckout);
    return () => {
      window.removeEventListener(
        "checkoutContinueAsGuest",
        handleGuestCheckout,
      );
    };
  }, [stripe, elements, loading, finalBilling, shippingAddress, email]);

  const processCheckout = async () => {
    if (!stripe || !elements || loading) return;
    setLoading(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);
    const { paymentMethod, error: stripeError } =
      await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
        billing_details: {
          name: `${finalBilling.firstName} ${finalBilling.lastName}`,
          email,
        },
      });

    if (stripeError) {
      setError(stripeError.message);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/wp-json/wc/store/v1/checkout`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Nonce: cart?.nonce || "",
            ...(user?.token && { Authorization: `Bearer ${user.token}` }),
          },
          body: JSON.stringify({
            payment_method: "stripe",
            // WooCommerce transmet uniquement payment_data à l'extension Stripe :
            // "payment_method" doit valoir "stripe" (type de paiement carte) et
            // "wc-stripe-payment-method" contient l'identifiant de la carte (pm_...)
            payment_data: [
              { key: "payment_method", value: "stripe" },
              { key: "wc-stripe-payment-method", value: paymentMethod.id },
            ],
            billing_address: { ...toStoreAddress(finalBilling), email },
            shipping_address: toStoreAddress(shippingAddress),
          }),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de la commande.");
      }
      if (data.payment_result?.redirect_url) {
        dispatch(showToast(`Commande n°${data.order_id} confirmée`));
        dispatch(emptyCartThunk());
        dispatch(fetchCurrentUserThunk());
        dispatch(fetchCurrentCustomerThunk());
        dispatch(fetchCurrentUserOrdersThunk());
        user.token &&
          dispatch(openModal({ name: "orderDetails", props: data.order_id }));
        navigate(`/success/${data.order_id}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user?.token) {
      dispatch(openModal({ name: "checkoutAuthPrompt" }));
      return;
    }
    processCheckout();
  };

  const cancelShippingEdit = () => {
    setShippingAddress(fromSaved(savedShipping));
    setEditingShipping(false);
  };

  const cancelBillingEdit = () => {
    setBillingAddress(fromSaved(savedBilling));
    setEditingBilling(false);
  };

  // Récapitulatif d'une adresse enregistrée, avec le nom du destinataire à
  // compléter s'il manque (adresse d'un pro récupérée depuis son SIRET)
  const recap = (type, address, setAddress) => (
    <div className="checkout-form__recap">
      <address className="checkout-form__recap-lines">
        {addressLines(address).map((line) => (
          <span key={line}>{line}</span>
        ))}
      </address>
      {missingNames(address) && (
        <>
          <p className="checkout-form__hint">
            Indiquez le nom de la personne à qui adresser la commande.
          </p>
          <AddressFields
            idPrefix={`checkout-${type}-names`}
            value={address}
            onChange={setAddress}
            only={["firstName", "lastName"]}
          />
        </>
      )}
    </div>
  );

  return (
    <div className="checkout-form">
      <form ref={formRef} onSubmit={handleSubmit} className="checkout-form__form">
        <div className="checkout-form__section">
          <h3>Adresse de livraison</h3>
          {editingShipping ? (
            <>
              <AddressFields
                idPrefix="checkout-shipping"
                value={shippingAddress}
                onChange={setShippingAddress}
              />
              {hasPostalAddress(savedShipping) && (
                <button
                  type="button"
                  className="checkout-form__link"
                  onClick={cancelShippingEdit}
                >
                  Revenir à mon adresse enregistrée
                </button>
              )}
            </>
          ) : (
            <>
              <p className="checkout-form__hint">
                Cette adresse de livraison est-elle correcte ?
              </p>
              {recap("shipping", shippingAddress, setShippingAddress)}
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setEditingShipping(true)}
              >
                Changer l'adresse de livraison
              </button>
            </>
          )}
        </div>

        <div className="checkout-form__section">
          <h3>Adresse de facturation</h3>
          {!editingBilling ? (
            <>
              {recap("billing", billingAddress, setBillingAddress)}
              <button
                type="button"
                className="checkout-form__link"
                onClick={() => setEditingBilling(true)}
              >
                Modifier l'adresse de facturation
              </button>
            </>
          ) : (
            <>
              <label className="checkout-form__checkbox">
                <input
                  type="checkbox"
                  checked={sameAsShipping}
                  onChange={(e) => setSameAsShipping(e.target.checked)}
                />
                <span>Identique à l'adresse de livraison</span>
              </label>
              {!sameAsShipping && (
                <AddressFields
                  idPrefix="checkout-billing"
                  value={billingAddress}
                  onChange={setBillingAddress}
                />
              )}
              {hasPostalAddress(savedBilling) && (
                <button
                  type="button"
                  className="checkout-form__link"
                  onClick={cancelBillingEdit}
                >
                  Revenir à mon adresse enregistrée
                </button>
              )}
            </>
          )}
        </div>

        {!user?.profile?.email && (
          <div className="checkout-form__section">
            <div className="address-fields__field">
              <label htmlFor="checkout-email" className="address-fields__label">
                Email
              </label>
              <input
                id="checkout-email"
                name="email"
                type="email"
                autoComplete="email"
                className="address-fields__input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
        )}

        <div className="checkout-form__section checkout-form__payment">
          <h3>Paiement</h3>
          <div className="strip">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#0f172a",
                    fontFamily: "InterCustom, sans-serif",
                    "::placeholder": { color: "#94a3b8" },
                  },
                  invalid: { color: "#dc2626" },
                },
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          className="checkout-form__submit"
          disabled={!stripe || loading}
        >
          {loading ? "Traitement..." : "Payer maintenant"}
        </button>

        {error && <p className="checkout-form__error">{error}</p>}
      </form>
    </div>
  );
}
