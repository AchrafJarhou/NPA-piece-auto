import DOMPurify from "dompurify";

// Les liens qui s'ouvrent dans un nouvel onglet ne doivent pas pouvoir contrôler notre page
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A" && node.getAttribute("target") === "_blank") {
    node.setAttribute("rel", "noopener noreferrer");
  }
});

// Nettoie le HTML venant de WordPress (pages, produits, avis...) avant de l'injecter
// avec dangerouslySetInnerHTML : retire scripts, attributs onclick/onerror, liens javascript:...
export function sanitizeHtml(html) {
  if (!html) return "";
  return DOMPurify.sanitize(html, { ADD_ATTR: ["target"] });
}
