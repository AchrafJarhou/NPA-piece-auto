import "./index.scss";
import { Link } from "react-router-dom";

// items : [{ label, to }] ; le dernier élément est la page actuelle (sans lien)
export default function Breadcrumb({ items }) {
  return (
    <nav className="breadcrumb" aria-label="Fil d'Ariane">
      <ol className="breadcrumb-list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${index}-${item.label}`} className="breadcrumb-item">
              {isLast || !item.to ? (
                <span
                  className="breadcrumb-current"
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <Link to={item.to} onClick={item.onClick} className="breadcrumb-link">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
