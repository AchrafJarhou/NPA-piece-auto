<?php

// Quand une requete porte un jeton JWT, on ignore les cookies de session WordPress.
//
// WordPress lit le cookie "wordpress_..." avant le plugin JWT, qui ne regarde
// alors plus le jeton. Sans nonce, l'API REST annule ensuite cette session
// cookie : l'utilisateur pourtant connecte recoit "Vous n'etes actuellement pas
// connecte". Le proxy Vite reecrit les cookies en path=/, ce qui suffit pour
// qu'un tel cookie accompagne toutes les requetes du front.
add_filter('determine_current_user', function ($user) {
    $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if (stripos($auth, 'Bearer ') === 0) {
        remove_filter('determine_current_user', 'wp_validate_auth_cookie');
        remove_filter('determine_current_user', 'wp_validate_logged_in_cookie', 20);
    }
    return $user;
}, 9);
