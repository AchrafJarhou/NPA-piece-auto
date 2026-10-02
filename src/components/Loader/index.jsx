import "./index.scss";

export default function Loader({ size = "md" }) {
  return (
    <div className={`loader loader-${size}`} role="status" aria-label="Chargement">
      <span className="loader-spinner" />
    </div>
  );
}
