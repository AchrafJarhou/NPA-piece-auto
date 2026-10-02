import "./index.scss";

function Advantages() {
  return (
    <div className="advantages">
      <div className="advantage-item">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="black"
          strokeWidth="1.5"
        >
          <rect x="1" y="7" width="13" height="9" />
          <path d="M14 10h4l3 3v3h-7z" />
          <circle cx="5" cy="18" r="1.5" />
          <circle cx="17" cy="18" r="1.5" />
        </svg>
        <p>Livraison offerte dès 50€ d'achat</p>
      </div>

      <div className="advantage-item">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="black"
          strokeWidth="1.5"
        >
          <rect x="4" y="10" width="16" height="10" rx="1" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
        <p>Paiement sécurisé 100% sécurisé</p>
      </div>

      <div className="advantage-item">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="black"
          strokeWidth="1.5"
        >
          <rect x="3" y="9" width="18" height="12" />
          <path d="M3 9l9-5 9 5" />
          <line x1="12" y1="9" x2="12" y2="21" />
        </svg>
        <p>Échantillon offert à chaque commande</p>
      </div>

      <div className="advantage-item">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="black"
          strokeWidth="1.5"
        >
          <path d="M4 15v-3a8 8 0 0 1 16 0v3" />
          <rect x="2" y="15" width="4" height="5" rx="1" />
          <rect x="18" y="15" width="4" height="5" rx="1" />
        </svg>
        <p>Service client à votre écoute</p>
      </div>
    </div>
  );
}

export default Advantages;
