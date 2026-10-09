<?php

/**
 * Liens des e-mails WooCommerce (bienvenue, commandes...) : ils doivent mener au site React,
 * pas aux pages de WordPress. L'adresse du site React est déclarée dans wp-config.php :
 *   define('NPA_FRONT_URL', 'http://localhost:5173');        // en local
 *   define('NPA_FRONT_URL', 'https://www.exemple.fr');       // en production
 * Sans cette constante, les liens restent ceux de WordPress.
 */

function npa_front_url($path = '')
{
    return defined('NPA_FRONT_URL') ? untrailingslashit(NPA_FRONT_URL) . $path : null;
}

// Lien "Mon compte" (e-mail de bienvenue) → page profil du site
add_filter('woocommerce_get_myaccount_page_permalink', function ($url) {
    return npa_front_url('/profile') ?: $url;
});

// Logo / nom de la boutique en haut des e-mails → accueil du site
add_filter('woocommerce_email_header_image_url', function ($url) {
    return npa_front_url('/') ?: $url;
});
