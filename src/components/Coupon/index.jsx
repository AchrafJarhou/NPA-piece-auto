import "./index.scss";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  applyCouponThunk,
  removeCouponThunk,
} from "../../thunkActionsCreator/cartThunks";
import { showToast } from "../../slices/toastSlice";
import tagIcon from "../../assets/icons/tag.svg";

// Bloc "Code promo ou compte garage pro" du panier
export default function Coupon() {
  const { coupons, loading } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const [code, setCode] = useState("");

  const applyCoupon = async (e) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;
    const result = await dispatch(applyCouponThunk({ code: trimmed }));
    if (applyCouponThunk.fulfilled.match(result)) {
      dispatch(showToast("Code promo appliqué"));
      setCode("");
    } else {
      dispatch(showToast(result.payload || "Code promo invalide"));
    }
  };

  return (
    <section className="coupon">
      <span className="coupon-icon">
        <img src={tagIcon} alt="" />
      </span>
      <div className="coupon-heading">
        <h2 className="coupon-title">Code promo ou compte garage pro</h2>
        <span className="coupon-text">
          Saisissez votre code remise ou numéro de compte professionnel
        </span>
      </div>
      <form className="coupon-form" onSubmit={applyCoupon}>
        <input
          className="coupon-input"
          placeholder="Code réduction…"
          aria-label="Code réduction"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button type="submit" className="btn btn-dark coupon-submit" disabled={loading}>
          Appliquer
        </button>
      </form>

      {coupons.length > 0 && (
        <ul className="coupon-list">
          {coupons.map((coupon) => (
            <li key={coupon.code} className="coupon-applied">
              <span className="coupon-applied-code">{coupon.code}</span>
              <button
                type="button"
                className="coupon-remove"
                onClick={() => dispatch(removeCouponThunk({ code: coupon.code }))}
                aria-label={`Retirer le code ${coupon.code}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
