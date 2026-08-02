const express = require('express');
const router = express.Router();
const oauthController = require('../controllers/oauth.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Création d'un compte invité (Guest Account)
router.post('/guest/register', oauthController.registerGuest);

// Obtention d'un jeton d'accès pour un compte invité
router.post('/guest/token/grant', oauthController.grantGuestToken);

// Authentification principale (Garena / Email / Mot de passe)
router.post('/token', oauthController.loginToken);

// Échange d'un jeton tiers (Facebook, Google, VK, Line)
router.post('/token/exchange', oauthController.exchangeToken);

// Rafraîchissement d'un jeton d'accès expiré
router.post('/token/refresh', oauthController.refreshToken);

// Déconnexion de la session joueur
router.post('/logout', verifyToken, oauthController.logout);

// Récupération des informations de compte MSDK
router.get('/user/info/get', verifyToken, oauthController.getUserInfo);

module.exports = router;
