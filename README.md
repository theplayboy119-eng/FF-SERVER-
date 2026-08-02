# FreeFire-Backend-NodeExpress

Serveur d'émulation backend complet pour le jeu mobile **Garena Free Fire** (`com.dts.freefireth` v1.70.0). Ce projet reproduit le pipeline d'authentification MSDK/Garena OAuth, la gestion des profils de joueurs, l'inventaire, le catalogue de la boutique, les transactions de devises (diamants/or), le système de matchmaking et les classements mondiaux.

---

## Sommaire

1. [Fonctionnalités](#fonctionnalités)
2. [Prérequis](#prérequis)
3. [Arborescence du Projet](#arborescence-du-projet)
4. [Installation](#installation)
5. [Configuration (.env)](#configuration-env)
6. [Initialisation de la Base de Données](#initialisation-de-la-base-de-données)
7. [Exécution](#exécution)
   - [Mode Développement](#mode-développement)
   - [Mode Production](#mode-production)
   - [Déploiement Docker](#déploiement-docker)
8. [Documentation des Endpoints API](#documentation-des-endpoints-api)
   - [Authentification OAuth & MSDK](#authentification-oauth--msdk)
   - [Télémétrie & Appareils](#télémétrie--appareils)
   - [Profil Joueur & Inventaire](#profil-joueur--inventaire)
   - [Boutique & Achats](#boutique--achats)
   - [Matchmaking & Classements](#matchmaking--classements)
9. [Exemples de Tests avec cURL](#exemples-de-tests-avec-curl)
10. [Licence](#licence)

---

## Fonctionnalités

- **Authentification MSDK / Garena OAuth** : Création de comptes invités, authentification par identifiants classiques, échange de jetons tiers (Facebook, Google, VK, Line) et rafraîchissement automatique de tokens JWT.
- **Sécurité & Middleware** : Protection des endpoints par entêtes Bearer Token et validation du hash de signature d'appareil (`devkey`, `app_id`, `openid`).
- **Gestion des Joueurs** : Calcul des niveaux, expérience, badges, gestion dynamique du solde d'or et de diamants.
- **Système d'Inventaire** : Chargement des skins d'armes, personnages débloqués et objets du coffre du joueur.
- **Boutique Intégrée** : Achat d'articles avec validation en temps réel des soldes de devises virtuelles et ajout instantané à l'inventaire.
- **Matchmaking & Serveurs de Jeu** : Émulation des files d'attente de combat et affectation d'adresses IP/Ports pour les serveurs de jeu.
- **Classements Mondiaux** : Génération des classements des meilleurs joueurs basés sur les points de rang.

---

## Prérequis

- **Node.js** : v16.0.0 ou plus récent
- **npm** : v7.0.0 ou plus récent
- **SQLite3** : Utilisé pour le stockage local des comptes et profils
- **Docker** *(Optionnel)* : Pour le déploiement sous forme de conteneur

---

## Arborescence du Projet

```text
FreeFire-Backend-NodeExpress/
├── .env.example                     # Exemple de variables d'environnement
├── Dockerfile                       # Configuration de conteneurisation Docker
├── README.md                        # Documentation complète du projet
├── package.json                     # Dépendances npm et scripts du projet
└── src/
    ├── app.js                       # Express app, middlewares globaux et routes
    ├── server.js                    # Point d'entrée HTTP
    ├── config/
    │   └── index.js                 # Centralisation de la configuration et des constantes
    ├── controllers/
    │   ├── matchmaking.controller.js # Gestion du matchmaking et des classements
    │   ├── oauth.controller.js       # Authentification, tokens et comptes invités
    │   ├── player.controller.js      # Profils joueurs et inventaire
    │   └── shop.controller.js        # Boutique et transactions
    ├── db/
    │   ├── db.js                    # Connexion SQLite3 et initialisation
    │   └── schema.sql               # Schéma SQL des tables de la base de données
    ├── middlewares/
    │   └── auth.middleware.js       # Middleware de validation des jetons JWT Bearer
    ├── routes/
    │   ├── matchmaking.routes.js    # Routes de matchmaking et classement
    │   ├── oauth.routes.js          # Routes /oauth/*
    │   ├── player.routes.js         # Routes /api/v1/player/*
    │   └── shop.routes.js           # Routes /api/v1/shop/*
    └── services/
        └── jwt.service.js           # Service de génération et vérification de tokens
```

---

## Installation

1. Cloner le dépôt et se placer dans le répertoire du projet :
   ```bash
   git clone https://github.com/example/FreeFire-Backend-NodeExpress.git
   cd FreeFire-Backend-NodeExpress
   ```

2. Installer les dépendances npm :
   ```bash
   npm install
   ```

3. Créer le fichier d'environnement à partir de l'exemple :
   ```bash
   cp .env.example .env
   ```

---

## Configuration (.env)

Éditer le fichier `.env` selon vos besoins :

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=freefire_super_secret_jwt_key_2023
JWT_EXPIRES_IN=86400
REFRESH_TOKEN_EXPIRES_IN=604800
DB_FILE=./src/db/freefire.sqlite
MSDK_APP_ID=100067
CDN_PATCH_URL=https://dl.ff.garena.com/patch
```

---

## Initialisation de la Base de Données

La base de données SQLite est automatiquement créée et initialisée au lancement du serveur si le fichier spécifié dans `DB_FILE` n'existe pas encore. Les tables créées par `src/db/schema.sql` sont :

- `accounts` : Stockage des identifiants, hashs de mots de passe et comptes invités.
- `player_profiles` : Niveaux, statistiques, points de rang, solde de monnaie (or/diamants).
- `inventory` : Objets, personnages et skins possédés par les joueurs.
- `shop_items` : Catalogue d'articles disponibles à l'achat.
- `leaderboards` : Classements globaux des joueurs.

---

## Exécution

### Mode Développement

Pour lancer le serveur avec rechargement automatique en cas de modification de code :

```bash
npm run dev
```

### Mode Production

Pour démarrer le serveur en mode production :

```bash
npm start
```

### Déploiement Docker

1. Construire l'image Docker :
   ```bash
   docker build -t freefire-backend .
   ```

2. Lancer le conteneur sur le port 3000 :
   ```bash
   docker run -d -p 3000:3000 --name freefire-backend-server freefire-backend
   ```

---

## Documentation des Endpoints API

### Authentification OAuth & MSDK

#### `POST /oauth/guest/register`
Création d'un compte invité lié au matériel du périphérique.

- **Requête** :
  ```json
  {
    "device_id": "a1b2c3d4-e5f6-7890"
  }
  ```
- **Réponse Succès (200 OK)** :
  ```json
  {
    "status": 0,
    "uid": 100293847,
    "guest_account": "guest_a1b2c3d4",
    "password_hash": "e10adc3949ba59abbe56e057f20f883e"
  }
  ```

#### `POST /oauth/guest/token/grant`
Obtention d'un jeton d'accès pour un compte invité.

- **Requête** :
  ```json
  {
    "guest_account": "guest_a1b2c3d4",
    "password_hash": "e10adc3949ba59abbe56e057f20f883e"
  }
  ```
- **Réponse Succès (200 OK)** :
  ```json
  {
    "access_token": "ff_gt_8f9a2b3c4d5e6f7a8b9c",
    "refresh_token": "ff_rt_1a2b3c4d5e6f",
    "expires_in": 86400,
    "openid": "100293847"
  }
  ```

#### `POST /oauth/token`
Authentification principale par identifiants Garena / Email / Mot de passe.

- **Requête** :
  ```json
  {
    "username": "player@example.com",
    "password": "user_password"
  }
  ```
- **Réponse Succès (200 OK)** :
  ```json
  {
    "access_token": "ff_at_99238472918374928173",
    "refresh_token": "ff_rt_88273645102938475610",
    "expires_in": 86400,
    "openid": "100293847"
  }
  ```

#### `POST /oauth/token/exchange`
Échange d'un jeton tiers (Facebook, Google, VK, Line) contre un jeton de session Free Fire.

- **Requête** :
  ```json
  {
    "platform": "facebook",
    "third_party_token": "EAAGm0PX4ZC0BA..."
  }
  ```
- **Réponse Succès (200 OK)** :
  ```json
  {
    "access_token": "ff_at_ex_77281938401928374619",
    "refresh_token": "ff_rt_ex_66271829304958172635",
    "expires_in": 86400,
    "openid": "100293847"
  }
  ```

#### `POST /oauth/token/refresh`
Rafraîchissement d'un jeton d'accès expiré.

- **Requête** :
  ```json
  {
    "refresh_token": "ff_rt_88273645102938475610"
  }
  ```
- **Réponse Succès (200 OK)** :
  ```json
  {
    "access_token": "ff_at_new_11223344556677889900",
    "refresh_token": "ff_rt_new_00998877665544332211",
    "expires_in": 86400
  }
  ```

#### `POST /oauth/logout`
Révocation du jeton d'accès actif et déconnexion.

- **En-têtes** : `Authorization: Bearer <access_token>`
- **Réponse Succès (200 OK)** :
  ```json
  {
    "status": 0,
    "message": "Logged out successfully"
  }
  ```

#### `GET /oauth/user/info/get`
Récupération des informations de compte MSDK.

- **En-têtes** : `Authorization: Bearer <access_token>`
- **Réponse Succès (200 OK)** :
  ```json
  {
    "openid": "100293847",
    "nickname": "ProShooter_FF",
    "avatar_url": "https://cdn.freefire.com/avatars/101.png",
    "region": "EU",
    "created_at": 1620000000
  }
  ```

---

### Télémétrie & Appareils

#### `POST /api/device/register`
Enregistrement des télémétries de l'appareil et version APK client.

- **Requête** :
  ```json
  {
    "app_id": 100067,
    "devkey": "device_unique_key_12345",
    "client_version": "1.70.0"
  }
  ```
- **Réponse Succès (200 OK)** :
  ```json
  {
    "status": 0,
    "config": {
      "enable_analytics": true,
      "cdn_host": "https://dl.ff.garena.com/patch"
    }
  }
  ```

---

### Profil Joueur & Inventaire

#### `GET /api/v1/player/profile`
Récupération des données de profil du joueur.

- **En-têtes** : `Authorization: Bearer <access_token>`
- **Réponse Succès (200 OK)** :
  ```json
  {
    "account_id": 100293847,
    "nickname": "ProShooter_FF",
    "level": 42,
    "exp": 128500,
    "diamonds": 1250,
    "gold": 34500,
    "rank_points": 2150,
    "badge_id": 12
  }
  ```

#### `GET /api/v1/player/inventory`
Liste des objets et équipements débloqués.

- **En-têtes** : `Authorization: Bearer <access_token>`
- **Réponse Succès (200 OK)** :
  ```json
  {
    "items": [
      {
        "item_id": 2001,
        "category": "character",
        "name": "Alok",
        "equipped": true
      },
      {
        "item_id": 5012,
        "category": "weapon_skin",
        "name": "AK47-Dragon",
        "equipped": true
      }
    ],
    "vault_size": 150
  }
  ```

---

### Boutique & Achats

#### `GET /api/v1/shop/items`
Consultation du catalogue d'articles de la boutique.

- **Réponse Succès (200 OK)** :
  ```json
  {
    "catalog": [
      {
        "shop_id": 101,
        "item_id": 3005,
        "name": "Caisse d'Armes M4A1",
        "price_diamonds": 50,
        "price_gold": 0
      },
      {
        "shop_id": 102,
        "item_id": 2004,
        "name": "Chrono",
        "price_diamonds": 599,
        "price_gold": 0
      }
    ]
  }
  ```

#### `POST /api/v1/shop/buy`
Achat d'un article et déduction de la monnaie virtuelle.

- **En-têtes** : `Authorization: Bearer <access_token>`
- **Requête** :
  ```json
  {
    "shop_id": 101,
    "quantity": 1
  }
  ```
- **Réponse Succès (200 OK)** :
  ```json
  {
    "status": 0,
    "remaining_diamonds": 1200,
    "remaining_gold": 34500,
    "added_items": [
      {
        "item_id": 3005,
        "count": 1
      }
    ]
  }
  ```

---

### Matchmaking & Classements

#### `POST /api/v1/matchmaking/join`
Inscription dans la file de matchmaking pour obtenir une session de jeu.

- **En-têtes** : `Authorization: Bearer <access_token>`
- **Requête** :
  ```json
  {
    "mode": "battle_royale"
  }
  ```
- **Réponse Succès (200 OK)** :
  ```json
  {
    "status": 0,
    "ticket": "mm_tk_981273918273",
    "estimated_wait_time": 12,
    "server_ip": "185.220.101.5",
    "server_port": 7777
  }
  ```

#### `GET /api/v1/leaderboard/global`
Obtention du classement mondial des meilleurs joueurs.

- **Réponse Succès (200 OK)** :
  ```json
  {
    "leaderboard": [
      {
        "rank": 1,
        "account_id": 100100100,
        "nickname": "FF_King",
        "rank_points": 4500
      },
      {
        "rank": 2,
        "account_id": 100293847,
        "nickname": "ProShooter_FF",
        "rank_points": 2150
      }
    ]
  }
  ```

---

## Exemples de Tests avec cURL

### 1. Inscription Invité
```bash
curl -X POST http://localhost:3000/oauth/guest/register \
  -H "Content-Type: application/json" \
  -d '{"device_id": "test_device_123"}'
```

### 2. Récupération des données du profil joueur
```bash
curl -X GET http://localhost:3000/api/v1/player/profile \
  -H "Authorization: Bearer ff_at_99238472918374928173"
```

### 3. Achat d'un objet en boutique
```bash
curl -X POST http://localhost:3000/api/v1/shop/buy \
  -H "Authorization: Bearer ff_at_99238472918374928173" \
  -H "Content-Type: application/json" \
  -d '{"shop_id": 101, "quantity": 1}'
```

---

## Licence

Ce projet est fourni à des fins de recherche, d'apprentissage et de développement éducatif. Tous les droits relatifs au jeu original et aux marques associées appartiennent à **Garena Online Private Limited**.
