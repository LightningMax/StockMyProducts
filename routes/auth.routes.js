const express = require("express");
const { register, login, getMe } = require("../controllers/auth.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const {
  validateRegister,
  validateLogin,
  handleValidationErrors,
} = require("../middleware/validator.middleware");

const router = express.Router();

// ============= ROUTE AUTH =============

//add new user | POST /api/auth/register
router.post("/register", validateRegister, handleValidationErrors, register);

// connect user | POST /api/auth/login
router.post("/login", validateLogin, handleValidationErrors, login);

// get info user connecte | GET /api/auth/me
router.get("/me", authMiddleware, getMe);

module.exports = router;
