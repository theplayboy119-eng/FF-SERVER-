const express = require('express');
const router = express.Router();
const playerController = require('../controllers/player.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Sécurité : Vérifie si les fonctions du contrôleur existent pour éviter le crash au démarrage
const getProfileHandler = playerController.getProfile || ((req, res) => res.status(500).json({ status: -1, message: 'Controller getProfile missing' }));
const getInventoryHandler = playerController.getInventory || ((req, res) => res.status(500).json({ status: -1, message: 'Controller getInventory missing' }));

// Obtenir le profil complet du joueur (niveau, monnaies, stats)
router.get('/profile', verifyToken, getProfileHandler);

// Obtenir l'inventaire du joueur (personnages, skins, tenues)
router.get('/inventory', verifyToken, getInventoryHandler);

module.exports = router;
                                                           
