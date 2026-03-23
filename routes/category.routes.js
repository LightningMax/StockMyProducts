const express = require('express');
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/category.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { roleMiddleware } = require('../middleware/role.middleware');
const { validateCategory, validateMongoId, handleValidationErrors } = require('../middleware/validator.middleware');

const router = express.Router();

/**
 * Routes de gestion des catégories
 */

// Obtenir toutes les catégories (accessible à tous les utilisateurs authentifiés)
router.get('/', authMiddleware, getAllCategories);

// Obtenir une catégorie par ID
router.get('/:id', authMiddleware, validateMongoId, getCategoryById);

// Créer une nouvelle catégorie (admin, manager)
router.post('/', authMiddleware, roleMiddleware('admin', 'manager'), validateCategory, handleValidationErrors, createCategory);

// Mettre à jour une catégorie (admin, manager)
router.put('/:id', authMiddleware, roleMiddleware('admin', 'manager'), validateMongoId, validateCategory, handleValidationErrors, updateCategory);

// Supprimer une catégorie (admin)
router.delete('/:id', authMiddleware, roleMiddleware('admin'), validateMongoId, deleteCategory);

module.exports = router;
