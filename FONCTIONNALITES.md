# Fonctionnalités du projet — NAB Pièces Auto (NPA)

Site de vente de pièces auto pour le comptoir **NAB Pièces Auto**, 158 Avenue de la Capelette, 13010 Marseille. Il s'adresse aux particuliers et aux garages.

- **Front** : React 18 + Vite, Redux Toolkit, React Router (ce dépôt, dossier `src/`).
- **Back** : WordPress + WooCommerce, utilisé « sans tête » (headless). Le site React appelle l'API de WordPress (`/wp-json/...`).
- **Code ajouté côté WordPress** : les fichiers de `mu-plugins/`, chargés automatiquement par WordPress.

La mise en ligne est décrite dans [DEPLOIEMENT.md](DEPLOIEMENT.md).

---

## 1. Démarrer le projet en local

1. WordPress local (WAMP / MAMP) avec WooCommerce, WooCommerce Stripe Payment Gateway, JWT Authentication for WP REST API (et WP Mail SMTP pour recevoir les e-mails).
2. Le dossier `wp-content/mu-plugins` de WordPress doit pointer vers le dossier `mu-plugins/` du projet (lien / jonction) : on modifie **uniquement** les fichiers du projet.
3. Dans `wp-config.php` de WordPress :
   ```php
   define('JWT_AUTH_SECRET_KEY', 'une-cle-aleatoire');
   define('JWT_AUTH_CORS_ENABLE', true);
   define('NPA_AUTH_SAMESITE', 'Lax');
   define('NPA_FRONT_URL', 'http://localhost:5173');
   ```
4. Configurer WooCommerce (TVA, livraison, paiement au retrait) :
   `php scripts/setup-woocommerce.php <chemin-du-wordpress>`
   Produits de démonstration : `php scripts/seed-products.php <chemin-du-wordpress>`
5. Créer `.env.development` (`VITE_API_URL=/woo-api`) et `.env.production` (`VITE_API_URL=http://localhost/wordpress-NPA`, cible du proxy Vite) à partir de `.env.example`.
6. `npm install` puis `npm run dev` → http://localhost:5173

En local, le navigateur appelle `/woo-api/...` et Vite transmet à WordPress (`vite.config.js`) : front et API sont sur la même adresse, le cookie de connexion fonctionne sans configuration.

---

## 2. Ce que voit le visiteur

### Accueil (`/`)
- Bandeau principal avec **recherche par véhicule** (marque → modèle → motorisation) et par référence.
- Familles de pièces (freinage, filtration, distribution...), arguments de réassurance, bandeau « Espace pros & garages », localisation du comptoir.

### En-tête et pied de page (toutes les pages)
- Recherche avec **suggestions** de produits pendant la frappe.
- Menu des catégories, téléphone du comptoir, accès compte (connexion / inscription), favoris, **mini-panier** (nombre d'articles et total).
- Pied de page : coordonnées, horaires, liens services, moyens de paiement, mentions légales, CGV, CGU, contact.

### Catalogue (`/catalogue`)
- Liste des pièces par catégorie, **filtrée par véhicule** si un véhicule est choisi (le filtre est vérifié côté WordPress).
- Filtres : budget (prix TTC), **en stock comptoir**, marques (équipementiers), caractéristiques techniques.
- Tri : pertinence, meilleures ventes, nouveautés, prix croissant / décroissant. Pagination.
- Ajout au panier direct depuis la carte produit.

### Fiche produit (`/product/:id`)
- Fil d'Ariane, galerie photos, caractéristiques principales en tuiles.
- Marque, référence, EAN, prix TTC et HT, remise éventuelle, disponibilité.
- **Stock** : la quantité n'est jamais affichée ; seul « Rupture de stock » apparaît, avec le bouton d'ajout désactivé.
- Choix des variantes, quantité, ajout au panier, « réserver pour retrait comptoir », favoris, aide WhatsApp.
- Onglets : véhicules compatibles, caractéristiques, description.
- **Avis clients** (section 4), produits similaires, encart du comptoir.

### Panier (`/panier`)
- Étapes de commande (Panier → Coordonnées → Paiement).
- Articles : photo, marque, référence, « En stock Capelette » ou « Sur commande », prix de la ligne et prix unitaire TTC, quantités (dans les limites WooCommerce), suppression.
- **Vérification de compatibilité** : le client peut saisir son immatriculation (AB-123-CD) ou son numéro VIN (contrôle du format).
- Code promo (codes créés dans WooCommerce → Marketing → Codes promo).
- **Mode d'obtention** : retrait comptoir (gratuit, présélectionné), navette express 13 / PACA (offerte dès le seuil réglé dans WooCommerce), Colissimo. Titres, prix et seuil viennent de WooCommerce ; les textes descriptifs sont dans `src/config/site.js`.
- **Récapitulatif** : total HT, TVA, port, total TTC, **tous calculés par WooCommerce** (le front ne calcule aucun montant).
- Boutons « Valider ma commande & payer » et « Régler directement au comptoir » (choisit le retrait puis mène à la commande).

### Commande (`/commande`)
- Adresses de livraison et de facturation (France uniquement, comme les zones de livraison), e-mail, paiement par carte via **Stripe**.
- Proposition de se connecter ou de commander en invité.
- ⚠️ Pas encore fait : le choix « payer au comptoir » sur cette page (WooCommerce le propose déjà quand le retrait est choisi) et l'envoi de l'immatriculation / VIN saisi dans le panier avec la commande.

### Confirmation de commande (`/success/:id?key=...`)
- Bandeau « commande confirmée », statut, date.
- « Et maintenant ? » : retrait (adresse, horaires, itinéraire) ou livraison (adresse), mode de paiement.
- Récapitulatif des articles et des montants.
- Accessible seulement avec la **clé secrète de la commande** (reçue après le paiement) ou par le client connecté propriétaire de la commande.

### Compte client
- **Inscription** (fenêtre « Compte pro / part. ») : particulier, ou **professionnel avec SIRET** (vérifié via l'API publique recherche-entreprises, adresse de l'entreprise préremplie). E-mail de bienvenue.
- **Connexion / déconnexion** par cookie sécurisé (section 5).
- **Profil** (`/profile`) : informations, adresses de facturation et de livraison, historique des commandes avec détail, suppression du compte.
- **Mot de passe oublié** : e-mail avec lien vers `/new-password`.
- **Favoris** : gardés dans le navigateur pour un invité, enregistrés dans le compte après connexion (et fusionnés).

### Contact (`/contact`)
- Texte d'introduction modifiable dans WordPress (page `contact`).
- Formulaire : nom, e-mail, téléphone, **sujet** (pièce, devis / VIN, compte pro, suivi de commande, autre), immatriculation ou VIN, message, consentement RGPD. Le lien `/contact?sujet=devis` présélectionne un sujet.
- Coordonnées du comptoir, horaires, appel, WhatsApp, itinéraire.

### Pages de contenu
- Mentions légales, CGV, CGU : contenu des pages WordPress, mis en forme aux couleurs du site.
- Blog (`/blog`, `/blog/:slug`) : articles WordPress.

---

## 3. Ce que gère le client dans l'admin WordPress (sans code)

| Besoin | Où |
|---|---|
| Produits, prix (**TTC**), stock, photos, marques, catégories | Produits |
| Véhicules compatibles (Marque → Modèle → Motorisation) | Produits → Véhicules, puis cocher dans chaque produit |
| Tarifs de livraison (**saisis TTC**), seuil de la navette gratuite, nouveaux modes simples | WooCommerce → Réglages → Expédition |
| Codes promo | Marketing → Codes promo |
| Commandes (statut, remboursement) | WooCommerce → Commandes |
| **Avis clients à valider** | Produits → Avis (ou Commentaires) |
| **Messages du formulaire de contact** | Messages contact |
| Textes des mentions légales, CGV, CGU, contact | Pages |
| E-mails (expéditeur, logo, textes) | WooCommerce → Réglages → E-mails |

Un mode de livraison qui demande un choix supplémentaire au client (point relais Mondial Relay, créneau...) nécessite un développement : seuls les modes simples (forfait, livraison gratuite, retrait) s'affichent automatiquement.

---

## 4. Règles métier importantes

- **TVA** : prix des produits et frais de port saisis **TTC** ; WooCommerce extrait la TVA (20 %). Le mu-plugin `cart.php` convertit les frais de port saisis TTC.
- **Livraison** : France uniquement. Sans adresse saisie, les frais sont estimés pour le 13010. La navette payante est masquée quand la navette gratuite s'applique (les deux doivent porter le même nom).
- **Paiement au comptoir** : proposé par WooCommerce uniquement avec le retrait comptoir.
- **Avis** : seuls les clients **connectés qui ont acheté le produit** peuvent noter, un avis par produit ; l'avis est **en attente** jusqu'à validation par le comptoir, puis affiché avec « achat vérifié ».
- **Stock** : quantité jamais affichée, seulement la rupture.
- **Validation côté serveur** : tout ce qui vient du navigateur (véhicule, sujet de contact, note d'avis, SIRET...) est revérifié par WordPress.

---

## 5. Sécurité

- **Connexion par cookie HttpOnly** (`mu-plugins/auth.php`) : le jeton JWT est dans un cookie illisible par JavaScript ; rien de sensible dans `localStorage`. Un cookie expiré ou invalide est effacé et le visiteur continue en invité.
- **Protection CSRF** : toute requête qui modifie des données avec le cookie doit envoyer l'en-tête `X-NPA-CSRF` (code reçu à la connexion). `src/utils/apiFetch.js` l'ajoute automatiquement.
- **CORS** : WordPress n'autorise que les adresses listées dans `NPA_FRONT_ORIGINS` (aucune par défaut).
- **XSS** : tout HTML venant de WordPress est nettoyé avec **DOMPurify** (`src/utils/sanitizeHtml.js`) avant affichage.
- **Anti-abus** : connexion limitée à 10 essais / 15 min, inscription et formulaire de contact à 5 / heure par adresse IP ; champ piège anti-robots sur le contact.
- **Paiement** : les données de carte vont directement chez Stripe, jamais sur nos serveurs.

---

## 6. Organisation du code

### Front (`src/`)

| Dossier / fichier | Rôle |
|---|---|
| `pages/` | une page par route (Accueil, Catalogue, Fiche produit, Panier, Commande, Confirmation, Profil, Contact...) |
| `components/` | un composant par bloc, chacun avec son `index.jsx` et son `index.scss` |
| `slices/` | état Redux (panier, utilisateur, catalogue, filtres, véhicules, favoris...) |
| `thunkActionsCreator/` | appels à l'API WordPress / WooCommerce |
| `store/cartIdentityListener.jsx` | recharge panier et favoris quand le client se connecte ou se déconnecte |
| `config/site.js` | **textes et infos du magasin** (adresse, téléphone, horaires, textes du panier, sujets du contact) : à modifier ici uniquement |
| `styles/variables.scss` | **couleurs, polices, tailles** du site ; `styles/buttons.scss` : boutons `btn btn-primary`, `btn-dark`, `btn-light` |
| `utils/` | `apiFetch` (cookie + CSRF), `sanitizeHtml` (DOMPurify), `formatPrice`, `vehicleCheck` (plaque / VIN)... |

### WordPress (`mu-plugins/`)

| Fichier | Rôle |
|---|---|
| `auth.php` | connexion par cookie, CSRF, CORS — routes `auth/login`, `auth/logout`, `auth/me` |
| `register.php`, `siret.php` | inscription particulier / pro, vérification du SIRET, e-mail de bienvenue |
| `reset-password.php` | mot de passe oublié — routes `reset-password`, `new-password` |
| `customer.php`, `user.php` | profil et adresses du client, suppression du compte |
| `orders.php`, `order-confirmation.php` | commandes du client, récapitulatif de la page de confirmation |
| `cart.php` | panier : frais estimés pour le 13010, port saisi TTC, retrait présélectionné, marque des articles, seuils de livraison gratuite |
| `products.php`, `vehicules.php` | produits filtrés par véhicule, taxonomie « Véhicules » |
| `reviews.php` | avis : éligibilité (achat vérifié) et dépôt en modération |
| `wishlist.php` | favoris du client |
| `contact.php` | formulaire de contact : validation, anti-spam, « Messages contact », e-mail |
| `emails.php`, `mailing.php` | liens des e-mails vers le site React, expéditeur des e-mails |
| `stripe.php` | clé publique Stripe pour le front |
| `jwt-auth.php`, `theme.php` | compatibilité jeton / cookies WordPress, réglages du thème |

### Scripts (`scripts/`)
- `setup-woocommerce.php` : configuration de WooCommerce (une seule fois par installation).
- `seed-products.php` : produits de démonstration (jamais sur la boutique réelle).

### Principales routes API ajoutées (`/wp-json/custom/v1/...`)

| Route | Méthode | Usage |
|---|---|---|
| `auth/login`, `auth/logout`, `auth/me` | POST, POST, GET | connexion par cookie |
| `register` | POST | inscription |
| `reset-password`, `new-password` | POST | mot de passe oublié |
| `customer` | GET, PUT | profil et adresses |
| `user` | DELETE | suppression du compte |
| `orders` | GET | commandes du client |
| `order-confirmation/{id}` | GET | page de confirmation |
| `products`, `products/{id}`, `products-collection-data` | GET | catalogue et fiche produit |
| `wishlist` | GET, POST, DELETE | favoris |
| `reviews/eligibility`, `reviews` | GET, POST | avis |
| `contact` | POST | formulaire de contact |
| `stripe` | GET | clé publique Stripe |

Le panier et la commande utilisent l'API standard de WooCommerce (`/wp-json/wc/store/v1/cart`, `/checkout`).
