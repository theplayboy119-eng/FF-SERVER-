const jwtService = require('../services/jwt.service');

/**
 * Middleware d'authentification par jeton Bearer JWT.
 * Valide le jeton transmis dans l'en-tête Authorization et attache les données du joueur à req.user.
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];

  if (!authHeader) {
    return res.status(401).json({
      status: -1,
      error: 'Unauthorized',
      message: 'En-tête d\'autorisation manquant'
    });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      status: -1,
      error: 'Unauthorized',
      message: 'Format de jeton invalide. Utiliser: Bearer <token>'
    });
  }

  const token = parts[1];

  try {
    const decoded = jwtService.verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      status: -1,
      error: 'Unauthorized',
      message: 'Jeton d\'accès expiré ou invalide'
    });
  }
};

module.exports = authenticateToken;
