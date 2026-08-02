const db = require('../db/db');

// GET /player/profile
exports.getProfile = async (req, res) => {
  try {
    const openid = req.query.openid || (req.user ? req.user.openid : '100293847');

    db.get(
      `SELECT * FROM player_profiles WHERE account_id = ?`,
      [openid],
      (err, row) => {
        if (err || !row) {
          return res.json({
            status: 0,
            account_id: openid,
            nickname: 'ProShooter_FF',
            level: 1,
            exp: 0,
            diamonds: 1000,
            gold: 5000,
            rank_points: 1000,
            badge_id: 1
          });
        }

        return res.json({
          status: 0,
          ...row
        });
      }
    );
  } catch (error) {
    return res.status(500).json({ status: -1, message: error.message });
  }
};

// GET /player/inventory
exports.getInventory = async (req, res) => {
  try {
    const openid = req.query.openid || (req.user ? req.user.openid : '100293847');

    return res.json({
      status: 0,
      account_id: openid.toString(),
      items: [
        { item_id: 101, type: 'character', name: 'Kelly' },
        { item_id: 201, type: 'skin', name: 'Scar - Titan' }
      ]
    });
  } catch (error) {
    return res.status(500).json({ status: -1, message: error.message });
  }
};
