<?php

/**
 * Formulaire de contact (route POST /custom/v1/contact) :
 * - valide et nettoie chaque champ côté serveur (on ne fait jamais confiance au navigateur) ;
 * - anti-spam : champ piège invisible + 5 envois par heure et par adresse IP ;
 * - enregistre le message dans l'admin (menu "Messages contact") ;
 * - prévient le comptoir par e-mail (adresse d'expédition réglée dans WooCommerce → Réglages → E-mails).
 */

const NPA_CONTACT_SUBJECTS = [
    'piece'     => 'Question sur une pièce',
    'devis'     => 'Demande de devis / identification VIN',
    'pro'       => 'Compte professionnel',
    'commande'  => 'Suivi de commande',
    'autre'     => 'Autre demande',
];

// Messages enregistrés dans l'admin, visibles uniquement par les administrateurs
add_action('init', function () {
    register_post_type('npa_contact', [
        'labels'          => [
            'name'          => 'Messages contact',
            'singular_name' => 'Message contact',
            'all_items'     => 'Tous les messages',
            'edit_item'     => 'Message',
            'search_items'  => 'Rechercher un message',
            'not_found'     => 'Aucun message',
        ],
        'public'          => false,
        'show_ui'         => true,
        'show_in_rest'    => false,
        'menu_icon'       => 'dashicons-email-alt',
        'menu_position'   => 26,
        'supports'        => ['title', 'editor'],
        'capability_type' => 'post',
        'capabilities'    => ['create_posts' => 'do_not_allow'], // créés seulement par le formulaire
        'map_meta_cap'    => true,
    ]);
});

add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/contact', [
        'methods'             => 'POST',
        'callback'            => 'npa_contact_submit',
        'permission_callback' => '__return_true',
    ]);
});

function npa_contact_rate_limit_check()
{
    $ip  = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : 'unknown';
    $key = 'npa_contact_' . md5($ip);
    $attempts = (int) get_transient($key);
    if ($attempts >= 5) {
        return false;
    }
    set_transient($key, $attempts + 1, HOUR_IN_SECONDS);
    return true;
}

function npa_contact_submit(WP_REST_Request $request)
{
    // Champ piège : invisible pour un humain, rempli par les robots.
    // On répond "envoyé" pour ne pas leur indiquer qu'ils sont détectés.
    if (trim((string) $request->get_param('website')) !== '') {
        return rest_ensure_response(['sent' => true]);
    }

    if (!npa_contact_rate_limit_check()) {
        return new WP_Error('too_many_requests', 'Trop de messages envoyés. Réessayez plus tard ou appelez le comptoir.', ['status' => 429]);
    }

    $name    = sanitize_text_field((string) $request->get_param('name'));
    $email   = sanitize_email((string) $request->get_param('email'));
    $phone   = sanitize_text_field((string) $request->get_param('phone'));
    $subject = sanitize_key((string) $request->get_param('subject'));
    $vehicle = strtoupper(sanitize_text_field((string) $request->get_param('vehicle')));
    $message = sanitize_textarea_field((string) $request->get_param('message'));
    $consent = rest_sanitize_boolean($request->get_param('consent'));

    $errors = [];
    if ($name === '' || mb_strlen($name) > 100) {
        $errors['name'] = 'Indiquez votre nom (100 caractères maximum).';
    }
    if (!is_email($email)) {
        $errors['email'] = 'Adresse e-mail invalide.';
    }
    if ($phone !== '' && !preg_match('/^[0-9+\s.\-()]{6,20}$/', $phone)) {
        $errors['phone'] = 'Numéro de téléphone invalide.';
    }
    if (!array_key_exists($subject, NPA_CONTACT_SUBJECTS)) {
        $errors['subject'] = 'Choisissez un sujet.';
    }
    // Immatriculation AB-123-CD ou VIN à 17 caractères (sans I, O ni Q)
    $vehicleCompact = str_replace([' ', '-'], '', $vehicle);
    if ($vehicle !== '' && !preg_match('/^([A-Z]{2}\d{3}[A-Z]{2}|[A-HJ-NPR-Z0-9]{17})$/', $vehicleCompact)) {
        $errors['vehicle'] = 'Immatriculation (AB-123-CD) ou VIN (17 caractères) invalide.';
    }
    if (mb_strlen($message) < 10 || mb_strlen($message) > 3000) {
        $errors['message'] = 'Votre message doit contenir entre 10 et 3000 caractères.';
    }
    if (!$consent) {
        $errors['consent'] = 'Vous devez accepter le traitement de vos données pour envoyer le message.';
    }
    if ($errors) {
        return new WP_Error('invalid_fields', 'Certains champs sont invalides.', ['status' => 400, 'fields' => $errors]);
    }

    $subjectLabel = NPA_CONTACT_SUBJECTS[$subject];
    $body = implode("\n", array_filter([
        "Nom : $name",
        "E-mail : $email",
        $phone !== '' ? "Téléphone : $phone" : null,
        "Sujet : $subjectLabel",
        $vehicle !== '' ? "Immatriculation / VIN : $vehicle" : null,
        '',
        $message,
    ], fn($line) => $line !== null));

    // 1. Enregistrement dans l'admin (le message n'est jamais perdu, même si l'e-mail échoue)
    wp_insert_post([
        'post_type'    => 'npa_contact',
        'post_status'  => 'private',
        'post_title'   => "$subjectLabel – $name",
        'post_content' => $body,
    ]);

    // 2. E-mail au comptoir, en texte brut. L'adresse du visiteur ne sert qu'au "Répondre"
    // (validée par is_email ci-dessus, sans retour à la ligne possible).
    $to = get_option('woocommerce_email_from_address') ?: get_option('admin_email');
    wp_mail(
        $to,
        "[Site] $subjectLabel – $name",
        $body,
        ['Content-Type: text/plain; charset=UTF-8', "Reply-To: $email"]
    );

    return rest_ensure_response(['sent' => true]);
}
