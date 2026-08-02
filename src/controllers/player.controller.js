const db = require('../db/db');

// Helper Promise pour exécuter une requête SQL unique
const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
};

// Helper Promise pour exécuter une requête SQL renvoyant un ensemble de lignes
const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

/**
 * Récupère le profil complet du joueur connecté.
 * URL: GET /api/v1/player/profile
 */
const getProfile = async (req, res) => {
  try {
    const accountId = req.user && req.user.openid;

    if (!accountId) {
      return res.status(401).json({ status: -1, message: 'Non autorisé' });
    }

    const row = await dbGet(
      `SELECT p.account_id, a.nickname, p.level, p.exp, p.diamonds, p.gold, p.rank_points, p.badge_id
       FROM player_profiles p
       JOIN accounts a ON p.account_id = a.openid
       WHERE p.account_id = ?`,
      [accountId]
    );

    if (!row) {
      return res.status(404).json({ status: -1, message: 'Profil introuvable' });
    }

    return res.json({
      account_id: Number(row.account_id),
      nickname: row.nickname,
      level: row.level,
      exp: row.exp,
      diamonds: row.diamonds,
      gold: row.gold,
      rank_points: row.rank_points,
      badge_id: row.badge_id
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    return res.status(500).json({ status: -1, message: 'Erreur serveur interne' });
  }
};

/**
 * Récupère l'inventaire complet d'équipements du joueur.
 * URL: GET /api/v1/player/inventory
 */
const getInventory = async (req, res) => {
  try {
    const accountId = req.user && req.user.openid;

    if (!accountId) {
      return res.status(401).json({ status: -1, message: 'Non autorisé' });
    }

    const rows = await dbAll(
      `SELECT item_id, category, name, equipped
       FROM inventory
       WHERE account_id = ?`,
      [accountId]
    );

    const items = rows.map((row) => ({
      item_id: row.item_id,
      category: row.category,
      name: row.name,
      equipped: Boolean(row.equipped)
    }));

    return res.json({
      items,
      vault_size: 150
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'inventaire:', error);
    return res.status(500).json({ status: -1, message: 'Erreur serveur interne' });
  }
};

module.exports = {
  getProfile,
  getInventory
};



