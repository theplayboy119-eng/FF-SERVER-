const crypto = require('crypto');
const db = require('../db/db');
const jwtService = require('../services/jwt.service');

// Générateur de chaîne hexadécimale aléatoire
const generateRandomHex = (length = 16) => {
  return crypto.randomBytes(length).toString('hex');
};

const oauthController = {
  // POST /oauth/guest/register - Création d'un compte invité
  guestRegister: async (req, res) => {
    try {
      const devkey = req.body.devkey || req.body.device_id || generateRandomHex(8);
      const guestAccount = `guest_${generateRandomHex(4)}`;
      const passwordHash = crypto.createHash('md5').update(devkey + Date.now()).digest('hex');
      const openid = Math.floor(100000000 + Math.random() * 900000000);

      const createdAt = Math.floor(Date.now() / 1000);

      db.run(
        `INSERT INTO accounts (openid, guest_account, password_hash, created_at, region) VALUES (?, ?, ?, ?, ?)`,
        [openid, guestAccount, passwordHash, createdAt, 'EU'],
        function (err) {
          if (err) {
            return res.status(500).json({
              status: -1,
              message: 'Erreur lors de la création du compte invité'
            });
          }

          // Initialisation du profil joueur par défaut
          const defaultNickname = `Player_${openid.toString().slice(-4)}`;
          db.run(
            `INSERT INTO player_profiles (account_id, nickname, level, exp, diamonds, gold, rank_points, badge_id) VALUES (?, ?, 1, 0, 1000, 5000, 1000, 1)`,
            [openid, defaultNickname]
          );

          return res.json({
            status: 0,
            uid: openid,
            guest_account: guestAccount,
            password_hash: passwordHash
          });
        }
      );
    } catch (error) {
      return res.status(500).json({ status: -1, message: error.message });
    }
  },

  // POST /oauth/guest/token/grant - Obtention d'un jeton d'accès pour un compte invité
  guestTokenGrant: async (req, res) => {
    try {
      const { guest_account, password_hash, openid } = req.body;

      const query = openid
        ? `SELECT openid FROM accounts WHERE openid = ?`
        : `SELECT openid FROM accounts WHERE guest_account = ?`;
      const params = openid ? [openid] : [guest_account];

      db.get(query, params, (err, user) => {
        const activeOpenId = user ? user.openid : (openid || 100293847);
        
        const accessToken = `ff_gt_${generateRandomHex(10)}`;
        const refreshToken = `ff_rt_${generateRandomHex(6)}`;

        return res.json({
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_in: 86400,
          openid: activeOpenId.toString()
        });
      });
    } catch (error) {
      return res.status(500).json({ status: -1, message: error.message });
    }
  },

  // POST /oauth/token - Authentification principale par identifiants Garena / Email
  loginToken: async (req, res) => {
    try {
      const { username, password, openid } = req.body;

      const query = `SELECT openid FROM accounts WHERE openid = ? OR email = ? OR guest_account = ? LIMIT 1`;
      db.get(query, [openid || username, username, username], (err, user) => {
        const activeOpenId = user ? user.openid : (openid || 100293847);

        const accessToken = `ff_at_${generateRandomHex(10)}`;
        const refreshToken = `ff_rt_${generateRandomHex(10)}`;

        return res.json({
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_in: 86400,
          openid: activeOpenId.toString()
        });
      });
    } catch (error) {
      return res.status(500).json({ status: -1, message: error.message });
    }
  },

  // POST /oauth/token/exchange - Échange d'un jeton tiers (Facebook, Google, VK, Line)
  tokenExchange: async (req, res) => {
    try {
      const { platform, token, openid } = req.body;
      const targetOpenId = openid || 100293847;

      const accessToken = `ff_at_ex_${generateRandomHex(10)}`;
      const refreshToken = `ff_rt_ex_${generateRandomHex(10)}`;

      return res.json({
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: 86400,
        openid: targetOpenId.toString()
      });
    } catch (error) {
      return res.status(500).json({ status: -1, message: error.message });
    }
  },

  // POST /oauth/token/refresh - Rafraîchissement d'un jeton d'accès expiré
  tokenRefresh: async (req, res) => {
    try {
      const { refresh_token } = req.body;

      const accessToken = `ff_at_new_${generateRandomHex(10)}`;
      const refreshToken = `ff_rt_new_${generateRandomHex(10)}`;

      return res.json({
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: 86400
      });
    } catch (error) {
      return res.status(500).json({ status: -1, message: error.message });
    }
  },

  // POST /oauth/logout - Déconnexion de la session joueur
  logout: async (req, res) => {
    try {
      return res.json({
        status: 0,
        message: 'Logged out successfully'
      });
    } catch (error) {
      return res.status(500).json({ status: -1, message: error.message });
    }
  },

  // GET /oauth/user/info/get - Récupération des informations de compte MSDK
  getUserInfo: async (req, res) => {
    try {
      const openid = req.query.openid || (req.user ? req.user.openid : '100293847');

      db.get(
        `SELECT a.openid, a.region, a.created_at, p.nickname, p.avatar_url 
         FROM accounts a 
         LEFT JOIN player_profiles p ON a.openid = p.account_id 
         WHERE a.openid = ?`,
        [openid],
        (err, row) => {
          if (err || !row) {
            return res.json({
              openid: openid.toString(),
              nickname: 'ProShooter_FF',
              avatar_url: 'https://cdn.freefire.com/avatars/101.png',
              region: 'EU',
              created_at: 1620000000
            });
          }

          return res.json({
            openid: row.openid.toString(),
            nickname: row.nickname || 'ProShooter_FF',
            avatar_url: row.avatar_url || 'https://cdn.freefire.com/avatars/101.png',
            region: row.region || 'EU',
            created_at: row.created_at || 1620000000
          });
        }
      );
    } catch (error) {
      return res.status(500).json({ status: -1, message: error.message });
    }
  }
};

module.exports = oauthController;
                                                       
