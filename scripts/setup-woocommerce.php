<?php

/**
 * Configure WooCommerce pour le site NPA : TVA, adresse de la boutique,
 * zones et modes de livraison, paiement au retrait comptoir.
 *
 * Utilisation (depuis la racine du projet) :
 *   Windows : C:\wamp64\bin\php\php8.4.0\php.exe scripts/setup-woocommerce.php C:/wamp64/www/wordpress-NPA
 *   Mac     : php scripts/setup-woocommerce.php /Applications/MAMP/htdocs/wordpress-NPA
 *
 * Le script peut être relancé : les zones de livraison créées par lui sont
 * supprimées puis recréées avec les valeurs ci-dessous.
 */

/* ---------- Réglages à adapter ---------- */

$config = [
    'store' => [
        'address'  => '158 Avenue de la Capelette',
        'city'     => 'Marseille',
        'postcode' => '13010',
        'country'  => 'FR',
    ],
    'vat_rate'       => '20.0000',
    'pickup_title'   => 'Retrait comptoir Capelette',
    'shuttle_title'  => 'Navette express 13 / PACA (24h)',
    'shuttle_cost'   => '9.90', // À CONFIRMER AVEC LE CLIENT : prix de la navette sous le seuil de gratuité
    'shuttle_free_from' => '80', // navette offerte à partir de ce montant (TTC)
    'colissimo_title' => 'Colissimo domicile 48h',
    'colissimo_cost' => '7.50',
    // Départements de la zone "Marseille & PACA" (codes postaux)
    'paca_postcodes' => ['13*', '83*', '84*', '04*', '05*', '06*'],
];

/* ---------- Chargement de WordPress ---------- */

if (php_sapi_name() !== 'cli') {
    exit("Ce script se lance en ligne de commande.\n");
}
$wordpressPath = rtrim($argv[1] ?? '', '/\\');
if (!$wordpressPath || !file_exists($wordpressPath . '/wp-load.php')) {
    exit("Indiquez le dossier de WordPress, ex. : php scripts/setup-woocommerce.php C:/wamp64/www/wordpress-NPA\n");
}
$_SERVER['HTTP_HOST']   = 'localhost';
$_SERVER['REQUEST_URI'] = '/';
require $wordpressPath . '/wp-load.php';
if (!class_exists('WooCommerce')) {
    exit("WooCommerce n'est pas actif sur ce WordPress.\n");
}

/* ---------- Boutique et TVA ---------- */

update_option('woocommerce_store_address', $config['store']['address']);
update_option('woocommerce_store_city', $config['store']['city']);
update_option('woocommerce_store_postcode', $config['store']['postcode']);
update_option('woocommerce_default_country', $config['store']['country']);
update_option('woocommerce_currency', 'EUR');
// Frais de port calculés depuis l'adresse de la boutique tant que le client n'a pas saisi la sienne
update_option('woocommerce_default_customer_address', 'base');
update_option('woocommerce_ship_to_countries', 'specific');
update_option('woocommerce_specific_ship_to_countries', [$config['store']['country']]);

// Prix saisis TTC, affichés TTC, TVA calculée par WooCommerce
update_option('woocommerce_calc_taxes', 'yes');
update_option('woocommerce_prices_include_tax', 'yes');
update_option('woocommerce_tax_display_shop', 'incl');
update_option('woocommerce_tax_display_cart', 'incl');
update_option('woocommerce_tax_based_on', 'base');
echo "Boutique et TVA configurées.\n";

$hasFrenchRate = false;
foreach (WC_Tax::get_rates_for_tax_class('') as $rate) {
    if ($rate->tax_rate_country === 'FR') {
        $hasFrenchRate = true;
    }
}
if (!$hasFrenchRate) {
    WC_Tax::_insert_tax_rate([
        'tax_rate_country'  => 'FR',
        'tax_rate'          => $config['vat_rate'],
        'tax_rate_name'     => 'TVA',
        'tax_rate_priority' => 1,
        'tax_rate_compound' => 0,
        'tax_rate_shipping' => 1,
        'tax_rate_order'    => 0,
        'tax_rate_class'    => '',
    ]);
    echo "Taux de TVA France " . (float) $config['vat_rate'] . " % ajouté.\n";
}

/* ---------- Zones de livraison ---------- */

function npa_add_method($zone, $type, $settings)
{
    $instanceId = $zone->add_shipping_method($type);
    update_option("woocommerce_{$type}_{$instanceId}_settings", array_merge(['tax_status' => 'taxable'], $settings));
}

// On supprime les zones créées précédemment par ce script
foreach (WC_Shipping_Zones::get_zones() as $existing) {
    if (in_array($existing['zone_name'], ['Marseille & PACA', 'France'], true)) {
        WC_Shipping_Zones::delete_zone($existing['zone_id']);
    }
}

$paca = new WC_Shipping_Zone();
$paca->set_zone_name('Marseille & PACA');
$paca->set_zone_order(1);
foreach ($config['paca_postcodes'] as $postcode) {
    $paca->add_location($postcode, 'postcode');
}
$paca->add_location($config['store']['country'], 'country');
$paca->save();
npa_add_method($paca, 'local_pickup', ['title' => $config['pickup_title'], 'cost' => '0']);
npa_add_method($paca, 'free_shipping', [
    'title'      => $config['shuttle_title'],
    'requires'   => 'min_amount',
    'min_amount' => $config['shuttle_free_from'],
]);
npa_add_method($paca, 'flat_rate', ['title' => $config['shuttle_title'], 'cost' => $config['shuttle_cost']]);
npa_add_method($paca, 'flat_rate', ['title' => $config['colissimo_title'], 'cost' => $config['colissimo_cost']]);

$france = new WC_Shipping_Zone();
$france->set_zone_name('France');
$france->set_zone_order(2);
$france->add_location($config['store']['country'], 'country');
$france->save();
npa_add_method($france, 'local_pickup', ['title' => $config['pickup_title'], 'cost' => '0']);
npa_add_method($france, 'flat_rate', ['title' => $config['colissimo_title'], 'cost' => $config['colissimo_cost']]);

echo "Zones de livraison créées : Marseille & PACA, France.\n";

/* ---------- Paiement au retrait comptoir ---------- */

$cod = get_option('woocommerce_cod_settings', []);
update_option('woocommerce_cod_settings', array_merge($cod, [
    'enabled'            => 'yes',
    'title'              => 'Paiement au comptoir lors du retrait',
    'description'        => 'Réglez en espèces ou par carte bancaire au comptoir Capelette.',
    'instructions'       => 'Votre commande vous attend au comptoir : réglez-la lors du retrait.',
    'enable_for_methods' => ['local_pickup'],
    'enable_for_virtual' => 'no',
]));
echo "Paiement au retrait activé (réservé au retrait comptoir).\n";

WC_Cache_Helper::get_transient_version('shipping', true);
echo "\nTerminé.\n";
