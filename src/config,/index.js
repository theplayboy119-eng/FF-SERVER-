require('dotenv').config();

module.exports = {
  // Configuration du serveur HTTP Express
  port: process.env.PORT || 8080,
  env: process.env.NODE_ENV || 'development',

  // Paramètres de sécurité et jetons JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'freefire_msdk_jwt_secret_key_2026',
    expiresIn: parseInt(process.env.JWT_EXPIRES_IN, 10) || 86400, // 24 heures
    refreshExpiresIn: parseInt(process.env.JWT_REFRESH_EXPIRES_IN, 10) || 604800 // 7 jours
  },

  // Base de données SQLite3
  db: {
    path: process.env.DB_PATH || './freefire.sqlite'
  },

  // Identifiants du SDK Garena / MSDK & Version du jeu
  msdk: {
    appId: process.env.MSDK_APP_ID || '100067',
    version: '1.70.0',
    defaultRegion: 'EU',
    cdnHost: process.env.CDN_HOST || 'https://dl.ff.garena.com/patch',
    enableAnalytics: true
  },

  // Paramètres du serveur de combat (Matchmaking)
  gameServer: {
    ip: process.env.GAME_SERVER_IP || '185.220.101.5',
    port: parseInt(process.env.GAME_SERVER_PORT, 10) || 7777,
    estimatedWaitTime: 12
  }
};
