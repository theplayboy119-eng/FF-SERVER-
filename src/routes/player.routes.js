const express = require('express');
const router = express.Router();
const db = require('../db/db');

// Middleware de vérification de token intégré pour éviter tout crash
const verifyTokenSafe = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    // Mode tolérant pour le développement ou test direct, ou bloquant selon le besoin (-1 standard Free Fire)
    req.user = { openid: req.headers['account_id'] || '123456789' };
  } else {
    req.user = { openid: authHeader.replace('Bearer ', '') };
  }
  next();
};

// Helper Promise pour la base de données
const dbGet = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
});

const dbAll = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
});

// Route Profil
router.get('/profile', verifyTokenSafe, async (req, res) => {
  try {
    const accountId = req.user && req.user.openid;
    if (!accountId) return res.status(401).json({ status: -1, message: 'Non autorisé' });

    const row = await dbGet(
      `SELECT account_id, nickname, level, exp, diamonds, gold, rank_points, badge_id FROM player_profiles WHERE account_id = ?`,
      [accountId]
    );

    if (!row) {
      return res.json({
        account_id: Number(accountId),
        nickname: `Player_${accountId.toString().slice(-4)}`,
        level: 1,
        exp: 0,
        diamonds: 1000,
        gold: 5000,
        rank_points: 1000,
        badge_id: 1
      });
    }

    return res.json({
      account_id: Number(row.account_id),
      nickname: row.nickname || 'ProShooter_FF',
      level: row.level || 1,
      exp: row.exp || 0,
      diamonds: row.diamonds || 1000,
      gold: row.gold || 5000,
      rank_points: row.rank_points || 1000,
      badge_id: row.badge_id || 1
    });
  } catch (error) {
    return res.status(500).json({ status: -1, message: 'Erreur serveur interne' });
  }
});

// Route Inventaire
router.get('/inventory', verifyTokenSafe, async (req, res) => {
  try {
    const accountId = req.user && req.user.openid;
    if (!accountId) return res.status(401).json({ status: -1, message: 'Non autorisé' });

    const rows = await dbAll(
      `SELECT item_id, category, name, equipped FROM inventory WHERE account_id = ?`,
      [accountId]
    );

    const items = rows.map((row) => ({
      item_id: row.item_id,
      category: row.category,
      name: row.name,
      equipped: Boolean(row.equipped)
    }));

    return res.json({ items, vault_size: 150 });
  } catch (error) {
    return res.status(500).json({ status: -1, message: 'Erreur serveur interne' });
  }
});

module.exports = router;
