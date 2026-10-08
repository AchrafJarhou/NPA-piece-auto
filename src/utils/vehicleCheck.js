// Plaque au format SIV (AB-123-CD) ou numéro VIN (17 caractères, sans I, O ni Q)
const PLATE_PATTERN = /^[A-Z]{2}-?\d{3}-?[A-Z]{2}$/;
const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/;

// Renvoie la plaque mise en forme (AB-123-CD) ou le VIN en majuscules, ou null si invalide
export function normalizeVehicle(value) {
  const cleaned = String(value || "").toUpperCase().replace(/\s+/g, "");
  if (PLATE_PATTERN.test(cleaned)) {
    const letters = cleaned.replace(/-/g, "");
    return `${letters.slice(0, 2)}-${letters.slice(2, 5)}-${letters.slice(5)}`;
  }
  if (VIN_PATTERN.test(cleaned)) return cleaned;
  return null;
}
