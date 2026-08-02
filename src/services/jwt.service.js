const jwt = require('jsonwebtoken');
const config = require('../config');

class JwtService {
  /**
   * Génère un jeton d'accès (Access Token) pour un utilisateur
   * @param {Object} payload - Contenu à insérer dans le jeton (ex: openid, account_id)
   * @returns {string} Jeton JWT d'accès
   */
  generateAccessToken(payload) {
    return jwt.sign(
      {
        openid: payload.openid,
        type: 'access'
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn || '24h' }
    );
  }

  /**
   * Génère un jeton de rafraîchissement (Refresh Token) pour un utilisateur
   * @param {Object} payload - Contenu à insérer dans le jeton (ex: openid)
   * @returns {string} Jeton JWT de rafraîchissement
   */
  generateRefreshToken(payload) {
    return jwt.sign(
      {
        openid: payload.openid,
        type: 'refresh'
      },
      config.jwtRefreshSecret || config.jwtSecret,
      { expiresIn: config.jwtRefreshExpiresIn || '7d' }
    );
  }

  /**
   * Vérifie et décode un jeton d'accès
   * @param {string} token - Jeton d'accès JWT
   * @returns {Object|null} Payload décodé ou null si invalide/expiré
   */
  verifyAccessToken(token) {
    try {
      const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
      const decoded = jwt.verify(cleanToken, config.jwtSecret);
      
      if (decoded.type !== 'access') {
        return null;
      }
      
      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * Vérifie et décode un jeton de rafraîchissement
   * @param {string} token - Jeton de rafraîchissement JWT
   * @returns {Object|null} Payload décodé ou null si invalide/expiré
   */
  verifyRefreshToken(token) {
    try {
      const secret = config.jwtRefreshSecret || config.jwtSecret;
      const decoded = jwt.verify(token, secret);
      
      if (decoded.type !== 'refresh') {
        return null;
      }
      
      return decoded;
    } catch (error) {
      return null;
    }
  }
}

module.exports = new JwtService();
