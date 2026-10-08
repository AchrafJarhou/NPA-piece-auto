// Retire les balises HTML d'un texte venant de WordPress et décode les entités.
// DOMParser crée un document inerte : contrairement à innerHTML, aucune image n'est
// chargée et aucun attribut onerror n'est exécuté pendant l'analyse.
export function stripHtml(html) {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  return (doc.body.textContent || "").replace(/\s+/g, " ").trim();
}
