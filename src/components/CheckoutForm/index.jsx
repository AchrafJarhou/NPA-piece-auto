import "./index.scss";
import React, { useState, useEffect } from "react";
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

export default function CheckoutForm() {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const user = useSelector((state) => state.user);
  const cart = useSelector((state) => state.cart);

  const [sameAsBilling, setSameAsBilling] = useState(false);

  const [shippingAddress, setShippingAddress] = useState({
    first_name: user?.customer?.shipping?.firstName || "Jean",
    last_name: user?.customer?.shipping?.lastName || "Dupont",
    address_1: user?.customer?.shipping?.address1 || "10 Rue de la Paix",
    city: user?.customer?.shipping?.city || "Paris",
    postcode: user?.customer?.shipping?.postcode || "75001",
    country: user?.customer?.shipping?.country || "FR",
    email: user?.profile?.email || "jean.dupont@example.com",
  });

  const [billingAddress, setBillingAddress] = useState({
    first_name: user?.customer?.billing?.firstName || "Jean",
    last_name: user?.customer?.billing?.lastName || "Dupont",
    address_1: user?.customer?.billing?.address1 || "10 Rue de la Paix",
    city: user?.customer?.billing?.city || "Paris",
    postcode: user?.customer?.billing?.postcode || "75001",
    country: user?.customer?.billing?.country || "FR",
    email: user?.profile?.email || "jean.dupont@example.com",
  });

  useEffect(() => {
    if (sameAsBilling) {
      setBillingAddress(shippingAddress);
    }
  }, [shippingAddress, sameAsBilling]);

  useEffect(() => {
    const handleGuestCheckout = () => {
      processCheckout();
    };
    window.addEventListener("checkoutContinueAsGuest", handleGuestCheckout);
    return () => {
      window.removeEventListener(
        "checkoutContinueAsGuest",
        handleGuestCheckout,
      );
    };
  }, [stripe, elements, loading, billingAddress, shippingAddress]);

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
          name: `${billingAddress?.first_name} ${billingAddress?.last_name}`,
          email: billingAddress?.email,
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
            payment_data: [
              { key: "stripe_source", value: paymentMethod.id },
              { key: "wc-stripe-payment-method", value: paymentMethod.id },
              { key: "payment_method", value: paymentMethod.id },
            ],
            billing_address: billingAddress,
            shipping_address: shippingAddress,
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

  const handleChangeAddress = (e) => {
    const { name, value } = e.target;
    setBillingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangeShippingAddress = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    setSameAsBilling(checked);
    if (checked) {
      setBillingAddress(shippingAddress);
    }
  };

  return (
    <div className="checkout-form">
      <form onSubmit={handleSubmit} className="checkout-form__form">
        <div className="checkout-form__section">
          <h3>Adresse de livraison</h3>
          <div className="checkout-form__grid">
            <label className="checkout-form__field">
              <span>Prénom</span>
              <input
                name="first_name"
                value={shippingAddress.first_name}
                onChange={handleChangeShippingAddress}
                required
              />
            </label>

            <label className="checkout-form__field">
              <span>Nom</span>
              <input
                name="last_name"
                value={shippingAddress.last_name}
                onChange={handleChangeShippingAddress}
                required
              />
            </label>

            <label className="checkout-form__field checkout-form__field--full">
              <span>Adresse</span>
              <input
                name="address_1"
                value={shippingAddress.address_1}
                onChange={handleChangeShippingAddress}
                required
              />
            </label>

            <label className="checkout-form__field">
              <span>Ville</span>
              <input
                name="city"
                value={shippingAddress.city}
                onChange={handleChangeShippingAddress}
                required
              />
            </label>

            <label className="checkout-form__field">
              <span>Code postal</span>
              <input
                name="postcode"
                value={shippingAddress.postcode}
                onChange={handleChangeShippingAddress}
                required
              />
            </label>

            <label className="checkout-form__field">
              <span>Pays</span>
              <input
                name="country"
                value={shippingAddress.country}
                onChange={handleChangeShippingAddress}
                required
              />
            </label>
          </div>

          <label className="checkout-form__checkbox">
            <input
              type="checkbox"
              id="sameAsBilling"
              checked={sameAsBilling}
              onChange={handleCheckboxChange}
            />
            <span>Livrer à la même adresse (facturation identique)</span>
          </label>
        </div>

        {!sameAsBilling && (
          <div className="checkout-form__section">
            <h3>Adresse de facturation</h3>
            <div className="checkout-form__grid">
              <label className="checkout-form__field">
                <span>Prénom</span>
                <input
                  name="first_name"
                  value={billingAddress.first_name}
                  onChange={handleChangeAddress}
                  required
                />
              </label>

              <label className="checkout-form__field">
                <span>Nom</span>
                <input
                  name="last_name"
                  value={billingAddress.last_name}
                  onChange={handleChangeAddress}
                  required
                />
              </label>

              <label className="checkout-form__field checkout-form__field--full">
                <span>Adresse</span>
                <input
                  name="address_1"
                  value={billingAddress.address_1}
                  onChange={handleChangeAddress}
                  required
                />
              </label>

              <label className="checkout-form__field">
                <span>Ville</span>
                <input
                  name="city"
                  value={billingAddress.city}
                  onChange={handleChangeAddress}
                  required
                />
              </label>

              <label className="checkout-form__field">
                <span>Code postal</span>
                <input
                  name="postcode"
                  value={billingAddress.postcode}
                  onChange={handleChangeAddress}
                  required
                />
              </label>

              <label className="checkout-form__field">
                <span>Pays</span>
                <input
                  name="country"
                  value={billingAddress.country}
                  onChange={handleChangeAddress}
                  required
                />
              </label>
            </div>
          </div>
        )}

        <div className="checkout-form__section">
          <label className="checkout-form__field checkout-form__field--full">
            <span>Email</span>
            <input
              name="email"
              type="email"
              value={billingAddress.email}
              onChange={handleChangeAddress}
              required
            />
          </label>
        </div>

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
