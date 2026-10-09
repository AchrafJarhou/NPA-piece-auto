import "./index.scss";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setVehicleCheck } from "../../slices/cartSlice";
import { normalizeVehicle } from "../../utils/vehicleCheck";
import shieldIcon from "../../assets/icons/shield-yellow.svg";

// Vérification de compatibilité : l'immatriculation ou le VIN est gardé dans le panier
// et sera envoyé avec la commande pour le contrôle du technicien
export default function CartCompatibility() {
  const dispatch = useDispatch();
  const saved = useSelector((state) => state.cart.vehicleCheck);
  const [value, setValue] = useState(saved);
  const [error, setError] = useState("");

  const save = () => {
    if (!value.trim()) {
      setError("");
      dispatch(setVehicleCheck(""));
      return;
    }
    const normalized = normalizeVehicle(value);
    if (!normalized) {
      setError("Format attendu : immatriculation AB-123-CD ou VIN à 17 caractères.");
      return;
    }
    setError("");
    setValue(normalized);
    dispatch(setVehicleCheck(normalized));
  };

  return (
    <section className="cart-compatibility">
      <span className="cart-compatibility-icon">
        <img src={shieldIcon} alt="" />
      </span>
      <div className="cart-compatibility-content">
        <div className="cart-compatibility-heading">
          <h2 className="cart-compatibility-title">
            Vérification de compatibilité offerte par un technicien NPA
          </h2>
          <span className="cart-compatibility-badge">Inclus & gratuit</span>
        </div>
        <p className="cart-compatibility-text">
          Avant de préparer ou expédier vos pièces, nos mécaniciens du comptoir Capelette
          vérifient l'adéquation exacte avec votre immatriculation ou numéro de châssis (VIN).
        </p>
        <form
          className="cart-compatibility-form"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <input
            className="cart-compatibility-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={save}
            placeholder="Entrez votre immatriculation (ex: AB-123-CD) ou VIN…"
            aria-label="Immatriculation ou numéro VIN"
            aria-invalid={Boolean(error)}
            maxLength={20}
          />
        </form>
        {error && <span className="cart-compatibility-error">{error}</span>}
        {!error && saved && (
          <span className="cart-compatibility-saved">
            {saved} enregistré : un technicien vérifiera vos pièces avant préparation.
          </span>
        )}
      </div>
    </section>
  );
}
