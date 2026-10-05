// Mémorise le véhicule choisi dans le navigateur pour le retrouver après un rechargement.
// La donnée peut avoir été modifiée ou être périmée : on vérifie son format ici,
// et le serveur vérifie de toute façon que le véhicule existe.

const STORAGE_KEY = "npa_vehicle";

const isId = (value) => value === "" || /^\d+$/.test(String(value));

export function loadSavedVehicle() {
  try {
    const vehicle = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const valid =
      vehicle &&
      Number.isInteger(vehicle.id) &&
      vehicle.id > 0 &&
      [vehicle.brandId, vehicle.modelId, vehicle.engineId].every(isId) &&
      [vehicle.brand, vehicle.model, vehicle.engine].every(
        (name) => typeof name === "string" && name.length <= 100,
      );
    return valid ? vehicle : null;
  } catch {
    return null;
  }
}

export function saveVehicle(vehicle) {
  try {
    if (vehicle) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicle));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Stockage indisponible (navigation privée...) : le véhicule ne sera pas mémorisé
  }
}
