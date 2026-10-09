<?php

/**
 * Connexion par cookie HttpOnly (le jeton JWT n'est plus jamais lisible par JavaScript).
 *
 * - POST /custom/v1/auth/login  : vérifie les identifiants, dépose le cookie, renvoie le profil + le code CSRF
 * - POST /custom/v1/auth/logout : efface le cookie
 * - GET  /custom/v1/auth/me     : indique si le visiteur est connecté (profil + code CSRF)
 *
 * Protection CSRF : pour toute requête qui modifie quelque chose (POST, PUT, PATCH, DELETE)
 * faite avec le cookie, l'en-tête X-NPA-CSRF doit contenir le code renvoyé par login/me.
 * Ce code est calculé à partir du jeton : un autre site ne peut pas le deviner.
 *
 * Réglages possibles dans wp-config.php :
 *   define('NPA_AUTH_SAMESITE', 'Lax');      // 'Lax' (par défaut, front et API sur le même site) ou 'None'
 *   define('NPA_FRONT_ORIGINS', 'https://exemple.fr'); // seulement si le front appelle l'API depuis un autre domaine
 */

const NPA_AUTH_COOKIE = 'npa_auth';

/* ---------- Cookie ---------- */

function npa_auth_samesite()
{
    $value = defined('NPA_AUTH_SAMESITE') ? ucfirst(strtolower(NPA_AUTH_SAMESITE)) : 'Lax';
    return in_array($value, ['Lax', 'Strict', 'None'], true) ? $value : 'Lax';
}

function npa_auth_set_cookie($token, $expires)
{
    $samesite = npa_auth_samesite();
    setcookie(NPA_AUTH_COOKIE, $token, [
        'expires'  => $expires,
        'path'     => '/',
        // SameSite=None n'est accepté par les navigateurs qu'avec Secure (HTTPS)
        'secure'   => is_ssl() || $samesite === 'None',
        'httponly' => true,
        'samesite' => $samesite,
    ]);
}

function npa_auth_clear_cookie()
{
    npa_auth_set_cookie('', time() - YEAR_IN_SECONDS);
}

// Code CSRF lié au jeton : change à chaque connexion, impossible à calculer sans la clé du site
function npa_auth_csrf_token($jwt)
{
    return hash_hmac('sha256', $jwt, wp_salt('nonce'));
}

/* ---------- Lecture du cookie ---------- */

// Décode le jeton du cookie avec la même bibliothèque et la même clé que le plugin JWT.
// Renvoie l'identifiant de l'utilisateur, ou 0 si le jeton est absent, expiré ou invalide.
function npa_auth_user_from_cookie()
{
    static $user_id = null;
    if ($user_id !== null) {
        return $user_id;
    }
    $user_id = 0;

    $jwt = isset($_COOKIE[NPA_AUTH_COOKIE]) ? (string) $_COOKIE[NPA_AUTH_COOKIE] : '';
    if ($jwt === '' || !defined('JWT_AUTH_SECRET_KEY') || !class_exists('\Tmeister\Firebase\JWT\JWT')) {
        return $user_id;
    }

    try {
        $algorithm = apply_filters('jwt_auth_algorithm', 'HS256');
        $token = \Tmeister\Firebase\JWT\JWT::decode($jwt, new \Tmeister\Firebase\JWT\Key(JWT_AUTH_SECRET_KEY, $algorithm));
        if (($token->iss ?? '') === get_bloginfo('url') && !empty($token->data->user->id) && get_userdata((int) $token->data->user->id)) {
            $user_id = (int) $token->data->user->id;
        }
    } catch (Exception $e) {
        $user_id = 0;
    }

    // Jeton expiré ou refusé (clé changée...) : on efface le cookie, le visiteur continue en invité
    if ($user_id === 0) {
        $GLOBALS['npa_auth_clear_cookie'] = true;
    }
    return $user_id;
}

function npa_auth_is_rest_request()
{
    $uri = isset($_SERVER['REQUEST_URI']) ? (string) $_SERVER['REQUEST_URI'] : '';
    return strpos($uri, '/' . rest_get_url_prefix() . '/') !== false || isset($_GET['rest_route']);
}

// Après le plugin JWT (priorité 10) : si aucun en-tête Authorization n'a identifié le visiteur,
// on regarde le cookie. Les appels avec "Authorization: Bearer" continuent de fonctionner.
add_filter('determine_current_user', function ($user) {
    if ($user || !npa_auth_is_rest_request()) {
        return $user;
    }
    $user_id = npa_auth_user_from_cookie();
    if ($user_id) {
        $GLOBALS['npa_auth_via_cookie'] = true;
        return $user_id;
    }
    return $user;
}, 20);

/* ---------- Protection CSRF ---------- */

add_filter('rest_pre_dispatch', function ($result, $server, $request) {
    if (!empty($GLOBALS['npa_auth_clear_cookie'])) {
        npa_auth_clear_cookie();
    }
    if ($result !== null || empty($GLOBALS['npa_auth_via_cookie'])) {
        return $result;
    }
    // Seule la requête du navigateur est vérifiée, pas les requêtes internes faites ensuite
    // (ex. la route d'inscription qui demande un jeton au plugin JWT)
    if (!empty($GLOBALS['npa_csrf_checked'])) {
        return $result;
    }
    $GLOBALS['npa_csrf_checked'] = true;
    if (in_array($request->get_method(), ['GET', 'HEAD', 'OPTIONS'], true)) {
        return $result;
    }
    $expected = npa_auth_csrf_token((string) $_COOKIE[NPA_AUTH_COOKIE]);
    $received = (string) $request->get_header('x_npa_csrf');
    if ($received === '' || !hash_equals($expected, $received)) {
        return new WP_Error('npa_csrf_invalid', 'Requête refusée : rechargez la page et réessayez.', ['status' => 403]);
    }
    return $result;
}, 5, 3);

/* ---------- CORS ---------- */

// Par défaut, WordPress autorise n'importe quel site à appeler l'API avec les cookies du visiteur.
// On n'autorise que les adresses listées dans NPA_FRONT_ORIGINS (aucune si le front passe par un proxy).
add_action('rest_api_init', function () {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function ($value) {
        $origin  = get_http_origin();
        $allowed = defined('NPA_FRONT_ORIGINS') ? array_map('trim', explode(',', NPA_FRONT_ORIGINS)) : [];
        if ($origin && in_array($origin, $allowed, true)) {
            header('Access-Control-Allow-Origin: ' . esc_url_raw($origin));
            header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
            header('Access-Control-Allow-Credentials: true');
            header('Access-Control-Allow-Headers: Content-Type, Nonce, Cart-Token, X-NPA-CSRF');
            header('Access-Control-Expose-Headers: Nonce, Cart-Token, X-WP-Total, X-WP-TotalPages');
            header('Vary: Origin', false);
        }
        return $value;
    });
}, 15);

/* ---------- Routes ---------- */

// Crée le jeton via le plugin JWT, dépose le cookie et renvoie ce dont le front a besoin
function npa_auth_issue($username, $password)
{
    $token_request = new WP_REST_Request('POST', '/jwt-auth/v1/token');
    $token_request->set_param('username', $username);
    $token_request->set_param('password', $password);
    $token_response = rest_do_request($token_request);
    if ($token_response->is_error()) {
        return $token_response->as_error();
    }

    $data = $token_response->get_data();
    $jwt  = $data['token'];
    $payload = json_decode(base64_decode(strtr(explode('.', $jwt)[1] ?? '', '-_', '+/')), true);
    npa_auth_set_cookie($jwt, (int) ($payload['exp'] ?? time() + WEEK_IN_SECONDS));

    return rest_ensure_response([
        'profile' => [
            'email'       => $data['user_email'],
            'displayName' => $data['user_display_name'],
            'nicename'    => $data['user_nicename'],
        ],
        'csrf'    => npa_auth_csrf_token($jwt),
    ]);
}

function npa_auth_rate_limit_check()
{
    $ip  = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : 'unknown';
    $key = 'npa_login_' . md5($ip);
    $attempts = (int) get_transient($key);
    if ($attempts >= 10) {
        return false;
    }
    set_transient($key, $attempts + 1, 15 * MINUTE_IN_SECONDS);
    return true;
}

add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/auth/login', [
        'methods'             => 'POST',
        'permission_callback' => '__return_true',
        'callback'            => function (WP_REST_Request $request) {
            if (!npa_auth_rate_limit_check()) {
                return new WP_Error('too_many_requests', 'Trop de tentatives de connexion. Réessayez dans 15 minutes.', ['status' => 429]);
            }
            $username = sanitize_user((string) $request->get_param('username'));
            $password = (string) $request->get_param('password');
            if ($username === '' || $password === '') {
                return new WP_Error('missing_fields', 'Email et mot de passe requis.', ['status' => 400]);
            }
            return npa_auth_issue($username, $password);
        },
    ]);

    register_rest_route('custom/v1', '/auth/logout', [
        'methods'             => 'POST',
        'permission_callback' => '__return_true',
        'callback'            => function () {
            npa_auth_clear_cookie();
            return rest_ensure_response(['logged_in' => false]);
        },
    ]);

    register_rest_route('custom/v1', '/auth/me', [
        'methods'             => 'GET',
        'permission_callback' => '__return_true',
        'callback'            => function () {
            $user = wp_get_current_user();
            if (!$user->exists() || empty($GLOBALS['npa_auth_via_cookie'])) {
                return rest_ensure_response(['logged_in' => false]);
            }
            return rest_ensure_response([
                'logged_in' => true,
                'profile'   => [
                    'email'       => $user->user_email,
                    'displayName' => $user->display_name,
                    'nicename'    => $user->user_nicename,
                ],
                'csrf'      => npa_auth_csrf_token((string) $_COOKIE[NPA_AUTH_COOKIE]),
            ]);
        },
    ]);
});
