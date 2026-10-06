import "./index.scss";

const steps = ["Panier en cours", "Coordonnées & livraison", "Paiement sécurisé"];

// En-tête "Votre commande NPA" avec les étapes du tunnel de commande (current : 1, 2 ou 3)
export default function CheckoutSteps({ current = 1 }) {
  return (
    <div className="checkout-steps">
      <h1 className="checkout-steps-title">Votre commande NPA</h1>
      <ol className="checkout-steps-list">
        {steps.map((label, index) => {
          const step = index + 1;
          return (
            <li
              key={label}
              className={`checkout-steps-item ${step <= current ? "is-done" : ""}`}
              aria-current={step === current ? "step" : undefined}
            >
              {index > 0 && <span className="checkout-steps-line" aria-hidden="true" />}
              <span className="checkout-steps-number">{step}</span>
              <span className="checkout-steps-label">
                {step}. {label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
