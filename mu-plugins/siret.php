<?php

// Récupère l'adresse d'un professionnel à partir de son SIRET via l'API
// publique https://recherche-entreprises.api.gouv.fr (gratuite, sans clé).

const NPA_SIRET_API_URL = 'https://recherche-entreprises.api.gouv.fr/search';

function npa_normalize_siret($siret)
{
    return preg_replace('/\s+/', '', (string) $siret);
}

function npa_is_valid_siret($siret)
{
    return (bool) preg_match('/^\d{14}$/', $siret);
}

/**
 * Renvoie l'adresse de l'établissement correspondant au SIRET :
 * - un tableau d'adresse (format du endpoint /customer) si trouvé,
 * - false si l'API répond qu'aucun établissement ne correspond,
 * - null si l'API est injoignable (on ne bloque pas l'utilisateur pour autant).
 */
function npa_fetch_company_address($siret)
{
    $url = add_query_arg([
        'q'        => $siret,
        'page'     => 1,
        'per_page' => 1,
    ], NPA_SIRET_API_URL);

    $response = wp_remote_get($url, ['timeout' => 8]);
    if (is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200) {
        return null;
    }

    $data    = json_decode(wp_remote_retrieve_body($response), true);
    $company = $data['results'][0] ?? null;
    if (!$company) {
        return false;
    }

    // La recherche plein texte peut renvoyer une entreprise proche : on ne
    // garde que l'établissement dont le SIRET correspond exactement.
    $etablissement = null;
    foreach ($company['matching_etablissements'] ?? [] as $candidate) {
        if (($candidate['siret'] ?? '') === $siret) {
            $etablissement = $candidate;
            break;
        }
    }
    if (!$etablissement && ($company['siege']['siret'] ?? '') === $siret) {
        $etablissement = $company['siege'];
    }
    if (!$etablissement) {
        return false;
    }

    $postcode = (string) ($etablissement['code_postal'] ?? '');
    $city     = (string) ($etablissement['libelle_commune'] ?? '');
    $full     = (string) ($etablissement['adresse'] ?? '');

    // Établissement en diffusion partielle : l'adresse n'est pas publique
    if ($full === '' || stripos($full, 'NON-DIFFUSIBLE') !== false) {
        return ['company' => (string) ($company['nom_complet'] ?? '')];
    }

    // "34 AVENUE DE L'OPERA 75002 PARIS" -> "34 AVENUE DE L'OPERA"
    $street = $full;
    if ($postcode !== '' && ($pos = strrpos($full, ' ' . $postcode)) !== false) {
        $street = substr($full, 0, $pos);
    }

    return [
        'company'  => (string) ($company['nom_complet'] ?? ''),
        'address1' => trim($street),
        'postcode' => $postcode,
        'city'     => $city,
        'country'  => 'FR',
    ];
}

/**
 * Remplit l'adresse de facturation et de livraison du client.
 * Les champs déjà renseignés par l'utilisateur ne sont pas écrasés.
 */
function npa_apply_company_address($user_id, $address)
{
    if (!class_exists('WC_Customer') || empty($address)) {
        return;
    }

    $customer = new WC_Customer($user_id);
    $setters  = [
        'company'  => 'company',
        'address1' => 'address_1',
        'postcode' => 'postcode',
        'city'     => 'city',
        'country'  => 'country',
    ];

    foreach (['billing', 'shipping'] as $type) {
        foreach ($setters as $key => $field) {
            if (empty($address[$key])) continue;
            $getter = "get_{$type}_{$field}";
            $setter = "set_{$type}_{$field}";
            if ($customer->$getter() === '') {
                $customer->$setter(sanitize_text_field($address[$key]));
            }
        }
    }

    $customer->save();
}
