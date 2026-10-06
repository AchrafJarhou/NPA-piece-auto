// Réponse du plugin JWT quand le jeton est refusé (signature, expiration, format…)
export function isInvalidTokenResponse(data) {
  return (
    typeof data?.code === "string" &&
    data.code.startsWith("jwt_auth_") &&
    data.code !== "jwt_auth_valid_token"
  );
}
