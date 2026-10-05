<?php

/**
 * Véhicules compatibles avec les produits.
 *
 * Ajoute une taxonomie hiérarchique "Véhicules" aux produits WooCommerce :
 *   Marque (parent : aucun)
 *   └── Modèle avec les années, ex. "Clio IV (2012-2019)" (parent : la marque)
 *       └── Motorisation, ex. "1.5 dCi 90ch" (parent : le modèle)
 *
 * Dans la fiche produit, on coche les motorisations compatibles avec la pièce.
 * La liste est lisible par le front : /wp-json/wp/v2/vehicles?parent=<id>
 */

add_action('init', function () {
    register_taxonomy('product_vehicle', ['product'], [
        'labels'             => [
            'name'              => 'Véhicules',
            'singular_name'     => 'Véhicule',
            'menu_name'         => 'Véhicules',
            'all_items'         => 'Tous les véhicules',
            'edit_item'         => 'Modifier le véhicule',
            'view_item'         => 'Voir le véhicule',
            'update_item'       => 'Mettre à jour le véhicule',
            'add_new_item'      => 'Ajouter un véhicule',
            'new_item_name'     => 'Nom du nouveau véhicule',
            'parent_item'       => 'Véhicule parent',
            'parent_item_colon' => 'Véhicule parent :',
            'search_items'      => 'Rechercher un véhicule',
            'not_found'         => 'Aucun véhicule trouvé.',
            'back_to_items'     => '← Retour aux véhicules',
        ],
        'hierarchical'       => true,
        'public'             => true,
        'publicly_queryable' => false,
        'show_ui'            => true,
        'show_in_menu'       => true,
        'show_in_nav_menus'  => false,
        'show_tagcloud'      => false,
        'show_in_quick_edit' => true,
        'show_admin_column'  => true,
        'show_in_rest'       => true,
        'rest_base'          => 'vehicles',
        'query_var'          => false,
        'rewrite'            => false,
    ]);
});

// Titre plus explicite de la case dans la fiche produit
add_action('add_meta_boxes_product', function () {
    global $wp_meta_boxes;
    if (isset($wp_meta_boxes['product']['side']['core']['product_vehiclediv'])) {
        $wp_meta_boxes['product']['side']['core']['product_vehiclediv']['title'] = 'Véhicules compatibles';
    }
}, 20);

// Rappel de l'organisation au-dessus du formulaire d'ajout
add_action('product_vehicle_pre_add_form', function () {
    echo '<div class="notice notice-info inline"><p>'
        . '<strong>Organisation sur 3 niveaux :</strong><br>'
        . '1. Marque (parent : aucun), ex. <em>Renault</em><br>'
        . '2. Modèle avec les années (parent : la marque), ex. <em>Clio IV (2012-2019)</em><br>'
        . '3. Motorisation (parent : le modèle), ex. <em>1.5 dCi 90ch</em><br>'
        . 'Dans la fiche produit, cochez les motorisations compatibles avec la pièce.'
        . '</p></div>';
});
