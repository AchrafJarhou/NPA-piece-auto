import "./index.scss";

// Pages affichées : la première, la dernière, et 1 page de chaque côté de la page actuelle.
// Les trous sont remplacés par "…".
function getPages(current, total) {
  const pages = [];
  for (let page = 1; page <= total; page++) {
    if (page === 1 || page === total || Math.abs(page - current) <= 1) {
      pages.push(page);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }
  return pages;
}

export default function Pagination({ page, totalPages, total, perPage, onChange }) {
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  return (
    <nav className="pagination" aria-label="Pagination">
      <span className="pagination-summary">
        Affichage de {from} à {to} sur {total} référence{total > 1 ? "s" : ""}
      </span>
      {totalPages > 1 && (
        <div className="pagination-pages">
          {getPages(page, totalPages).map((item, index) =>
            item === "…" ? (
              <span key={`gap-${index}`} className="pagination-gap">
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                className={`pagination-page ${item === page ? "is-current" : ""}`}
                onClick={() => onChange(item)}
                aria-current={item === page ? "page" : undefined}
                aria-label={`Page ${item}`}
              >
                {item}
              </button>
            ),
          )}
        </div>
      )}
    </nav>
  );
}
