const express = require('express');
const router = express.Router();
const oauthController = require('../controllers/oauth.controller');

// Création d'un compte invité (Guest Account)
router.post('/guest/register', oauthController.guestRegister);

// Obtention d'un jeton d'accès pour un compte invité
router.post('/guest/token/grant', oauthController.guestTokenGrant);

// Authentification principale (Garena / Email / Mot de passe)
router.post('/token', oauthController.loginToken);

// Échange d'un jeton tiers (Facebook, Google, VK, Line)
router.post('/token/exchange', oauthController.tokenExchange);

// Rafraîchissement d'un jeton d'accès expiré
router.post('/token/refresh', oauthController.tokenRefresh);

// Récupération des informations de compte MSDK
router.get('/user/info/get', oauthController.getUserInfo);

module.exports = router;
