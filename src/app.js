const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const oauthRoutes = require('./routes/oauth.routes');
const playerRoutes = require('./routes/player.routes');
const shopRoutes = require('./routes/shop.routes');
const matchmakingRoutes = require('./routes/matchmaking.routes');

const app = express();

// Middlewares globaux de sécurité et d'analyse
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Surcharge de l'en-tête serveur pour imiter l'infrastructure Garena MSDK
app.use((req, res, next) => {
  res.setHeader('X-Powered-By', 'Garena-MSDK/1.70.0');
  next();
});

// Montage des sous-routeurs de l'API
app.use('/', oauthRoutes);
app.use('/api/v1/player', playerRoutes);
app.use('/api/v1/shop', shopRoutes);
app.use('/api/v1', matchmakingRoutes);

// Endpoint de santé / vérification de l'API
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'FreeFire Mobile Backend',
    version: '1.70.0',
    timestamp: Math.floor(Date.now() / 1000)
  });
});

// Gestion des routes inexistantes (404)
app.use((req, res, next) => {
  res.status(404).json({
    status: -1,
    message: 'Endpoint non trouvé'
  });
});

// Middleware global de traitement des erreurs
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err.stack || err.message);
  res.status(err.status || 500).json({
    status: err.status || 500,
    message: err.message || 'Erreur interne du serveur'
  });
});

module.exports = app;
