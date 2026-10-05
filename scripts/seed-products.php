<?php

/**
 * Crée des produits de test dans un WordPress local (catégories, marques,
 * attributs, véhicules compatibles et photo de scripts/seed-images).
 *
 * Utilisation (depuis la racine du projet) :
 *   Windows : C:\wamp64\bin\php\php8.4.0\php.exe scripts/seed-products.php C:/wamp64/www/wordpress-NPA
 *   Mac     : php scripts/seed-products.php /Applications/MAMP/htdocs/wordpress-NPA
 *
 * Le script peut être relancé sans risque : un produit dont l'UGS existe déjà
 * est mis à jour au lieu d'être recréé.
 * Ajouter --images à la fin pour régénérer aussi les images des produits existants.
 *
 * Prérequis : WooCommerce actif, les catégories, sous-catégories et véhicules
 * déjà créés, et le mu-plugin vehicules.php chargé.
 */

if (php_sapi_name() !== 'cli') {
    exit("Ce script se lance en ligne de commande.\n");
}

$wordpressPath = rtrim($argv[1] ?? '', '/\\');
$regenerateImages = in_array('--images', $argv, true);
if (!$wordpressPath || !file_exists($wordpressPath . '/wp-load.php')) {
    exit("Indiquez le dossier de WordPress, ex. : php scripts/seed-products.php C:/wamp64/www/wordpress-NPA\n");
}

$_SERVER['HTTP_HOST']   = 'localhost';
$_SERVER['REQUEST_URI'] = '/';
require $wordpressPath . '/wp-load.php';
require_once ABSPATH . 'wp-admin/includes/image.php';

if (!class_exists('WooCommerce')) {
    exit("WooCommerce n'est pas actif sur ce WordPress.\n");
}

/* ---------- Produits de test ---------- */

// vehicles : chemins Marque > Modèle > Motorisation déjà créés dans Produits > Véhicules
$clio4_75   = ['Renault', 'Clio IV (2012-2019)', '1.5 dCi 75ch'];
$clio4_90   = ['Renault', 'Clio IV (2012-2019)', '1.5 dCi 90ch'];
$clio4_tce  = ['Renault', 'Clio IV (2012-2019)', '1.2 TCe 120ch'];
$clio5_100  = ['Renault', 'Clio V (2019-…)', '1.5 Blue dCi 100ch'];
$clio5_tce  = ['Renault', 'Clio V (2019-…)', '1.0 TCe 90ch'];
$captur_90  = ['Renault', 'Captur I (2013-2019)', '1.5 dCi 90ch'];
$captur_110 = ['Renault', 'Captur I (2013-2019)', '1.5 dCi 110ch'];
$megane_115 = ['Renault', 'Mégane IV (2016-…)', '1.5 Blue dCi 115ch'];

$products = [
    [
        'sku' => 'P68038', 'name' => 'Jeu de 4 plaquettes de frein avant', 'photo' => 'plaquettes.jpg',
        'brand' => 'Brembo', 'category' => 'plaquettes-de-frein', 'tag' => 'Top vente',
        'regular' => '48.90', 'sale' => '29.80', 'stock' => 'instock', 'quantity' => 12,
        'short' => 'Compatible étriers standards Renault Clio IV 1.5 dCi avec disques ventilés 258 mm.',
        'filters' => ['Essieu' => 'Avant', 'Montage' => 'Lucas / TRW'],
        'specs' => ['Épaisseur' => '17.8 mm', 'Largeur' => '116.3 mm', 'Témoin d\'usure' => 'Inclus (2)', 'Homologation' => 'ECE R90'],
        'vehicles' => [$clio4_75, $clio4_90, $captur_90],
    ],
    [
        'sku' => '197022', 'name' => 'Jeu de 2 disques de frein ventilés avant', 'photo' => 'disque-ventile.jpg',
        'brand' => 'Valeo', 'category' => 'disques-de-frein', 'tag' => 'Garantie 2 ans',
        'regular' => '84.50', 'sale' => '54.90', 'stock' => 'instock', 'quantity' => 8,
        'short' => 'Traitement anti-corrosion haute résistance avec vis de fixation moyeu incluses.',
        'filters' => ['Essieu' => 'Avant'],
        'specs' => ['Diamètre' => '258.0 mm', 'Épaisseur' => '22.0 mm', 'Épaisseur min.' => '19.8 mm', 'Perçage' => '4 trous (100 mm)'],
        'vehicles' => [$clio4_75, $clio4_90, $captur_90, $captur_110],
    ],
    [
        'sku' => '0986494656', 'name' => 'Jeu de 4 plaquettes de frein avant', 'photo' => 'plaquettes.jpg',
        'brand' => 'Bosch', 'category' => 'plaquettes-de-frein', 'tag' => 'Qualité origine',
        'regular' => '44.20', 'sale' => '27.50', 'stock' => 'instock', 'quantity' => 3,
        'short' => 'Formulation sans cuivre silencieuse et respectueuse de la propreté des jantes alliage.',
        'filters' => ['Essieu' => 'Avant', 'Montage' => 'Bosch'],
        'specs' => ['Épaisseur' => '17.5 mm', 'Largeur' => '116.5 mm', 'Sans cuivre' => 'Certifié', 'Accessoires' => 'Ressorts fournis'],
        'vehicles' => [$clio4_90, $clio4_tce, $clio5_100],
    ],
    [
        'sku' => '08B35211', 'name' => 'Jeu de 2 disques arrière avec roulement', 'photo' => 'disque-plein.jpg',
        'brand' => 'Brembo', 'category' => 'disques-de-frein', 'tag' => 'Complet avec bague ABS',
        'regular' => '124.00', 'sale' => '82.00', 'stock' => 'onbackorder',
        'short' => 'Livré pré-monté avec roulement de roue pressé et capteur ABS magnétique intégré.',
        'filters' => ['Essieu' => 'Arrière'],
        'specs' => ['Diamètre' => '260.0 mm', 'Épaisseur' => '8.0 mm', 'Roulement' => 'Intégré 30 mm', 'Bague ABS' => 'Incluse'],
        'vehicles' => [$clio4_90, $captur_90],
    ],
    [
        'sku' => 'FDB4342', 'name' => 'Jeu de 4 plaquettes avant Ferodo Premier', 'photo' => 'plaquettes.jpg',
        'brand' => 'Ferodo', 'category' => 'plaquettes-de-frein', 'tag' => 'Eco-friction',
        'regular' => '42.00', 'sale' => '26.90', 'stock' => 'instock', 'quantity' => 6,
        'short' => 'Performances de freinage accrues à chaud et coefficient de friction constant sous charge.',
        'filters' => ['Essieu' => 'Avant', 'Montage' => 'Lucas / TRW'],
        'specs' => ['Épaisseur' => '17.6 mm', 'Largeur' => '116.4 mm', 'Témoin d\'usure' => 'Câble inclus', 'Gamme' => 'Premier Pro'],
        'vehicles' => [$clio4_75, $clio4_90],
    ],
    [
        'sku' => 'DF6128', 'name' => 'Jeu de 2 disques ventilés avant TRW', 'photo' => 'disque-perce.jpg',
        'brand' => 'TRW', 'category' => 'disques-de-frein', 'tag' => 'High carbon',
        'regular' => '89.90', 'sale' => '59.20', 'stock' => 'instock', 'quantity' => 4,
        'short' => 'Fonte enrichie en carbone limitant le fading et réduisant les vibrations au volant.',
        'filters' => ['Essieu' => 'Avant'],
        'specs' => ['Diamètre' => '258.0 mm', 'Épaisseur' => '22.0 mm', 'Alliage' => 'High Carbon', 'Finition' => 'Peint noir'],
        'vehicles' => [$clio5_100, $clio5_tce, $megane_115],
    ],
    [
        'sku' => 'F026407', 'name' => 'Filtre à huile', 'photo' => 'filtre-huile.jpg',
        'brand' => 'Bosch', 'category' => 'filtre-a-huile', 'tag' => '',
        'regular' => '12.90', 'sale' => '', 'stock' => 'instock', 'quantity' => 25,
        'short' => 'Filtre à huile vissé haute capacité de filtration, joint d\'étanchéité inclus.',
        'filters' => [],
        'specs' => ['Hauteur' => '79 mm', 'Diamètre' => '76 mm', 'Filetage' => 'M20x1.5'],
        'vehicles' => [$clio4_75, $clio4_90, $captur_90, $captur_110],
    ],
    [
        'sku' => 'C2201', 'name' => 'Filtre à air moteur', 'photo' => 'filtre-air.jpg',
        'brand' => 'Mann-Filter', 'category' => 'filtre-a-air', 'tag' => '',
        'regular' => '18.50', 'sale' => '', 'stock' => 'instock', 'quantity' => 10,
        'short' => 'Média filtrant haute efficacité qui protège le moteur des poussières fines.',
        'filters' => [],
        'specs' => ['Longueur' => '226 mm', 'Largeur' => '187 mm', 'Hauteur' => '58 mm'],
        'vehicles' => [$clio5_100, $clio5_tce],
    ],
    [
        'sku' => '826704', 'name' => 'Kit d\'embrayage 3 pièces', 'photo' => 'embrayage.jpg',
        'brand' => 'Valeo', 'category' => 'kits-dembrayage', 'tag' => 'Top vente',
        'regular' => '189.00', 'sale' => '159.00', 'stock' => 'instock', 'quantity' => 2,
        'short' => 'Kit complet mécanisme, disque et butée pour un remplacement en une seule intervention.',
        'filters' => [],
        'specs' => ['Diamètre' => '200 mm', 'Nombre de dents' => '26', 'Contenu' => '3 pièces'],
        'vehicles' => [$clio4_90, $captur_90],
    ],
    [
        'sku' => 'G16742', 'name' => 'Amortisseur avant', 'photo' => 'amortisseur.jpg',
        'brand' => 'Monroe', 'category' => 'amortisseurs', 'tag' => '',
        'regular' => '79.90', 'sale' => '', 'stock' => 'outofstock',
        'short' => 'Amortisseur à gaz bitube pour un confort de conduite d\'origine.',
        'filters' => ['Essieu' => 'Avant'],
        'specs' => ['Type' => 'Gaz bitube', 'Fixation' => 'Pied d\'amortisseur'],
        'vehicles' => [$clio4_90, $clio4_tce],
    ],
];

/* ---------- Fonctions utilitaires ---------- */

// Retrouve (ou crée) un terme par son nom dans une taxonomie
function npa_term_id($name, $taxonomy, $parent = 0)
{
    $existing = get_terms([
        'taxonomy' => $taxonomy, 'name' => $name, 'parent' => $parent, 'hide_empty' => false,
    ]);
    if (!is_wp_error($existing) && $existing) {
        return $existing[0]->term_id;
    }
    $created = wp_insert_term($name, $taxonomy, ['parent' => $parent]);
    return is_wp_error($created) ? 0 : $created['term_id'];
}

// Retrouve un véhicule à partir de son chemin [Marque, Modèle, Motorisation]
function npa_vehicle_id($path)
{
    $parent = 0;
    foreach ($path as $name) {
        $terms = get_terms([
            'taxonomy' => 'product_vehicle', 'name' => $name, 'parent' => $parent, 'hide_empty' => false,
        ]);
        if (is_wp_error($terms) || !$terms) {
            echo "  ! Véhicule introuvable : " . implode(' > ', $path) . "\n";
            return 0;
        }
        $parent = $terms[0]->term_id;
    }
    return $parent;
}

// Crée l'attribut global (ex. Essieu) et sa valeur si besoin, renvoie la taxonomie pa_xxx
function npa_global_attribute($label, $value)
{
    $slug = wc_sanitize_taxonomy_name($label);
    $taxonomy = wc_attribute_taxonomy_name($slug);
    if (!wc_attribute_taxonomy_id_by_name($slug)) {
        wc_create_attribute(['name' => $label, 'slug' => $slug, 'type' => 'select', 'has_archives' => false]);
        register_taxonomy($taxonomy, ['product'], ['hierarchical' => false]);
    }
    if (!term_exists($value, $taxonomy)) {
        wp_insert_term($value, $taxonomy);
    }
    return $taxonomy;
}

// Génère une image produit simple (fond rayé, marque et nom) et l'ajoute aux médias.
// Image carrée : WooCommerce découpe les miniatures en carré.
function npa_generate_image($product)
{
    $width = 800;
    $height = 800;
    $image = imagecreatetruecolor($width, $height);
    $light = imagecolorallocate($image, 245, 246, 247);
    $stripe = imagecolorallocate($image, 236, 238, 240);
    $yellow = imagecolorallocate($image, 255, 199, 0);
    $black = imagecolorallocate($image, 0, 0, 0);
    $grey = imagecolorallocate($image, 69, 71, 74);

    imagefill($image, 0, 0, $light);
    for ($x = -$height; $x < $width; $x += 40) {
        imagefilledpolygon($image, [$x, $height, $x + 20, $height, $x + 20 + $height, 0, $x + $height, 0], $stripe);
    }
    imagefilledrectangle($image, 0, 0, $width, 12, $yellow);

    $fonts = [
        'C:/Windows/Fonts/arialbd.ttf',
        '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
        '/Library/Fonts/Arial Bold.ttf',
    ];
    $font = null;
    foreach ($fonts as $candidate) {
        if (file_exists($candidate)) {
            $font = $candidate;
            break;
        }
    }

    $brand = mb_strtoupper($product['brand']);
    $name = mb_strtoupper($product['name']);
    if ($font) {
        imagettftext($image, 64, 0, 60, 330, $black, $font, $brand);
        $lines = explode("\n", wordwrap($name, 24));
        foreach ($lines as $i => $line) {
            imagettftext($image, 34, 0, 60, 420 + $i * 54, $grey, $font, $line);
        }
        imagettftext($image, 26, 0, 60, 720, $grey, $font, 'Réf : ' . $product['sku']);
    } else {
        imagestring($image, 5, 60, 380, $brand . ' - ' . $name, $black);
    }

    ob_start();
    imagepng($image);
    $png = ob_get_clean();

    $upload = wp_upload_bits('produit-' . sanitize_title($product['sku']) . '.png', null, $png);
    if (!empty($upload['error'])) {
        echo "  ! Image non créée : {$upload['error']}\n";
        return 0;
    }
    $attachmentId = wp_insert_attachment([
        'post_mime_type' => 'image/png',
        'post_title'     => $product['brand'] . ' ' . $product['name'],
        'post_status'    => 'inherit',
    ], $upload['file']);
    wp_update_attachment_metadata($attachmentId, wp_generate_attachment_metadata($attachmentId, $upload['file']));
    return $attachmentId;
}

// Ajoute une photo de scripts/seed-images aux médias, centrée sur un fond blanc carré
// (WooCommerce découpe les miniatures en carré : on évite de couper la pièce)
function npa_import_photo($product)
{
    $file = __DIR__ . '/seed-images/' . $product['photo'];
    $source = @imagecreatefromstring((string) @file_get_contents($file));
    if (!$source) {
        echo "  ! Photo introuvable : {$product['photo']}, image générée à la place\n";
        return npa_generate_image($product);
    }

    $size = 800;
    $margin = 40;
    $square = imagecreatetruecolor($size, $size);
    imagefill($square, 0, 0, imagecolorallocate($square, 255, 255, 255));
    $width = imagesx($source);
    $height = imagesy($source);
    $ratio = min(($size - 2 * $margin) / $width, ($size - 2 * $margin) / $height);
    $newWidth = (int) ($width * $ratio);
    $newHeight = (int) ($height * $ratio);
    imagecopyresampled(
        $square, $source,
        (int) (($size - $newWidth) / 2), (int) (($size - $newHeight) / 2), 0, 0,
        $newWidth, $newHeight, $width, $height
    );

    ob_start();
    imagejpeg($square, null, 88);
    $jpeg = ob_get_clean();

    $upload = wp_upload_bits('produit-' . sanitize_title($product['sku']) . '.jpg', null, $jpeg);
    if (!empty($upload['error'])) {
        echo "  ! Image non créée : {$upload['error']}\n";
        return 0;
    }
    $attachmentId = wp_insert_attachment([
        'post_mime_type' => 'image/jpeg',
        'post_title'     => $product['brand'] . ' ' . $product['name'],
        'post_excerpt'   => 'Photo de test, voir scripts/seed-images/CREDITS.md',
        'post_status'    => 'inherit',
    ], $upload['file']);
    wp_update_attachment_metadata($attachmentId, wp_generate_attachment_metadata($attachmentId, $upload['file']));
    return $attachmentId;
}

/* ---------- Création des produits ---------- */

foreach ($products as $data) {
    $existingId = wc_get_product_id_by_sku($data['sku']);
    $product = $existingId ? wc_get_product($existingId) : new WC_Product_Simple();
    echo ($existingId ? 'Mise à jour' : 'Création') . " : {$data['brand']} {$data['name']} ({$data['sku']})\n";

    $product->set_name($data['name']);
    $product->set_status('publish');
    $product->set_sku($data['sku']);
    $product->set_regular_price($data['regular']);
    $product->set_sale_price($data['sale']);
    $product->set_short_description($data['short']);
    $product->set_description($data['short']);

    // Stock
    if (isset($data['quantity'])) {
        $product->set_manage_stock(true);
        $product->set_stock_quantity($data['quantity']);
        $product->set_low_stock_amount(3);
    } else {
        $product->set_manage_stock(false);
    }
    $product->set_stock_status($data['stock']);
    if ($data['stock'] === 'onbackorder') {
        $product->set_backorders('yes');
    }

    // Catégorie
    $category = get_term_by('slug', $data['category'], 'product_cat');
    if ($category) {
        $product->set_category_ids([$category->term_id]);
    } else {
        echo "  ! Catégorie introuvable : {$data['category']}\n";
    }

    // Étiquette (badge)
    $product->set_tag_ids($data['tag'] ? [npa_term_id($data['tag'], 'product_tag')] : []);

    // Attributs : les "filters" deviennent des filtres du catalogue, les "specs" des caractéristiques
    $attributes = [];
    $position = 0;
    foreach ($data['filters'] as $label => $value) {
        $taxonomy = npa_global_attribute($label, $value);
        $attribute = new WC_Product_Attribute();
        $attribute->set_id(wc_attribute_taxonomy_id_by_name($taxonomy));
        $attribute->set_name($taxonomy);
        $attribute->set_options([get_term_by('name', $value, $taxonomy)->term_id]);
        $attribute->set_position($position++);
        $attribute->set_visible(true);
        $attributes[] = $attribute;
    }
    foreach ($data['specs'] as $label => $value) {
        $attribute = new WC_Product_Attribute();
        $attribute->set_name($label);
        $attribute->set_options([$value]);
        $attribute->set_position($position++);
        $attribute->set_visible(true);
        $attributes[] = $attribute;
    }
    $product->set_attributes($attributes);

    $productId = $product->save();

    // Marque
    if (taxonomy_exists('product_brand')) {
        wp_set_object_terms($productId, [npa_term_id($data['brand'], 'product_brand')], 'product_brand');
    }

    // Véhicules compatibles
    $vehicleIds = array_filter(array_map('npa_vehicle_id', $data['vehicles']));
    wp_set_object_terms($productId, array_values($vehicleIds), 'product_vehicle');

    // Image (générée une seule fois, ou à nouveau avec --images)
    $oldImageId = $product->get_image_id();
    if (!$oldImageId || $regenerateImages) {
        $imageId = !empty($data['photo']) ? npa_import_photo($data) : npa_generate_image($data);
        if ($imageId) {
            set_post_thumbnail($productId, $imageId);
            if ($oldImageId) {
                wp_delete_attachment($oldImageId, true);
            }
        }
    }
}

wc_delete_product_transients();
echo "\nTerminé : " . count($products) . " produits.\n";
