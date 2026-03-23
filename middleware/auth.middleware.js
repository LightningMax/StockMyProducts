const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware d'authentification JWT
 * Vérifie que l'utilisateur est authentifié en validant le token JWT
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Récupérer le token du header Authorization
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Aucun token fourni. Veuillez vous authentifier',
      });
    }

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Récupérer l'utilisateur complet de la base de données
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }

    // Vérifier que le compte de l'utilisateur est toujours actif
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Compte utilisateur désactivé',
      });
    }
    // Attacher les informations de l'utilisateur à la requête
    req.user = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Le token a expiré',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Token invalide',
    });
  }
};

module.exports = { authMiddleware };
