const rateLimit = require('express-rate-limit');

/**
 * Configuration du Rate Limiter
 * Limite le nombre de requêtes par fenêtre de temps pour éviter les abus
 */
const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes par défaut
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 requêtes par défaut
  message: 'Trop de requêtes depuis cette adresse IP, veuillez réessayer plus tard',
  standardHeaders: true, // Retourne le statut RateLimit dans les en-têtes `RateLimit-*`
  legacyHeaders: false, // Désactive les en-têtes `X-RateLimit-*`
  skip: (req) => {
    // Omettre certaines routes (exemple: health check)
    return req.path === '/api/health';
  },
  keyGenerator: (req, res) => {
    // Utiliser l'adresse IP pour identifier les clients
    return req.ip || req.connection.remoteAddress;
  },
});

module.exports = { rateLimiter };
