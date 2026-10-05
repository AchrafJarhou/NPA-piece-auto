// Retire les balises HTML d'un texte venant de WordPress et décode les entités
export function stripHtml(html) {
  if (!html) return "";
  const element = document.createElement("div");
  element.innerHTML = html;
  return (element.textContent || "").replace(/\s+/g, " ").trim();
}
