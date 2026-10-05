<?php

add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/products', [
        'methods'             => 'GET',
        'callback'            => 'headless_get_products_with_variation_stock',
        'permission_callback' => '__return_true',
    ]);

    // Compteurs des filtres du catalogue (même paramètres que /products, véhicule compris)
    register_rest_route('custom/v1', '/products-collection-data', [
        'methods'             => 'GET',
        'callback'            => 'headless_get_products_collection_data',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('custom/v1', '/products/(?P<id>[\w-]+)', [
        'methods'             => 'GET',
        'callback'            => 'headless_get_single_product_with_variation_stock',
        'permission_callback' => '__return_true',
    ]);
});

function headless_enrich_variation_stock($product_data)
{
    $variations = is_object($product_data) ? ($product_data->variations ?? null) : ($product_data['variations'] ?? null);

    if (empty($variations) || !is_array($variations)) {
        return $product_data;
    }

    $enriched = array_map(function ($variation) {
        $variation_id      = is_object($variation) ? ($variation->id ?? null) : ($variation['id'] ?? null);
        $variation_product = $variation_id ? wc_get_product($variation_id) : null;

        $is_in_stock  = $variation_product ? $variation_product->is_in_stock() : null;
        $stock_status = $variation_product ? $variation_product->get_stock_status() : null;

        if (is_object($variation)) {
            $variation->is_in_stock  = $is_in_stock;
            $variation->stock_status = $stock_status;
        } else {
            $variation['is_in_stock']  = $is_in_stock;
            $variation['stock_status'] = $stock_status;
        }

        return $variation;
    }, $variations);

    if (is_object($product_data)) {
        $product_data->variations = $enriched;
    } else {
        $product_data['variations'] = $enriched;
    }

    return $product_data;
}

/**
 * Transforme le paramètre "vehicle" (identifiant d'un véhicule de la taxonomie
 * product_vehicle) en liste de produits compatibles, passée à l'API WooCommerce
 * avec "include". Le véhicule est vérifié côté serveur : seul un identifiant
 * existant dans la taxonomie est accepté. Les véhicules enfants sont inclus
 * (choisir un modèle renvoie les pièces de toutes ses motorisations).
 */
function headless_store_query_params($request)
{
    $params = $request->get_query_params();
    unset($params['vehicle'], $params['include']);

    $raw_vehicle = $request->get_param('vehicle');
    if ($raw_vehicle === null || $raw_vehicle === '') {
        return $params;
    }

    $vehicle_id = absint($raw_vehicle);
    $vehicle    = $vehicle_id ? get_term($vehicle_id, 'product_vehicle') : null;
    if (!$vehicle || is_wp_error($vehicle)) {
        return new WP_Error('invalid_vehicle', 'Véhicule inconnu.', ['status' => 400]);
    }

    $product_ids = get_posts([
        'post_type'      => 'product',
        'post_status'    => 'publish',
        'fields'         => 'ids',
        'posts_per_page' => -1,
        'tax_query'      => [[
            'taxonomy'         => 'product_vehicle',
            'field'            => 'term_id',
            'terms'            => $vehicle_id,
            'include_children' => true,
        ]],
    ]);

    // Aucun produit compatible : un identifiant inexistant garantit une liste vide
    $params['include'] = $product_ids ?: [PHP_INT_MAX];
    return $params;
}

function headless_get_products_collection_data($request)
{
    $params = headless_store_query_params($request);
    if (is_wp_error($params)) {
        return $params;
    }

    $store_request = new WP_REST_Request('GET', '/wc/store/v1/products/collection-data');
    $store_request->set_query_params($params);
    $store_response = rest_do_request($store_request);

    if ($store_response->is_error()) {
        $error = $store_response->as_error();
        return $error instanceof WP_Error
            ? $error
            : new WP_Error('collection_data_failed', 'Impossible de calculer les filtres.', ['status' => 500]);
    }

    return rest_ensure_response($store_response->get_data());
}

function headless_get_products_with_variation_stock($request)
{
    if (!function_exists('wc_get_product')) {
        return new WP_Error('woocommerce_unavailable', 'WooCommerce est requis pour cette fonctionnalite.', ['status' => 500]);
    }
    $params = headless_store_query_params($request);
    if (is_wp_error($params)) {
        return $params;
    }

    $store_request = new WP_REST_Request('GET', '/wc/store/v1/products');
    $store_request->set_query_params($params);

    $store_response = rest_do_request($store_request);

    if ($store_response->is_error()) {
        $error = $store_response->as_error();
        return $error instanceof WP_Error
            ? $error
            : new WP_Error('products_fetch_failed', 'Impossible de recuperer les produits.', ['status' => 500]);
    }

    $products = array_map('headless_enrich_variation_stock', $store_response->get_data());

    $response = rest_ensure_response($products);
    $store_headers = $store_response->get_headers();
    foreach (['X-WP-Total', 'X-WP-TotalPages'] as $header) {
        if (isset($store_headers[$header])) {
            $response->header($header, $store_headers[$header]);
        }
    }

    return $response;
}

function headless_resolve_product_id($raw_id)
{
    if (is_numeric($raw_id)) {
        return (int) $raw_id;
    }

    $query = new WP_Query([
        'name'           => sanitize_title($raw_id),
        'post_type'      => 'product',
        'post_status'    => 'publish',
        'posts_per_page' => 1,
        'fields'         => 'ids',
    ]);

    return $query->have_posts() ? (int) $query->posts[0] : 0;
}

function headless_get_single_product_with_variation_stock($request)
{
    if (!function_exists('wc_get_product')) {
        return new WP_Error('woocommerce_unavailable', 'WooCommerce est requis pour cette fonctionnalite.', ['status' => 500]);
    }

    $product_id = headless_resolve_product_id($request->get_param('id'));

    if (!$product_id) {
        return new WP_Error('product_not_found', 'Produit introuvable.', ['status' => 404]);
    }

    $store_request  = new WP_REST_Request('GET', '/wc/store/v1/products/' . $product_id);
    $store_response = rest_do_request($store_request);

    if ($store_response->is_error()) {
        $error = $store_response->as_error();
        return $error instanceof WP_Error
            ? $error
            : new WP_Error('product_fetch_failed', 'Impossible de recuperer le produit.', ['status' => 500]);
    }

    return rest_ensure_response(headless_enrich_variation_stock($store_response->get_data()));
}
