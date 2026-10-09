import "./index.scss";

// Seule la France est proposée : WooCommerce ne livre qu'en France
// (WooCommerce → Réglages → Général, réglé par scripts/setup-woocommerce.php)
const countries = [["FR", "France"]];

const fields = [
  { name: "firstName", label: "Prénom", autoComplete: "given-name", required: true },
  { name: "lastName", label: "Nom", autoComplete: "family-name", required: true },
  { name: "company", label: "Société", autoComplete: "organization", full: true },
  { name: "address1", label: "Adresse", autoComplete: "address-line1", required: true, full: true },
  { name: "address2", label: "Complément d'adresse", autoComplete: "address-line2", full: true },
  { name: "postcode", label: "Code postal", autoComplete: "postal-code", required: true },
  { name: "city", label: "Ville", autoComplete: "address-level2", required: true },
  { name: "country", label: "Pays", autoComplete: "country", required: true },
  { name: "phone", label: "Téléphone", autoComplete: "tel", type: "tel" },
];

// Champs d'une adresse (sans <form>) : utilisés dans le profil et au paiement.
// `only` restreint l'affichage à certains champs (ex : nom du destinataire).
export default function AddressFields({ idPrefix, value, onChange, only }) {
  const handleChange = (e) => {
    onChange({ ...value, [e.target.name]: e.target.value });
  };

  const visible = only ? fields.filter((f) => only.includes(f.name)) : fields;

  return (
    <div className="address-fields">
      {visible.map((field) => {
        const id = `${idPrefix}-${field.name}`;
        const common = {
          id,
          name: field.name,
          value: value[field.name] ?? "",
          onChange: handleChange,
          required: field.required,
          autoComplete: field.autoComplete,
          className: "address-fields__input",
        };
        return (
          <div
            key={field.name}
            className={`address-fields__field ${field.full ? "address-fields__field--full" : ""}`}
          >
            <label htmlFor={id} className="address-fields__label">
              {field.label}
              {!field.required && (
                <span className="address-fields__optional"> (facultatif)</span>
              )}
            </label>
            {field.name === "country" ? (
              <select {...common}>
                {countries.map(([code, label]) => (
                  <option key={code} value={code}>
                    {label}
                  </option>
                ))}
              </select>
            ) : (
              <input {...common} type={field.type || "text"} />
            )}
          </div>
        );
      })}
    </div>
  );
}
