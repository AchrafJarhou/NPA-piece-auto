// Textes complémentaires affichés en haut du catalogue, par catégorie WooCommerce.
// La clé est le slug de la catégorie. Tous les champs sont optionnels :
//   badge          : étiquette jaune au-dessus du titre
//   label          : petit texte à côté du badge
//   recommendation : encadré « Recommandation d'atelier » au-dessus des produits
// Le titre et le texte d'introduction viennent de WooCommerce
// (nom et description de la catégorie).

export const categoryContent = {
  freinage: {
    badge: "100% homologué ECE R90",
    label: "Rayon Technique 02-FREIN",
    recommendation:
      "Lors du remplacement des plaquettes avant, inspectez toujours l'épaisseur minimale de vos disques. Ne montez jamais de plaquettes neuves sur disques voilés ou hors tolérance.",
  },
};

// Texte utilisé quand la catégorie n'a pas de description dans WooCommerce
export const defaultCatalogueIntro =
  "Pièces neuves garanties constructeur, disponibles en retrait 2H au comptoir 158 Capelette ou livrées en 24h chrono chez vous ou en atelier partenaire.";
