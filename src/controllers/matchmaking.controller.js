const db = require('../db/db');
const crypto = require('crypto');

/**
 * Rejoint la file d'attente du matchmaking (Battle Royale / Clash Squad)
 * Endpoint: POST /api/v1/matchmaking/join
 */
exports.joinMatchmaking = async (req, res) => {
  try {
    const { mode = 'battle_royale' } = req.body || {};

    // Génération d'un ticket de matchmaking aléatoire
    const ticketHex = crypto.randomBytes(6).toString('hex');
    const ticket = `mm_tk_${ticketHex}`;

    // Réponse émulée décrivant l'affectation du serveur
    const responseData = {
      status: 0,
      ticket: ticket,
      estimated_wait_time: 12,
      server_ip: '185.220.101.5',
      server_port: 7777
    };

    return res.status(200).json(responseData);
  } catch (error) {
    return res.status(500).json({
      status: -1,
      message: 'Erreur lors du traitement du matchmaking',
      error: error.message
    });
  }
};

/**
 * Récupère le classement mondial des joueurs
 * Endpoint: GET /api/v1/leaderboard/global
 */
exports.getGlobalLeaderboard = async (req, res) => {
  try {
    const sql = `
      SELECT account_id, nickname, rank_points 
      FROM player_profiles 
      ORDER BY rank_points DESC 
      LIMIT 100
    `;

    db.all(sql, [], (err, rows) => {
      if (err) {
        return res.status(500).json({
          status: -1,
          message: 'Erreur lors de la lecture du classement'
        });
      }

      let leaderboard = [];

      if (rows && rows.length > 0) {
        leaderboard = rows.map((row, index) => ({
          rank: index + 1,
          account_id: Number(row.account_id),
          nickname: row.nickname,
          rank_points: Number(row.rank_points)
        }));
      } else {
        // Valeurs par défaut conforme à la réponse attendue si la table est vide
        leaderboard = [
          {
            rank: 1,
            account_id: 100100100,
            nickname: 'FF_King',
            rank_points: 4500
          },
          {
            rank: 2,
            account_id: 100293847,
            nickname: 'ProShooter_FF',
            rank_points: 2150
          }
        ];
      }

      return res.status(200).json({ leaderboard });
    });
  } catch (error) {
    return res.status(500).json({
      status: -1,
      message: 'Erreur serveur lors du chargement du classement',
      error: error.message
    });
  }
};
