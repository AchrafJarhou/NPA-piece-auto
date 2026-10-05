// Formate un montant WooCommerce (en centimes) : "2980" -> "29,80 €"
export function formatPrice(amount, minorUnit = 2) {
  const value = Number(amount || 0) / 10 ** minorUnit;
  return `${value.toFixed(minorUnit).replace(".", ",")} €`;
}
