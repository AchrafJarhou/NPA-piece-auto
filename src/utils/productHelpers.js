import { stripHtml } from "./stripHtml";

// Caractéristiques : les attributs qui ne servent pas à choisir une variante
export function getProductSpecs(product) {
  return (product?.attributes || [])
    .filter((attribute) => !attribute.has_variations && attribute.terms?.length)
    .map((attribute) => ({
      name: stripHtml(attribute.name),
      value: attribute.terms.map((term) => stripHtml(term.name)).join(", "),
    }));
}

// Pourcentage de remise arrondi, ou 0 si le produit n'est pas en promo
export function getDiscountPercent(prices) {
  const regular = Number(prices?.regular_price);
  const price = Number(prices?.price);
  if (!regular || !price || price >= regular) return 0;
  return Math.round((1 - price / regular) * 100);
}
