<?php

/**
 * Panier (API WooCommerce Store) :
 * - tant que le client n'a pas saisi d'adresse, les frais de port sont calculés
 *   pour le code postal du comptoir (zone Marseille & PACA) ;
 * - les frais de port saisis dans l'admin sont des prix TTC ;
 * - le retrait comptoir est le mode de livraison choisi par défaut ;
 * - ajoute la marque de chaque article (extensions.npa.brand) ;
 * - ajoute les seuils de livraison gratuite (extensions.npa.free_shipping).
 */

// Code postal par défaut : celui de la boutique, tant que le client n'en a pas saisi
add_filter('woocommerce_customer_get_shipping_postcode', function ($postcode) {
    return $postcode !== '' ? $postcode : get_option('woocommerce_store_postcode', '');
});

// Frais de port saisis TTC dans l'admin (comme les prix des produits) : WooCommerce les
// considère HT et ajoute la TVA, on extrait donc la TVA du montant saisi.
// Ex. Colissimo saisi 7,50 => 6,25 HT + 1,25 TVA, le client paie 7,50 €.
add_filter('woocommerce_package_rates', function ($rates) {
    if (!wc_tax_enabled()) {
        return $rates;
    }
    $tax_rates = WC_Tax::get_shipping_tax_rates();
    foreach ($rates as $rate) {
        $cost = (float) $rate->get_cost();
        if ($cost <= 0 || empty($rate->get_taxes())) {
            continue;
        }
        $taxes = WC_Tax::calc_tax($cost, $tax_rates, true);
        $rate->set_cost($cost - array_sum($taxes));
        $rate->set_taxes($taxes);
    }
    return $rates;
}, 5);

// Rappel dans l'admin : le coût d'un forfait de livraison se saisit TTC
add_filter('woocommerce_shipping_instance_form_fields_flat_rate', function ($fields) {
    if (isset($fields['cost'])) {
        $fields['cost']['description'] = 'Prix TTC payé par le client (la TVA est déduite automatiquement). ' . ($fields['cost']['description'] ?? '');
    }
    return $fields;
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

// Tant que le client n'a pas choisi de mode, on présélectionne le retrait comptoir
// (WooCommerce choisirait sinon le premier mode payant)
add_filter('woocommerce_shipping_chosen_method', function ($default, $rates) {
    foreach ($rates as $rate_id => $rate) {
        if ($rate->get_method_id() === 'local_pickup') {
            return $rate_id;
        }
    }
    return $default;
}, 10, 2);

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

    // Seuils de livraison gratuite réglés dans WooCommerce (ex. navette offerte dès 80 €),
    // pour afficher "Offerte dès…" sous le mode payant du même nom
    woocommerce_store_api_register_endpoint_data([
        'endpoint'        => \Automattic\WooCommerce\StoreApi\Schemas\V1\CartSchema::IDENTIFIER,
        'namespace'       => 'npa',
        'data_callback'   => function () {
            $offers = [];
            if (!WC()->cart) {
                return ['free_shipping' => $offers];
            }
            foreach (WC()->cart->get_shipping_packages() as $package) {
                $zone = WC_Shipping_Zones::get_zone_matching_package($package);
                foreach ($zone->get_shipping_methods(true) as $method) {
                    if ($method->id === 'free_shipping' && in_array($method->requires, ['min_amount', 'either'], true)) {
                        $offers[] = [
                            'title'      => $method->get_title(),
                            'min_amount' => wc_format_decimal($method->min_amount),
                        ];
                    }
                }
            }
            return ['free_shipping' => $offers];
        },
        'schema_callback' => function () {
            return [
                'free_shipping' => [
                    'description' => 'Modes offerts à partir d\'un montant (titre et montant TTC)',
                    'type'        => 'array',
                    'readonly'    => true,
                ],
            ];
        },
        'schema_type'     => ARRAY_A,
    ]);
});
