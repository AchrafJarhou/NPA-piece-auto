// Adresses client : format du endpoint custom/v1/customer (camelCase)
// et conversion vers le format attendu par l'API Store de WooCommerce.

export const emptyAddress = {
  firstName: "",
  lastName: "",
  company: "",
  address1: "",
  address2: "",
  postcode: "",
  city: "",
  country: "FR",
  phone: "",
};

// Une adresse "postale" (rue, CP, ville) suffit pour l'afficher ; le nom du
// destinataire peut manquer chez un pro dont l'adresse vient du SIRET.
export const hasPostalAddress = (address) =>
  Boolean(address?.address1 && address?.postcode && address?.city);

export const missingNames = (address) =>
  !address?.firstName?.trim() || !address?.lastName?.trim();

export const withDefaults = (address) => ({
  ...emptyAddress,
  ...Object.fromEntries(
    Object.entries(address || {}).filter(([, value]) => value !== null && value !== ""),
  ),
});

export const toStoreAddress = (address) => ({
  first_name: address.firstName,
  last_name: address.lastName,
  company: address.company,
  address_1: address.address1,
  address_2: address.address2,
  postcode: address.postcode,
  city: address.city,
  country: address.country,
  phone: address.phone,
});

export const addressLines = (address) =>
  [
    [address.firstName, address.lastName].filter(Boolean).join(" "),
    address.company,
    address.address1,
    address.address2,
    [address.postcode, address.city].filter(Boolean).join(" "),
    address.country && address.country !== "FR" ? address.country : "",
    address.phone,
  ].filter(Boolean);
