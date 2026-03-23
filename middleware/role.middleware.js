/**
 * Middleware de contrôle d'accès basé sur les rôles (RBAC)
 * Vérifie que l'utilisateur a le rôle requis pour accéder à une ressource
 */
const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    // Vérifier que l'utilisateur est authentifié
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise',
      });
    }

    // Vérifier que le rôle de l'utilisateur est autorisé
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Vous n\'avez pas les permissions nécessaires',
        requiredRoles: allowedRoles,
        userRole: req.user.role,
      });
    }

    next();
  };
};

module.exports = { roleMiddleware };
