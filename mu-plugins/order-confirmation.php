<?php

/**
 * Résumé d'une commande pour la page de confirmation (route GET /custom/v1/order-confirmation/{id}).
 * Accessible seulement :
 * - avec la clé secrète de la commande (?key=wc_order_...), reçue juste après le paiement ;
 * - ou par le client connecté à qui la commande appartient.
 * Ne renvoie ni e-mail ni téléphone : uniquement ce qu'affiche la page.
 */

add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/order-confirmation/(?P<id>\d+)', [
        'methods'             => 'GET',
        'callback'            => 'npa_order_confirmation',
        'permission_callback' => '__return_true',
        'args'                => [
            'id'  => ['validate_callback' => fn($value) => is_numeric($value)],
            'key' => ['sanitize_callback' => 'sanitize_text_field'],
        ],
    ]);
});

function npa_order_confirmation(WP_REST_Request $request)
{
    $order = wc_get_order((int) $request['id']);
    $key   = (string) $request->get_param('key');

    $is_owner   = $order && is_user_logged_in() && (int) $order->get_customer_id() === get_current_user_id();
    $key_is_ok  = $order && $key !== '' && hash_equals($order->get_order_key(), $key);

    // Même réponse si la commande n'existe pas ou si l'accès est refusé
    if (!$order || (!$is_owner && !$key_is_ok)) {
        return new WP_Error('order_not_found', 'Commande introuvable.', ['status' => 404]);
    }

    $shipping_methods = $order->get_shipping_methods();
    $shipping         = $shipping_methods ? reset($shipping_methods) : null;

    $items = array_map(function ($item) {
        $product = $item->get_product();
        $image   = $product ? wp_get_attachment_image_url($product->get_image_id(), 'thumbnail') : '';
        return [
            'name'     => $item->get_name(),
            'quantity' => $item->get_quantity(),
            'sku'      => $product ? $product->get_sku() : '',
            'image'    => $image ?: '',
            'slug'     => $product ? $product->get_slug() : '',
            // Montant TTC de la ligne
            'total'    => wc_format_decimal((float) $item->get_total() + (float) $item->get_total_tax(), 2),
        ];
    }, array_values($order->get_items()));

    $address = $order->has_shipping_address()
        ? [
            'name'     => trim($order->get_shipping_first_name() . ' ' . $order->get_shipping_last_name()),
            'company'  => $order->get_shipping_company(),
            'address'  => trim($order->get_shipping_address_1() . ' ' . $order->get_shipping_address_2()),
            'postcode' => $order->get_shipping_postcode(),
            'city'     => $order->get_shipping_city(),
        ]
        : null;

    return rest_ensure_response([
        'id'             => $order->get_id(),
        'number'         => $order->get_order_number(),
        'status'         => $order->get_status(),
        'date'           => $order->get_date_created() ? $order->get_date_created()->date('c') : null,
        'first_name'     => $order->get_billing_first_name(),
        'payment_method' => $order->get_payment_method(),
        'payment_title'  => $order->get_payment_method_title(),
        'shipping'       => $shipping ? [
            'method_id' => $shipping->get_method_id(),
            'title'     => $shipping->get_name(),
        ] : null,
        'shipping_address' => $address,
        'customer_note'  => $order->get_customer_note(),
        'items'          => $items,
        'totals'         => [
            // Articles TTC avant remise (sous-total + TVA de chaque ligne)
            'items'     => wc_format_decimal(array_sum(array_map(
                fn($item) => (float) $item->get_subtotal() + (float) $item->get_subtotal_tax(),
                array_values($order->get_items())
            )), 2),
            'discount'  => wc_format_decimal((float) $order->get_discount_total() + (float) $order->get_discount_tax(), 2),
            'shipping'  => wc_format_decimal((float) $order->get_shipping_total() + (float) $order->get_shipping_tax(), 2),
            'tax'       => wc_format_decimal($order->get_total_tax(), 2),
            'total'     => wc_format_decimal($order->get_total(), 2),
        ],
    ]);
}
