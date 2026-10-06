<?php

/**
 * Panier (API WooCommerce Store) :
 * - tant que le client n'a pas saisi d'adresse, les frais de port sont calculés
 *   pour le code postal du comptoir (zone Marseille & PACA) ;
 * - ajoute la marque de chaque article (extensions.npa.brand).
 */

// Code postal par défaut : celui de la boutique, tant que le client n'en a pas saisi
add_filter('woocommerce_customer_get_shipping_postcode', function ($postcode) {
    return $postcode !== '' ? $postcode : get_option('woocommerce_store_postcode', '');
});

// Quand la livraison gratuite est disponible, on masque le même mode en version payante
// (ex. "Navette express" offerte dès 80 € : la navette à 9,90 € disparaît)
add_filter('woocommerce_package_rates', function ($rates) {
    $free_titles = [];
    foreach ($rates as $rate) {
        if ($rate->get_method_id() === 'free_shipping') {
            $free_titles[] = $rate->get_label();
        }
    }
    foreach ($rates as $rate_id => $rate) {
        if ($rate->get_method_id() === 'flat_rate' && in_array($rate->get_label(), $free_titles, true)) {
            unset($rates[$rate_id]);
        }
    }
    return $rates;
}, 100);

// Marque de l'article dans les réponses du panier
add_action('woocommerce_blocks_loaded', function () {
    if (!function_exists('woocommerce_store_api_register_endpoint_data')) {
        return;
    }

    woocommerce_store_api_register_endpoint_data([
        'endpoint'        => \Automattic\WooCommerce\StoreApi\Schemas\V1\CartItemSchema::IDENTIFIER,
        'namespace'       => 'npa',
        'data_callback'   => function ($cart_item) {
            $brands = taxonomy_exists('product_brand')
                ? wp_get_post_terms($cart_item['product_id'], 'product_brand', ['fields' => 'names'])
                : [];
            return [
                'brand' => !is_wp_error($brands) && $brands ? $brands[0] : '',
            ];
        },
        'schema_callback' => function () {
            return [
                'brand' => [
                    'description' => 'Marque du produit',
                    'type'        => 'string',
                    'readonly'    => true,
                ],
            ];
        },
        'schema_type'     => ARRAY_A,
    ]);
});
