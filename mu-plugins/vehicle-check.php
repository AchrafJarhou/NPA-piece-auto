<?php

/**
 * Vérification de compatibilité : l'immatriculation ou le VIN saisi dans le panier
 * arrive avec la commande (extensions.npa.vehicle_check de l'API Store /checkout).
 * Il est enregistré sur la commande et affiché au magasin : fiche de la commande
 * dans l'admin et e-mails de commande.
 */

const NPA_VEHICLE_CHECK_META_KEY = '_npa_vehicle_check';

// Mêmes formats que src/utils/vehicleCheck.js : plaque AB-123-CD ou VIN à 17 caractères
function npa_normalize_vehicle_check($value)
{
    $cleaned = strtoupper(preg_replace('/\s+/', '', (string) $value));
    if (preg_match('/^[A-Z]{2}-?\d{3}-?[A-Z]{2}$/', $cleaned)) {
        $letters = str_replace('-', '', $cleaned);
        return substr($letters, 0, 2) . '-' . substr($letters, 2, 3) . '-' . substr($letters, 5);
    }
    if (preg_match('/^[A-HJ-NPR-Z0-9]{17}$/', $cleaned)) {
        return $cleaned;
    }
    return '';
}

// Champ accepté par l'API Store au moment de la commande
add_action('woocommerce_blocks_loaded', function () {
    if (!function_exists('woocommerce_store_api_register_endpoint_data')) {
        return;
    }

    woocommerce_store_api_register_endpoint_data([
        'endpoint'        => \Automattic\WooCommerce\StoreApi\Schemas\V1\CheckoutSchema::IDENTIFIER,
        'namespace'       => 'npa',
        'schema_callback' => function () {
            return [
                'vehicle_check' => [
                    'description' => 'Immatriculation ou VIN pour la vérification de compatibilité',
                    'type'        => ['string', 'null'],
                    'context'     => ['view', 'edit'],
                ],
            ];
        },
        'schema_type'     => ARRAY_A,
    ]);
});

// Enregistrement sur la commande (valeur revérifiée côté serveur)
add_action('woocommerce_store_api_checkout_update_order_from_request', function ($order, $request) {
    $extensions = $request->get_param('extensions');
    $vehicle    = npa_normalize_vehicle_check($extensions['npa']['vehicle_check'] ?? '');

    if ($vehicle) {
        $order->update_meta_data(NPA_VEHICLE_CHECK_META_KEY, $vehicle);
    } else {
        $order->delete_meta_data(NPA_VEHICLE_CHECK_META_KEY);
    }
}, 10, 2);

// Fiche de la commande dans l'admin, sous l'adresse de livraison
add_action('woocommerce_admin_order_data_after_shipping_address', function ($order) {
    $vehicle = $order->get_meta(NPA_VEHICLE_CHECK_META_KEY);
    if (!$vehicle) {
        return;
    }
    echo '<p><strong>Vérification de compatibilité :</strong><br>' . esc_html($vehicle) . '</p>';
});

// E-mails de commande (nouvelle commande pour le magasin, confirmation pour le client)
add_filter('woocommerce_email_order_meta_fields', function ($fields, $sent_to_admin, $order) {
    $vehicle = $order->get_meta(NPA_VEHICLE_CHECK_META_KEY);
    if ($vehicle) {
        $fields['npa_vehicle_check'] = [
            'label' => 'Véhicule à vérifier (immatriculation / VIN)',
            'value' => $vehicle,
        ];
    }
    return $fields;
}, 10, 3);
