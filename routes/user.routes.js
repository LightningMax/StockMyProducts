const express = require("express");
const {
  getAllUsers,
  getUserById,
  updateUser,
  deactivateUser,
} = require("../controllers/user.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const { roleMiddleware } = require("../middleware/role.middleware");
const {
  validateUserUpdate,
  validateMongoId,
  handleValidationErrors,
} = require("../middleware/validator.middleware");

const router = express.Router();

/**
 * Routes de gestion des utilisateurs
 * Seulement les administrateurs et les managers peuvent accéder à ces routes
 */

// Obtenir tous les utilisateurs
router.get("/", authMiddleware, roleMiddleware("admin"), getAllUsers);

// Obtenir un utilisateur par ID
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "manager"),
  validateMongoId,
  getUserById,
);

// Mettre à jour un utilisateur
router.put(
  "/:id",
  authMiddleware,
  validateMongoId,
  validateUserUpdate,
  handleValidationErrors,
  updateUser,
);

// Désactiver un utilisateur
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  validateMongoId,
  deactivateUser,
);

module.exports = router;
