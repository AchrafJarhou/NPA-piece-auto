import "./index.scss";
import { site } from "../../config/site";
import storeIcon from "../../assets/icons/store.svg";
import truckIcon from "../../assets/icons/truck.svg";
import shieldIcon from "../../assets/icons/shield.svg";

// "Et maintenant ?" : retrait ou livraison, et ce qu'il reste à payer
export default function OrderNextSteps({ order }) {
  const isPickup = order.shipping?.method_id === "local_pickup";
  const payAtCounter = order.payment_method === "cod";
  const address = order.shipping_address;

  return (
    <section className="order-next-steps">
      <h2 className="order-next-steps-title">Et maintenant ?</h2>

      <div className="order-next-steps-block">
        <span className="order-next-steps-icon">
          <img src={isPickup ? storeIcon : truckIcon} alt="" />
        </span>
        <div className="order-next-steps-content">
          <span className="order-next-steps-label">{order.shipping?.title || "Livraison"}</span>
          {isPickup ? (
            <>
              <span className="order-next-steps-text">
                Nous préparons vos pièces et vous prévenons dès qu'elles vous attendent au comptoir :{" "}
                <strong>
                  {site.address.street}, {site.address.zip} {site.address.city}
                </strong>
                .
              </span>
              <span className="order-next-steps-note">{site.hoursShort}</span>
              <a href={site.mapsHref} target="_blank" rel="noreferrer" className="btn btn-dark order-next-steps-button">
                Itinéraire GPS
              </a>
            </>
          ) : (
            address && (
              <span className="order-next-steps-text">
                Livraison à :{" "}
                <strong>
                  {[address.name, address.company, address.address, `${address.postcode} ${address.city}`]
                    .filter((line) => line && line.trim())
                    .join(", ")}
                </strong>
              </span>
            )
          )}
        </div>
      </div>

      <div className="order-next-steps-block">
        <span className="order-next-steps-icon">
          <img src={shieldIcon} alt="" />
        </span>
        <div className="order-next-steps-content">
          <span className="order-next-steps-label">{order.payment_title || "Paiement"}</span>
          <span className="order-next-steps-text">
            {payAtCounter
              ? "Votre commande est à régler au comptoir lors du retrait, en espèces ou par carte."
              : "Votre paiement par carte a bien été accepté."}
          </span>
        </div>
      </div>

      {order.customer_note && (
        <p className="order-next-steps-vehicle">
          <span className="order-next-steps-label">Votre note</span> {order.customer_note}
        </p>
      )}

      <p className="order-next-steps-help">
        Une question sur votre commande ? Appelez le comptoir au{" "}
        <a href={site.phoneHref}>{site.phone}</a> en indiquant le n° {order.number}.
      </p>
    </section>
  );
}
