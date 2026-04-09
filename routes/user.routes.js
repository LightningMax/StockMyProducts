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

// ================ ROUTE GESTION DES USER ==========================
// Admin && Manager peuvent acceder au route suivante
// (Update role valide seulement par Admin)

// recupe tout les user actif | GET /api/users
router.get("/", authMiddleware, roleMiddleware("admin"), getAllUsers);

// recup user par id | GET /api/users/:id
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "manager"),
  validateMongoId,
  getUserById,
);

// update user | PUT /api/users/:id
router.put(
  "/:id",
  authMiddleware,
  validateMongoId,
  validateUserUpdate,
  handleValidationErrors,
  updateUser,
);

// supprime un user (soft delete) | DELETE /api/users/:id
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  validateMongoId,
  deactivateUser,
);

module.exports = router;
