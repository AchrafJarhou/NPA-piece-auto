# Storefront WooCommerce React

Ce projet est un front-end React/Vite prêt à brancher sur votre back-office WooCommerce.

## Démarrage

1. Installez les dépendances : `npm install`
2. Lancez le serveur de dev : `npm run dev`
3. Consultez le site en developpement sur : `http://localhost:5173`

## Configuration API

Les fichiers `.env` ne sont pas versionnés. Copiez `.env.example` pour créer les deux fichiers suivants :

- `.env.development` : `VITE_API_URL=/woo-api` (le navigateur passe par le proxy Vite, ce qui évite les erreurs CORS)
- `.env.production` : `VITE_API_URL=http://localhost/votre-wordpress`, c'est ici que vous renseignerez l'adresse du site woocommerce (cible du proxy en dev, URL de l'API au build)

Relancez `npm run dev` après chaque modification d'un fichier `.env`.

## Build

`npm run build`

## Config wordpress

1. creez un dossier /wooc sur le server pour deployer wordpress/woocommerce.
2. installez les plug-in WooCommerce, WooCommerce Stripe Gateway, WooCommerce Tax et JWT Authentication for WP-API.
3. renseignez le fichier wp-config.php.
4. copiez le dossier /mu-plugins dans /wp-content.

## Wireframes

[Le lien Figma](https://www.figma.com/design/118Mfb9r0dApZskAojI4c4/Untitled?node-id=0-1&p=f)
