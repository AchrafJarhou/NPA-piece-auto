// Appel à WordPress pour un client connecté : le cookie de connexion (HttpOnly, illisible
// par JavaScript) est envoyé par le navigateur, et le code CSRF reçu à la connexion est
// ajouté dans l'en-tête X-NPA-CSRF (exigé par mu-plugins/auth.php pour POST, PUT, DELETE).
export function apiFetch(url, { csrf, headers, ...options } = {}) {
  return fetch(url, {
    credentials: "include",
    ...options,
    headers: { ...headers, ...(csrf && { "X-NPA-CSRF": csrf }) },
  });
}
