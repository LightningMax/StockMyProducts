const express = require("express");
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/category.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const { roleMiddleware } = require("../middleware/role.middleware");
const {
  validateCategory,
  validateMongoId,
  handleValidationErrors,
} = require("../middleware/validator.middleware");

const router = express.Router();

/**
 * Routes de gestion des catégories
 */

// Obtenir toutes les catégories
router.get("/", authMiddleware, getAllCategories);

// Obtenir une categorie par ID
router.get("/:id", authMiddleware, validateMongoId, getCategoryById);

// Creer une nouvelle categorie
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin", "manager"),
  validateCategory,
  handleValidationErrors,
  createCategory,
);

// Mettre à jour une categorie
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "manager"),
  validateMongoId,
  validateCategory,
  handleValidationErrors,
  updateCategory,
);

// Supprimer une categorie
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  validateMongoId,
  deleteCategory,
);

module.exports = router;
