const express = require("express");
const {
  stockIn,
  stockOut,
  getMovementHistory,
  getProductMovementHistory,
} = require("../controllers/stock.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const { roleMiddleware } = require("../middleware/role.middleware");
const {
  validateStockMovement,
  handleValidationErrors,
} = require("../middleware/validator.middleware");

const router = express.Router();

/**
 * Routes de gestion des mouvements de stock
 */

// Obtenir l'historique des mouvements de stock
router.get("/history", authMiddleware, getMovementHistory);

// Obtenir l'historique d'un produit spécifique
router.get("/history/:productId", authMiddleware, getProductMovementHistory);

// Enregistrer une entrée de stock (admin, manager)
router.post(
  "/in",
  authMiddleware,
  roleMiddleware("admin", "manager"),
  validateStockMovement,
  handleValidationErrors,
  stockIn,
);

// Enregistrer une sortie de stock (admin, manager)
router.post(
  "/out",
  authMiddleware,
  roleMiddleware("admin", "manager"),
  validateStockMovement,
  handleValidationErrors,
  stockOut,
);

module.exports = router;
