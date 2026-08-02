const express = require('express');
const router = express.Router();
const matchmakingController = require('../controllers/matchmaking.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Inscription dans la file d'attente de matchmaking (Battle Royale / Clash Squad)
router.post('/matchmaking/join', verifyToken, matchmakingController.joinMatchmaking);

// Obtention du classement général des meilleurs joueurs
router.get('/leaderboard/global', verifyToken, matchmakingController.getGlobalLeaderboard);

module.exports = router;
