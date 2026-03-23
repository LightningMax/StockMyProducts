const { body, validationResult, param } = require('express-validator');
const mongoose = require('mongoose');

/**
 * Middleware pour valider les IDs MongoDB dans les route parameters
 */
const validateMongoId = (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'ID invalide',
    });
  }
  next();
};

/**
 * Middleware pour gérer les erreurs de validation
 * Retourne les erreurs de validation au client
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Erreurs de validation',
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

/**
 * Règles de validation pour l'authentification
 */
const validateRegister = [
  body('firstName').trim().notEmpty().withMessage('Le prénom est requis').isLength({ min: 2 }).withMessage('Le prénom doit contenir au moins 2 caractères'),
  body('lastName').trim().notEmpty().withMessage('Le nom est requis').isLength({ min: 2 }).withMessage('Le nom doit contenir au moins 2 caractères'),
  body('email').isEmail().withMessage('Email invalide').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  body('role').optional().isIn(['admin', 'manager', 'user']).withMessage('Rôle invalide'),
];

const validateLogin = [
  body('email').isEmail().withMessage('Email invalide').normalizeEmail(),
  body('password').notEmpty().withMessage('Le mot de passe est requis'),
];

/**
 * Règles de validation pour les catégories
 */
const validateCategory = [
  body('name').trim().notEmpty().withMessage('Le nom est requis').isLength({ min: 3, max: 50 }).withMessage('Le nom doit contenir entre 3 et 50 caractères'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('La description ne peut pas dépasser 500 caractères'),
];

/**
 * Règles de validation pour les produits
 */
const validateProduct = [
  body('name').trim().notEmpty().withMessage('Le nom est requis').isLength({ min: 3, max: 100 }).withMessage('Le nom doit contenir entre 3 et 100 caractères'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('La description ne peut pas dépasser 1000 caractères'),
  body('sku').trim().notEmpty().withMessage('Le SKU est requis').toUpperCase(),
  body('category').notEmpty().withMessage('La catégorie est requise').isMongoId().withMessage('ID de catégorie invalide'),
  body('price').isFloat({ min: 0 }).withMessage('Le prix doit être un nombre positif'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Le stock doit être un nombre positif'),
  body('minimumStock').optional().isInt({ min: 0 }).withMessage('Le stock minimum doit être un nombre positif'),
];

/**
 * Règles de validation pour les mouvements de stock
 */
const validateStockMovement = [
  body('product').notEmpty().withMessage('Le produit est requis').isMongoId().withMessage('ID de produit invalide'),
  body('quantity').isInt({ min: 1 }).withMessage('La quantité doit être au moins 1'),
  body('reason').optional().isIn(['purchase', 'sale', 'return', 'adjustment', 'damage', 'other']).withMessage('Raison invalide'),
  body('details').optional().trim().isLength({ max: 500 }).withMessage('Les détails ne peuvent pas dépasser 500 caractères'),
  body('reference').optional().trim(),
];

/**
 * Règles de validation pour l'ajustement de stock
 */
const validateStockAdjust = [
  body('product').notEmpty().withMessage('Le produit est requis').isMongoId().withMessage('ID de produit invalide'),
  body('newStock').isInt({ min: 0 }).withMessage('Le nouveau stock doit être un nombre positif'),
  body('details').optional().trim().isLength({ max: 500 }).withMessage('Les détails ne peuvent pas dépasser 500 caractères'),
];

/**
 * Règles de validation pour la mise à jour des utilisateurs
 */
const validateUserUpdate = [
  body('firstName').optional().trim().isLength({ min: 2 }).withMessage('Le prénom doit contenir au moins 2 caractères'),
  body('lastName').optional().trim().isLength({ min: 2 }).withMessage('Le nom doit contenir au moins 2 caractères'),
  body('email').optional().isEmail().withMessage('Email invalide').normalizeEmail(),
  body('role').optional().isIn(['admin', 'manager', 'user']).withMessage('Rôle invalide'),
];

module.exports = {
  handleValidationErrors,
  validateMongoId,
  validateRegister,
  validateLogin,
  validateCategory,
  validateProduct,
  validateStockMovement,
  validateStockAdjust,
  validateUserUpdate,
};
