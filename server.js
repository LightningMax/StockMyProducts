const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const morgan = require("morgan");
require("dotenv").config();

const connectDB = require("./config/db");

// Import des routes
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const categoryRoutes = require("./routes/category.routes");
const productRoutes = require("./routes/product.routes");
const stockRoutes = require("./routes/stock.routes");

// Import des middleware
const { globalErrorHandler } = require("./middleware/error.middleware");
const { rateLimiter } = require("./middleware/rateLimiter.middleware");

// Initialisation de l'application
const app = express();

// Connexion à la base de données
connectDB();

/**
 * Middleware de sécurité et de configuration
 */
// Helmet: ajoute les en-têtes de sécurité HTTP
app.use(helmet());

// CORS: configuration pour accepter les requêtes cross-origin
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  }),
);

// Morgan: logging des requêtes HTTP
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Rate Limiter: limitation du taux de requêtes
app.use("/api/", rateLimiter);

// Parsing du body des requêtes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Protection contre les injections MongoDB
app.use(mongoSanitize());

/**
 * Routes de l'API
 */
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/stock", stockRoutes);

/**
 * Route de santé pour vérifier le statut du serveur
 */
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Le serveur StockMyProducts fonctionne correctement",
    timestamp: new Date().toISOString(),
  });
});

/**
 * Gestion des routes non trouvées (404)
 */
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route non trouvée",
  });
});

/**
 * Middleware de gestion des erreurs globales
 */
app.use(globalErrorHandler);

/**
 * Démarrage du serveur
 */
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Serveur StockMyProducts démarré sur le port ${PORT}`);
  console.log(`Environnement: ${process.env.NODE_ENV || "development"}`);
});

/**
 * Gestion des erreurs non capturées
 */
process.on("unhandledRejection", (err) => {
  console.error(`Erreur non gérée: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;
