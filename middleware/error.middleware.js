/**
 * Middleware de gestion globale des erreurs
 * Centralise la gestion des erreurs dans toute l'application
 */
const globalErrorHandler = (err, req, res, next) => {
  // Initialiser les propriétés d'erreur
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Une erreur interne s\'est produite';

  // Gestion des erreurs Mongoose - Validation
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: 'Erreur de validation',
      errors: errors,
    });
  }

  // Gestion des erreurs Mongoose - Clé unique
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `${field} doit être unique`,
    });
  }

  // Gestion des erreurs Mongoose - Mauvais ID
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'ID invalide',
    });
  }

  // Gestion des erreurs JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token invalide',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expiré',
    });
  }

  // Erreur générique
  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

module.exports = { globalErrorHandler };
