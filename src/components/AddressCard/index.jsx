import "./index.scss";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AddressFields from "../AddressFields";
import { showToast } from "../../slices/toastSlice";
import { updateCurrentCustomerThunk } from "../../thunkActionsCreator/userThunks";
import { addressLines, hasPostalAddress, withDefaults } from "../../utils/address";

const titles = {
  billing: "Adresse de facturation",
  shipping: "Adresse de livraison",
};

// Affiche une adresse du profil et permet de la modifier sur place
export default function AddressCard({ type }) {
  const dispatch = useDispatch();
  const customer = useSelector((state) => state.user.customer);
  const address = customer?.[type];
  const isPro = customer?.accountType === "pro";

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const startEditing = () => {
    setDraft(withDefaults(address));
    setError(null);
    setEditing(true);
  };

  const copyBilling = () => setDraft(withDefaults(customer?.billing));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await dispatch(updateCurrentCustomerThunk({ [type]: draft })).unwrap();
      dispatch(showToast(`${titles[type]} enregistrée`));
      setEditing(false);
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="address-card" aria-labelledby={`address-${type}-title`}>
      <header className="address-card__header">
        <h2 id={`address-${type}-title`} className="address-card__title">
          {titles[type]}
        </h2>
        {!editing && hasPostalAddress(address) && (
          <button type="button" className="address-card__link" onClick={startEditing}>
            Modifier
          </button>
        )}
      </header>

      {editing ? (
        <form className="address-card__form" onSubmit={handleSubmit}>
          {type === "shipping" && hasPostalAddress(customer?.billing) && (
            <button type="button" className="address-card__link" onClick={copyBilling}>
              Reprendre l'adresse de facturation
            </button>
          )}
          <AddressFields idPrefix={`profile-${type}`} value={draft} onChange={setDraft} />
          {error && (
            <p className="address-card__error" role="alert">
              {error}
            </p>
          )}
          <div className="address-card__actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
            <button
              type="button"
              className="btn btn-light"
              onClick={() => setEditing(false)}
              disabled={saving}
            >
              Annuler
            </button>
          </div>
        </form>
      ) : hasPostalAddress(address) ? (
        <address className="address-card__lines">
          {addressLines(address).map((line) => (
            <span key={line}>{line}</span>
          ))}
          {isPro && type === "billing" && customer.siret && (
            <span className="address-card__meta">SIRET : {customer.siret}</span>
          )}
        </address>
      ) : (
        <div className="address-card__empty">
          <p>
            {isPro
              ? "Nous n'avons pas pu récupérer l'adresse de votre établissement. Vous pouvez la saisir ici."
              : "Aucune adresse enregistrée. Ajoutez-la maintenant ou lors de votre prochaine commande."}
          </p>
          <button type="button" className="btn btn-dark" onClick={startEditing}>
            Ajouter une adresse
          </button>
        </div>
      )}
    </section>
  );
}
