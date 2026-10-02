import {
  addProductToCart,
  deleteProductFromCart,
  substractProductFromCart,
} from "../../thunkActionsCreator/cartThunks";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import "./index.scss";

export function CartProduct({ item }) {
  const dispatch = useDispatch();

  const url_array = item.permalink.split("/");
  const slug = url_array[url_array.length - 2];

  return (
    <li className="cart-product">
      <Link to={`/product/${slug}`} className="cart-product__link">
        <img
          className="cart-product__thumbnail"
          src={
            item.images?.[0]?.src ||
            "https://placeholder.pics/svg/300/DEDEDE/555555/Produit%20sans%20illustration"
          }
          alt={item.name || "produit sans nom"}
        ></img>
        <div className="cart-product__info">
          <h3
            dangerouslySetInnerHTML={{
              __html: item.name || "produit sans nom",
            }}
          ></h3>
          {item.variation &&
            item.variation.map((variation) => (
              <p key={variation.attribute} className="cart-product__variation">
                {variation.attribute} : {variation.value}
              </p>
            ))}
          <p className="cart-product__quantity">Quantité : {item.quantity}</p>
          {item.prices && (
            <p className="cart-product__price">
              Total :{" "}
              {(
                parseInt(item.prices.price * item.quantity) / 100
              ).toFixed(2) + item.prices.currency_suffix}
            </p>
          )}
        </div>
      </Link>

      <div className="cart-product__actions">
        <button
          className="cart-product__qty-button"
          disabled={item.quantity === item.quantity_limits.maximum}
          onClick={() => {
            dispatch(
              addProductToCart({
                productId: item.id,
                quantity: 1,
                variation: item.variation?.[0] || [],
              }),
            );
          }}
        >
          Ajouter +
        </button>
        <button
          className="cart-product__qty-button cart-product__qty-button--outline"
          onClick={() => {
            dispatch(
              substractProductFromCart({
                itemKey: item.key,
                quantity: item.quantity,
              }),
            );
          }}
        >
          Réduire -
        </button>
        <button
          className="cart-product__remove"
          onClick={() => {
            dispatch(
              deleteProductFromCart({
                itemKey: item.key,
              }),
            );
          }}
        >
          Supprimer
        </button>
      </div>
    </li>
  );
}
