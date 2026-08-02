const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shop.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// GET /api/v1/shop/items - Obtenir le catalogue complet de la boutique
router.get('/items', shopController.getShopItems);

// POST /api/v1/shop/buy - Acheter un article et déduire la monnaie du joueur
router.post('/buy', authMiddleware, shopController.buyShopItem);

module.exports = router;
