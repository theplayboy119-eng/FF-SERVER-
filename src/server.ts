const app = require('./app');
const config = require('./config');
const db = require('./db/db');

const PORT = config.port || 3000;

// Démarrage du serveur HTTP
const server = app.listen(PORT, () => {
  console.log(`[FreeFire Backend] Serveur démarré sur le port ${PORT}`);
  console.log(`[FreeFire Backend] Environnement: ${config.env || 'development'}`);
  console.log(`[FreeFire Backend] Endpoint OAuth MSDK: http://localhost:${PORT}/oauth`);
  console.log(`[FreeFire Backend] Endpoint API V1: http://localhost:${PORT}/api/v1`);
});

// Gestion propre de l'arrêt du serveur (Graceful Shutdown)
const handleShutdown = (signal) => {
  console.log(`[FreeFire Backend] Signal ${signal} reçu. Fermeture des connexions...`);
  server.close(() => {
    console.log('[FreeFire Backend] Serveur HTTP arrêté.');
    if (db && typeof db.close === 'function') {
      db.close((err) => {
        if (err) {
          console.error('[FreeFire Backend] Erreur lors de la fermeture de SQLite:', err.message);
        } else {
          console.log('[FreeFire Backend] Connexion SQLite fermée.');
        }
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  });
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

// Capture des erreurs non gérées pour éviter le crash brutal
process.on('uncaughtException', (error) => {
  console.error('[FreeFire Backend] Exception non capturée:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[FreeFire Backend] Promesse rejetée non gérée à:', promise, 'Raison:', reason);
});

module.exports = server;
