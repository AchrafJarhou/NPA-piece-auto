<?php

add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/register', [
        'methods'             => 'POST',
        'callback'            => 'headless_register_user',
        'permission_callback' => '__return_true',
    ]);
});

function headless_register_rate_limit_check()
{
    $ip  = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : 'unknown';
    $key = 'headless_register_' . md5($ip);

    $attempts = (int) get_transient($key);

    if ($attempts >= 5) {
        return false;
    }

    set_transient($key, $attempts + 1, HOUR_IN_SECONDS);
    return true;
}

function headless_register_user($request)
{
    if (!headless_register_rate_limit_check()) {
        return new WP_Error('too_many_requests', 'Trion depuis cette adresse. Reessayez plus tard.', ['status' => 429]);
    }

    $username   = sanitize_user($request->get_param('username'));
    $email      = sanitize_email($request->get_param('email'));
    $password   = (string) $request->get_param('password');
    $first_name = sanitize_text_field((string) $request->get_param('firstName'));
    $last_name  = sanitize_text_field((string) $request->get_param('lastName'));

    if (empty($username) || empty($email) || empty($password) || $first_name === '' || $last_name === '') {
        return new WP_Error('missing_fields', 'Prenom, nom, email et mot de passe sont requis.', ['status' => 400]);
    }
    if (mb_strlen($first_name) > 100 || mb_strlen($last_name) > 100) {
        return new WP_Error('invalid_name', 'Le prenom et le nom ne doivent pas depasser 100 caracteres.', ['status' => 400]);
    }
    if (!is_email($email)) {
        return new WP_Error('invalid_email', 'Adresse email invalide.', ['status' => 400]);
    }
    if (strlen($password) < 8) {
        return new WP_Error('weak_password', 'Le mot de passe doit contenir au moins 8 caracteres.', ['status' => 400]);
    }
    if (username_exists($username) || email_exists($email)) {
        return new WP_Error('registration_unavailable', 'Impossible de creer ce compte avec ces informations.', ['status' => 409]);
    }

    $phone = trim((string) $request->get_param('phone'));
    if ($phone !== '' && !preg_match('/^[0-9+\-\s().]{1,30}$/', $phone)) {
        return new WP_Error('invalid_phone', 'Numero de telephone invalide.', ['status' => 400]);
    }

    // Professionnel : le SIRET est verifie aupres de l'API avant la creation
    // du compte, et son adresse sert a pre-remplir facturation et livraison.
    $siret           = npa_normalize_siret($request->get_param('siret'));
    $company_address = null;
    if ($siret !== '') {
        if (!npa_is_valid_siret($siret)) {
            return new WP_Error('invalid_siret', 'Le SIRET doit contenir 14 chiffres.', ['status' => 400]);
        }
        $company_address = npa_fetch_company_address($siret);
        if ($company_address === false) {
            return new WP_Error('unknown_siret', 'Aucun etablissement ne correspond a ce SIRET.', ['status' => 400]);
        }
    }

    $user_id = wp_create_user($username, $password, $email);
    if (is_wp_error($user_id)) {
        return new WP_Error('registration_failed', $user_id->get_error_message(), ['status' => 500]);
    }

    wp_update_user([
        'ID'           => $user_id,
        'first_name'   => $first_name,
        'last_name'    => $last_name,
        'display_name' => trim("$first_name $last_name"),
        'role'         => 'customer', // rôle "Client" de WooCommerce (wp_create_user donne "Abonné")
    ]);

    // Le nom sert aussi de destinataire par defaut pour les commandes
    if (class_exists('WC_Customer')) {
        $customer = new WC_Customer($user_id);
        $customer->set_billing_first_name($first_name);
        $customer->set_billing_last_name($last_name);
        $customer->set_shipping_first_name($first_name);
        $customer->set_shipping_last_name($last_name);
        if ($phone !== '') {
            $customer->set_billing_phone(sanitize_text_field($phone));
        }
        $customer->save();
    }

    update_user_meta($user_id, 'npa_account_type', $siret !== '' ? 'pro' : 'particulier');
    if ($siret !== '') {
        update_user_meta($user_id, 'npa_siret', $siret);
        // API injoignable ($company_address null) : le pro completera son profil
        npa_apply_company_address($user_id, $company_address);
    }

    // E-mail de bienvenue de WooCommerce ("Nouveau compte", modifiable dans
    // WooCommerce → Réglages → E-mails). Le mot de passe n'y figure jamais.
    if (function_exists('WC')) {
        WC()->mailer();
        do_action('woocommerce_created_customer', $user_id, [
            'user_login' => $username,
            'user_email' => $email,
            'role'       => 'customer',
        ], false);
    }

    // Connexion automatique : cookie HttpOnly + code CSRF (voir auth.php)
    $response = npa_auth_issue($username, $password);
    if (is_wp_error($response)) {
        return new WP_Error('token_generation_failed', 'Compte cree, mais la connexion automatique a echoue.', ['status' => 500]);
    }

    return $response;
}
