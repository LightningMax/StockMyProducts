const express = require("express");
const { register, login, getMe } = require("../controllers/auth.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const {
  validateRegister,
  validateLogin,
  handleValidationErrors,
} = require("../middleware/validator.middleware");

const router = express.Router();

/**
 * Routes d'authentification
 */

// Enregistrer un nouvel utilisateur
router.post("/register", validateRegister, handleValidationErrors, register);

// Connexion d'un utilisateur
router.post("/login", validateLogin, handleValidationErrors, login);

// Obtenir les informations de l'utilisateur authentifier
router.get("/me", authMiddleware, getMe);

module.exports = router;
