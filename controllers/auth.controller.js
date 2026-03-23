const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Générer un token JWT
 * @param {string} userId - L'ID de l'utilisateur
 * @returns {string} Le token JWT
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

/**
 * Enregistrer un nouvel utilisateur
 * POST /api/auth/register
 */
exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Un utilisateur avec cet email existe déjà',
      });
    }

    // Créer un nouvel utilisateur
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role || 'user',
    });

    // Générer un token JWT
    const token = generateToken(user._id);

    // Répondre au client
    res.status(201).json({
      success: true,
      message: 'Utilisateur enregistré avec succès',
      data: {
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Connexion d'un utilisateur
 * POST /api/auth/login
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Vérifier que les champs sont fournis
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe sont requis',
      });
    }

    // Rechercher l'utilisateur
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect',
      });
    }

    // Vérifier le mot de passe
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect',
      });
    }

    // Vérifier que l'utilisateur est actif
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Ce compte a été désactivé',
      });
    }

    // Générer un token JWT
    const token = generateToken(user._id);

    // Répondre au client
    res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Vérifier le token et obtenir les informations utilisateur
 * GET /api/auth/me
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
