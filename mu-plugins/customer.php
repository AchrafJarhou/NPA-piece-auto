<?php

add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/customer', [
        'methods'             => 'GET',
        'callback'            => 'headless_get_current_customer',
        'permission_callback' => function () {
            return is_user_logged_in();
        },
    ]);
});

add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/customer', [
        'methods'             => 'PUT',
        'callback'            => 'headless_update_current_customer',
        'permission_callback' => function () {
            return is_user_logged_in();
        },
    ]);
});

function headless_get_current_customer($request)
{
    if (!class_exists('WC_Customer')) {
        return new WP_Error('woocommerce_unavailable', 'WooCommerce est requis pour cette fonctionnalite.', ['status' => 500]);
    }

    $user_id  = get_current_user_id();
    $customer = new WC_Customer($user_id);

    return rest_ensure_response([
        'accountType'    => get_user_meta($user_id, 'npa_account_type', true) ?: 'particulier',
        'siret'          => get_user_meta($user_id, 'npa_siret', true) ?: null,
        'billing'        => [
            'firstName' => $customer->get_billing_first_name(),
            'lastName'  => $customer->get_billing_last_name(),
            'company'   => $customer->get_billing_company(),
            'address1'  => $customer->get_billing_address_1(),
            'address2'  => $customer->get_billing_address_2(),
            'city'      => $customer->get_billing_city(),
            'state'     => $customer->get_billing_state(),
            'postcode'  => $customer->get_billing_postcode(),
            'country'   => $customer->get_billing_country(),
            'phone'     => $customer->get_billing_phone(),
        ],
        'shipping'       => [
            'firstName' => $customer->get_shipping_first_name(),
            'lastName'  => $customer->get_shipping_last_name(),
            'company'   => $customer->get_shipping_company(),
            'address1'  => $customer->get_shipping_address_1(),
            'address2'  => $customer->get_shipping_address_2(),
            'city'      => $customer->get_shipping_city(),
            'state'     => $customer->get_shipping_state(),
            'postcode'  => $customer->get_shipping_postcode(),
            'country'   => $customer->get_shipping_country(),
            'phone'     => $customer->get_shipping_phone(),
        ],
        'ordersCount'    => function_exists('wc_get_customer_order_count') ? wc_get_customer_order_count($user_id) : null,
        'totalSpent'     => function_exists('wc_get_customer_total_spent') ? wc_get_customer_total_spent($user_id) : null,
    ]);
}

const HEADLESS_CUSTOMER_FIELD_MAX_LENGTH = 191;

function headless_validate_address_fields($fields)
{
    $errors = [];
    $text_fields = ['firstName', 'lastName', 'company', 'address1', 'address2', 'city', 'state'];

    foreach ($text_fields as $key) {
        if (array_key_exists($key, $fields) && mb_strlen((string) $fields[$key]) > HEADLESS_CUSTOMER_FIELD_MAX_LENGTH) {
            $errors[] = $key;
        }
    }

    if (array_key_exists('postcode', $fields) && $fields['postcode'] !== '' && !preg_match('/^[A-Za-z0-9\-\s]{1,20}$/', (string) $fields['postcode'])) {
        $errors[] = 'postcode';
    }

    if (array_key_exists('phone', $fields) && $fields['phone'] !== '' && !preg_match('/^[0-9+\-\s().]{1,30}$/', (string) $fields['phone'])) {
        $errors[] = 'phone';
    }

    if (array_key_exists('country', $fields) && $fields['country'] !== '') {
        $countries = (function_exists('WC') && WC()->countries) ? array_keys(WC()->countries->get_countries()) : [];
        if (!in_array(strtoupper((string) $fields['country']), $countries, true)) {
            $errors[] = 'country';
        }
    }

    return $errors;
}

function headless_update_current_customer($request)
{
    if (!class_exists('WC_Customer')) {
        return new WP_Error('woocommerce_unavailable', 'WooCommerce est requis pour cette fonctionnalité.', ['status' => 500]);
    }

    $user_id  = get_current_user_id();
    $customer = new WC_Customer($user_id);
    $params   = $request->get_json_params();

    $billing  = (isset($params['billing']) && is_array($params['billing'])) ? $params['billing'] : null;
    $shipping = (isset($params['shipping']) && is_array($params['shipping'])) ? $params['shipping'] : null;

    if ($billing !== null) {
        $errors = headless_validate_address_fields($billing);
        if (!empty($errors)) {
            return new WP_Error('invalid_billing_fields', 'Champs billing invalides: ' . implode(', ', $errors) . '.', ['status' => 400]);
        }
    }
    if ($shipping !== null) {
        $errors = headless_validate_address_fields($shipping);
        if (!empty($errors)) {
            return new WP_Error('invalid_shipping_fields', 'Champs shipping invalides: ' . implode(', ', $errors) . '.', ['status' => 400]);
        }
    }

    if ($billing !== null) {
        $b = $billing;

        if (array_key_exists('firstName', $b)) $customer->set_billing_first_name(sanitize_text_field($b['firstName']));
        if (array_key_exists('lastName', $b))  $customer->set_billing_last_name(sanitize_text_field($b['lastName']));
        if (array_key_exists('company', $b))   $customer->set_billing_company(sanitize_text_field($b['company']));
        if (array_key_exists('address1', $b))  $customer->set_billing_address_1(sanitize_text_field($b['address1']));
        if (array_key_exists('address2', $b))  $customer->set_billing_address_2(sanitize_text_field($b['address2']));
        if (array_key_exists('city', $b))      $customer->set_billing_city(sanitize_text_field($b['city']));
        if (array_key_exists('state', $b))     $customer->set_billing_state(sanitize_text_field($b['state']));
        if (array_key_exists('postcode', $b))  $customer->set_billing_postcode(sanitize_text_field($b['postcode']));
        if (array_key_exists('country', $b))   $customer->set_billing_country(sanitize_text_field(strtoupper($b['country'])));
        if (array_key_exists('phone', $b))     $customer->set_billing_phone(sanitize_text_field($b['phone']));
    }

    if ($shipping !== null) {
        $s = $shipping;

        if (array_key_exists('firstName', $s)) $customer->set_shipping_first_name(sanitize_text_field($s['firstName']));
        if (array_key_exists('lastName', $s))  $customer->set_shipping_last_name(sanitize_text_field($s['lastName']));
        if (array_key_exists('company', $s))   $customer->set_shipping_company(sanitize_text_field($s['company']));
        if (array_key_exists('address1', $s))  $customer->set_shipping_address_1(sanitize_text_field($s['address1']));
        if (array_key_exists('address2', $s))  $customer->set_shipping_address_2(sanitize_text_field($s['address2']));
        if (array_key_exists('city', $s))      $customer->set_shipping_city(sanitize_text_field($s['city']));
        if (array_key_exists('state', $s))     $customer->set_shipping_state(sanitize_text_field($s['state']));
        if (array_key_exists('postcode', $s))  $customer->set_shipping_postcode(sanitize_text_field($s['postcode']));
        if (array_key_exists('country', $s))   $customer->set_shipping_country(sanitize_text_field(strtoupper($s['country'])));
        if (array_key_exists('phone', $s))     $customer->set_shipping_phone(sanitize_text_field($s['phone']));
    }

    $customer->save();
    return headless_get_current_customer($request);
}
