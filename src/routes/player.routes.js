const express = require('express');
const router = express.Router();
const playerController = require('../controllers/player.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Obtenir le profil complet du joueur (niveau, monnaies, stats)
router.get('/profile', verifyToken, playerController.getProfile);

// Obtenir l'inventaire du joueur (personnages, skins, tenues)
router.get('/inventory', verifyToken, playerController.getInventory);

module.exports = router;
