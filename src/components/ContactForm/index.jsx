import "./index.scss";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { site } from "../../config/site";
import { normalizeVehicle } from "../../utils/vehicleCheck";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[0-9+\s.\-()]{6,20}$/;

// Mêmes règles que mu-plugins/contact.php : le serveur revérifie tout
const validate = (form) => {
  const errors = {};
  if (!form.name.trim()) errors.name = "Indiquez votre nom.";
  if (!emailPattern.test(form.email.trim())) errors.email = "Entrez une adresse e-mail valide.";
  if (form.phone.trim() && !phonePattern.test(form.phone.trim())) {
    errors.phone = "Numéro de téléphone invalide.";
  }
  if (!site.contact.subjects.some((subject) => subject.value === form.subject)) {
    errors.subject = "Choisissez un sujet.";
  }
  if (form.vehicle.trim() && !normalizeVehicle(form.vehicle)) {
    errors.vehicle = "Format attendu : immatriculation AB-123-CD ou VIN à 17 caractères.";
  }
  const length = form.message.trim().length;
  if (length < 10 || length > 3000) {
    errors.message = "Votre message doit contenir entre 10 et 3000 caractères.";
  }
  if (!form.consent) errors.consent = "Merci d'accepter le traitement de vos données.";
  return errors;
};

// Formulaire de contact : envoie le message à WordPress (route /custom/v1/contact)
export default function ContactForm() {
  const [searchParams] = useSearchParams();
  const profile = useSelector((state) => state.user.profile);
  const savedVehicle = useSelector((state) => state.cart.vehicleCheck);

  // Le sujet peut être présélectionné par un lien : /contact?sujet=devis
  const subjectFromUrl = searchParams.get("sujet");
  const [form, setForm] = useState({
    name: profile?.displayName || "",
    email: profile?.email || "",
    phone: "",
    subject: site.contact.subjects.some((s) => s.value === subjectFromUrl) ? subjectFromUrl : "",
    vehicle: savedVehicle || "",
    message: "",
    consent: false,
    website: "", // champ piège anti-robots, invisible
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | sent
  const [serverError, setServerError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validate(form);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setStatus("sending");
    setServerError("");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/wp-json/custom/v1/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          vehicle: form.vehicle.trim() ? normalizeVehicle(form.vehicle) : "",
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.data?.fields) setErrors(data.data.fields);
        throw new Error(data.message || "L'envoi a échoué.");
      }
      setStatus("sent");
    } catch (error) {
      setStatus("idle");
      setServerError(`${error.message} Vous pouvez aussi nous appeler au ${site.phone}.`);
    }
  };

  if (status === "sent") {
    return (
      <section className="contact-form contact-form-success" role="status">
        <h2 className="contact-form-title">{site.contact.successTitle}</h2>
        <p className="contact-form-text">{site.contact.successText}</p>
        <Link to="/catalogue" className="btn btn-primary">
          Retour au catalogue
        </Link>
      </section>
    );
  }

  // Champ + message d'erreur, reliés par aria-describedby
  const fieldProps = (name) => ({
    id: `contact-${name}`,
    name,
    value: form[name],
    onChange: handleChange,
    className: `contact-form-input ${errors[name] ? "has-error" : ""}`,
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": errors[name] ? `contact-${name}-error` : undefined,
  });
  const fieldError = (name) =>
    errors[name] && (
      <span id={`contact-${name}-error`} className="contact-form-error">
        {errors[name]}
      </span>
    );

  return (
    <section className="contact-form">
      <h2 className="contact-form-title">Écrivez-nous</h2>
      <p className="contact-form-text">
        Une question sur une pièce, un devis ou votre compte pro : nos techniciens vous
        répondent. Pour une identification précise, indiquez votre immatriculation ou VIN.
      </p>

      <form onSubmit={handleSubmit} noValidate className="contact-form-fields">
        <div className="contact-form-row">
          <div className="contact-form-field">
            <label htmlFor="contact-name" className="contact-form-label">
              Nom ou garage
            </label>
            <input {...fieldProps("name")} autoComplete="name" maxLength={100} />
            {fieldError("name")}
          </div>
          <div className="contact-form-field">
            <label htmlFor="contact-email" className="contact-form-label">
              E-mail
            </label>
            <input {...fieldProps("email")} type="email" autoComplete="email" />
            {fieldError("email")}
          </div>
        </div>

        <div className="contact-form-row">
          <div className="contact-form-field">
            <label htmlFor="contact-phone" className="contact-form-label">
              Téléphone <span className="contact-form-optional">(facultatif)</span>
            </label>
            <input {...fieldProps("phone")} type="tel" autoComplete="tel" maxLength={20} />
            {fieldError("phone")}
          </div>
          <div className="contact-form-field">
            <label htmlFor="contact-subject" className="contact-form-label">
              Sujet
            </label>
            <select {...fieldProps("subject")}>
              <option value="">Choisissez un sujet</option>
              {site.contact.subjects.map((subject) => (
                <option key={subject.value} value={subject.value}>
                  {subject.label}
                </option>
              ))}
            </select>
            {fieldError("subject")}
          </div>
        </div>

        <div className="contact-form-field">
          <label htmlFor="contact-vehicle" className="contact-form-label">
            Immatriculation ou VIN <span className="contact-form-optional">(facultatif)</span>
          </label>
          <input
            {...fieldProps("vehicle")}
            placeholder="AB-123-CD ou numéro VIN"
            maxLength={20}
            autoComplete="off"
          />
          {fieldError("vehicle")}
        </div>

        <div className="contact-form-field">
          <label htmlFor="contact-message" className="contact-form-label">
            Message
          </label>
          <textarea {...fieldProps("message")} rows={6} maxLength={3000} />
          {fieldError("message")}
        </div>

        {/* Champ piège : caché aux humains (et aux lecteurs d'écran), rempli par les robots */}
        <div className="contact-form-trap" aria-hidden="true">
          <label htmlFor="contact-website">Site web</label>
          <input
            id="contact-website"
            name="website"
            value={form.website}
            onChange={handleChange}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <label className="contact-form-consent">
          <input
            type="checkbox"
            name="consent"
            checked={form.consent}
            onChange={handleChange}
            aria-invalid={Boolean(errors.consent)}
          />
          <span>
            J'accepte que mes informations soient utilisées pour traiter ma demande (voir nos{" "}
            <Link to="/mentions-legales">mentions légales</Link>).
          </span>
        </label>
        {fieldError("consent")}

        {serverError && (
          <p className="contact-form-server-error" role="alert">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          className="btn btn-primary contact-form-submit"
          disabled={status === "sending"}
        >
          {status === "sending" ? "Envoi en cours…" : "Envoyer mon message"}
        </button>
      </form>
    </section>
  );
}
