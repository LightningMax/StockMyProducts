const express = require('express');
const {
  getAllUsers,
  getUserById,
  updateUser,
  deactivateUser,
  getUserStats,
} = require('../controllers/user.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { roleMiddleware } = require('../middleware/role.middleware');
const { validateUserUpdate, validateMongoId, handleValidationErrors } = require('../middleware/validator.middleware');

const router = express.Router();

/**
 * Routes de gestion des utilisateurs
 * Seulement les administrateurs et les managers peuvent accéder à ces routes
 */

// Obtenir les statistiques des utilisateurs
router.get('/stats', authMiddleware, roleMiddleware('admin'), getUserStats);

// Obtenir tous les utilisateurs
router.get('/', authMiddleware, roleMiddleware('admin', 'manager'), getAllUsers);

// Obtenir un utilisateur par ID
router.get('/:id', authMiddleware, roleMiddleware('admin', 'manager'), validateMongoId, getUserById);

// Mettre à jour un utilisateur
router.put('/:id', authMiddleware, validateMongoId, validateUserUpdate, handleValidationErrors, updateUser);

// Désactiver un utilisateur
router.delete('/:id', authMiddleware, roleMiddleware('admin'), validateMongoId, deactivateUser);

module.exports = router;
