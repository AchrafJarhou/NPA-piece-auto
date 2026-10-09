<?php

/**
 * Avis clients (les routes /wc/v3 de WooCommerce sont réservées aux gérants) :
 * - GET  /custom/v1/reviews/eligibility?product_id= : le client connecté peut-il noter ce produit ?
 * - POST /custom/v1/reviews : dépose un avis.
 *
 * Règles (vérifiées ici, jamais par le navigateur) :
 * - seuls les clients connectés qui ont acheté le produit peuvent noter ;
 * - un seul avis par client et par produit ;
 * - l'avis est "en attente" : il n'apparaît qu'après validation par le comptoir
 *   (WooCommerce → Avis, ou Commentaires), qui reçoit un e-mail de modération.
 */

function npa_review_status_for_user($product_id, $user)
{
    $bought = function_exists('wc_customer_bought_product')
        && wc_customer_bought_product($user->user_email, $user->ID, $product_id);
    $already = (int) get_comments([
        'post_id' => $product_id,
        'user_id' => $user->ID,
        'type'    => 'review',
        'status'  => 'all', // publiés et en attente
        'count'   => true,
    ]) > 0;
    return ['bought' => (bool) $bought, 'already_reviewed' => $already];
}

function npa_review_product($product_id)
{
    $product = function_exists('wc_get_product') ? wc_get_product($product_id) : null;
    return $product && $product->get_reviews_allowed() ? $product : null;
}

add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/reviews/eligibility', [
        'methods'             => 'GET',
        'permission_callback' => '__return_true',
        'args'                => ['product_id' => ['required' => true, 'sanitize_callback' => 'absint']],
        'callback'            => function (WP_REST_Request $request) {
            $user = wp_get_current_user();
            $product_id = (int) $request['product_id'];
            if (!$user->exists() || !npa_review_product($product_id)) {
                return rest_ensure_response(['can_review' => false, 'already_reviewed' => false, 'bought' => false]);
            }
            $status = npa_review_status_for_user($product_id, $user);
            return rest_ensure_response([
                'can_review'       => $status['bought'] && !$status['already_reviewed'],
                'already_reviewed' => $status['already_reviewed'],
                'bought'           => $status['bought'],
            ]);
        },
    ]);

    register_rest_route('custom/v1', '/reviews', [
        'methods'             => 'POST',
        'permission_callback' => 'is_user_logged_in',
        'callback'            => function (WP_REST_Request $request) {
            $user       = wp_get_current_user();
            $product_id = absint($request->get_param('product_id'));
            $rating     = (int) $request->get_param('rating');
            $text       = sanitize_textarea_field((string) $request->get_param('review'));

            if (!npa_review_product($product_id)) {
                return new WP_Error('invalid_product', 'Ce produit ne peut pas recevoir d\'avis.', ['status' => 400]);
            }
            if ($rating < 1 || $rating > 5) {
                return new WP_Error('invalid_rating', 'Choisissez une note de 1 à 5.', ['status' => 400]);
            }
            $length = mb_strlen(trim($text));
            if ($length < 10 || $length > 2000) {
                return new WP_Error('invalid_review', 'Votre avis doit contenir entre 10 et 2000 caractères.', ['status' => 400]);
            }

            $status = npa_review_status_for_user($product_id, $user);
            if (!$status['bought']) {
                return new WP_Error('not_bought', 'Seuls les clients ayant acheté cet article peuvent laisser un avis.', ['status' => 403]);
            }
            if ($status['already_reviewed']) {
                return new WP_Error('already_reviewed', 'Vous avez déjà donné votre avis sur ce produit.', ['status' => 409]);
            }

            $comment_id = wp_insert_comment([
                'comment_post_ID'      => $product_id,
                'comment_author'       => $user->display_name,
                'comment_author_email' => $user->user_email,
                'comment_author_IP'    => isset($_SERVER['REMOTE_ADDR']) ? sanitize_text_field($_SERVER['REMOTE_ADDR']) : '',
                'comment_agent'        => isset($_SERVER['HTTP_USER_AGENT']) ? substr(sanitize_text_field($_SERVER['HTTP_USER_AGENT']), 0, 254) : '',
                'user_id'              => $user->ID,
                'comment_content'      => $text,
                'comment_type'         => 'review',
                'comment_approved'     => 0, // en attente de validation par le comptoir
            ]);
            if (!$comment_id) {
                return new WP_Error('review_failed', 'Impossible d\'enregistrer votre avis.', ['status' => 500]);
            }
            add_comment_meta($comment_id, 'rating', $rating, true);
            add_comment_meta($comment_id, 'verified', 1, true);

            // E-mail de modération au comptoir (réglage WordPress → Réglages → Discussion)
            wp_notify_moderator($comment_id);

            return rest_ensure_response(['status' => 'pending']);
        },
    ]);
});
