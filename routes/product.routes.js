const express = require('express');
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
} = require('../controllers/product.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { roleMiddleware } = require('../middleware/role.middleware');
const { validateProduct, validateMongoId, handleValidationErrors } = require('../middleware/validator.middleware');

const router = express.Router();

/**
 * Routes de gestion des produits
 */

// Obtenir les produits en alerte de stock
router.get('/alerts/low-stock', authMiddleware, getLowStockProducts);

// Obtenir tous les produits
router.get('/', authMiddleware, getAllProducts);

// Obtenir un produit par ID
router.get('/:id', authMiddleware, validateMongoId, getProductById);

// Créer un nouveau produit (admin, manager)
router.post('/', authMiddleware, roleMiddleware('admin', 'manager'), validateProduct, handleValidationErrors, createProduct);

// Mettre à jour un produit (admin, manager)
router.put('/:id', authMiddleware, roleMiddleware('admin', 'manager'), validateMongoId, validateProduct, handleValidationErrors, updateProduct);

// Supprimer un produit (admin)
router.delete('/:id', authMiddleware, roleMiddleware('admin'), validateMongoId, deleteProduct);

module.exports = router;
