// Informations du magasin affichées dans le header, le footer et les pages.
// Pour changer un numéro, une adresse ou un horaire, modifier ici uniquement.

export const site = {
  name: "NAB Pièces Auto",
  tagline: "Comptoir Automobile Marseille 10e",

  phone: "09 86 37 38 92",
  phoneHref: "tel:+33986373892",
  whatsapp: "07 61 99 29 84",
  whatsappHref: "https://wa.me/33761992984",
  email: "contact@nabpiecesauto-marseille.fr",

  address: {
    street: "158 Avenue de la Capelette",
    zip: "13010",
    city: "Marseille",
  },

  description:
    "Votre spécialiste indépendant de la distribution de pièces détachées automobiles neuves d'origine et de qualité équivalente à Marseille et région Provence-Alpes-Côte d'Azur.",

  // Horaires du comptoir
  hours: [
    "Lundi au Vendredi : 08h30 – 12h30 / 14h00 – 18h30",
    "Samedi : 09h00 – 13h00 (Comptoir & Retraits)",
    "Dimanche : Fermé",
  ],
  hoursShort:
    "Lun - Ven : 08h30 - 12h30 / 14h00 - 18h30 • Sam : 09h00 - 13h00 • Parking gratuit",
  mapsHref:
    "https://www.google.com/maps/search/?api=1&query=158+Avenue+de+la+Capelette+13010+Marseille",
  accessNote:
    "À 2 minutes de la sortie Rocade L2 Florian. Parking gratuit clients devant le magasin.",

  // Messages du bandeau tout en haut du site
  topbar: [
    "Comptoir Capelette 13010 ouvert",
    "Tél : 09 86 37 38 92",
    "Livraison Pro express Marseille & PACA",
    "Retrait comptoir gratuit 2h",
  ],
  topbarHighlight: "Pièces Neuves Garanties Constructeur",

  // Taux de TVA utilisé pour afficher le prix HT sur la fiche produit
  vatRate: 0.2,

  // Textes de la fiche produit
  product: {
    pickupTitle: "En stock immédiat comptoir Capelette",
    pickupText: "Retrait gratuit sous 1h au 158 Av. de la Capelette, 13010 Marseille.",
    deliveryTitle: "Livrable demain à Marseille & Bouches-du-Rhône (13)",
    deliveryText: "Commandez avant 16h30 pour livraison matinale en atelier ou domicile.",
    helpTitle: "Un doute sur votre montage ?",
    helpText:
      "Envoyez votre immatriculation ou carte grise par WhatsApp pour vérification atelier immédiate.",
    guarantees: ["Retour 14 jours", "Paiement garanti", "Facture pro TVA"],
    storeText:
      "Échange direct avec nos techniciens, vérification pièce sur établi avec vos anciennes pièces si nécessaire. Parking réservé clients.",
  },

  // Textes du panier
  cart: {
    storeBanner: "Comptoir Marseille Capelette (13010)",
    pickupInStock: "Retrait au comptoir dans 2h, articles en stock",
    pickupOnOrder: "Retrait au comptoir dès réception des articles sur commande",
    itemsNote: "Toutes les pièces sont neuves & certifiées OEM",
    // Textes affichés sous chaque mode de livraison. Les titres et les prix viennent
    // de WooCommerce : "match" est comparé au type du mode ou à son nom.
    shippingModes: [
      {
        match: "local_pickup",
        text: "158 Avenue de la Capelette, 13010 Marseille",
        noteInStock: "Disponible aujourd'hui sous 2h ouvrées",
        noteOnOrder: "Disponible dès réception des pièces",
      },
      {
        match: "Navette",
        text: "Livraison atelier garage ou domicile Marseille métropole",
        note: "Expédition départ quotidien 14h",
        // Même seuil que "shuttle_free_from" dans scripts/setup-woocommerce.php
        freeFrom: 80,
      },
      {
        match: "Colissimo",
        text: "France Métropolitaine avec suivi sécurisé par SMS",
      },
    ],
    guarantees: [
      "100% Pièces d'Origine Constructeur Garanties",
      "Paiement chiffré 3D Secure / CB",
      "30 jours pour changer d'avis & retour magasin gratuit",
    ],
    // Suivi du numéro du comptoir (phone ci-dessus)
    assistance: "Assistance Téléphonique Immédiate :",
  },

  // Note Google affichée dans le panier (statique pour l'instant)
  googleRating: {
    score: "4.8 / 5 sur Google",
    label: "Avis Clients",
    text: "+420 garages et particuliers satisfaits",
  },
};
