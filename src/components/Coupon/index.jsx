import "./index.scss";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  applyCouponThunk,
  removeCouponThunk,
} from "../../thunkActionsCreator/cartThunks";
import { showToast } from "../../slices/toastSlice";

export default function Coupon() {
  const { totals, coupons } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const [code, setCode] = useState("");

  const applyCoupon = async (e) => {
    e.preventDefault();
    if (!code) return;
    const result = await dispatch(applyCouponThunk({ code }));
    if (applyCouponThunk.fulfilled.match(result)) {
      dispatch(showToast("Code promo appliqué"));
      setCode("");
    } else {
      dispatch(showToast(result.payload || "Code promo invalide"));
    }
  };

  return (
    <div className="promo">
      <form onSubmit={applyCoupon}>
        <input
          placeholder="Code promo"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button type="submit">Appliquer</button>
      </form>

      {coupons.map((coupon) => (
        <p key={coupon.code}>
          {coupon.code}{" "}
          <button
            onClick={() => dispatch(removeCouponThunk({ code: coupon.code }))}
          >
            Retirer
          </button>
        </p>
      ))}

      {totals && parseInt(totals.total_discount) > 0 && (
        <div>
          Réduction: -
          {(parseInt(totals.total_discount) / 100).toFixed(2) +
            totals.currency_suffix}
        </div>
      )}
    </div>
  );
}
