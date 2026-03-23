# StockMyProducts - API

## Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB
- npm

### Installation

```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your MongoDB connection and JWT secret

# Start the server
npm start
```

Server runs on `http://localhost:5000`

---

## 📁 Project Structure

```
stockMyProduct/
├── server.js                 # Main entry point
├── package.json
├── config/
│   └── db.js                 # MongoDB connection
├── models/                   # Data models
│   ├── User.js
│   ├── Category.js
│   ├── Product.js
│   └── StockMovement.js
├── controllers/              # Business logic
│   ├── auth.controller.js
│   ├── user.controller.js
│   ├── category.controller.js
│   ├── product.controller.js
│   └── stock.controller.js
├── routes/                   # API endpoints
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── category.routes.js
│   ├── product.routes.js
│   └── stock.routes.js
├── middleware/               # Express middleware
│   ├── auth.middleware.js
│   ├── error.middleware.js
│   ├── rateLimiter.middleware.js
│   ├── role.middleware.js
│   └── validator.middleware.js
└── test.js                   # Complete test suite
```

---

## 🔑 User Roles

- **Admin**:    Full access to all resources
- **Manager**:  Manage products, categories, and stock
- **User**:     View-only access

---

## 📚 Key API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires token)

### Products & Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category (manager+)
- `GET /api/products` - List products
- `POST /api/products` - Create product (manager+)

### Stock Management
- `POST /api/stock/in` - Add stock (manager+)
- `POST /api/stock/out` - Remove stock (manager+)
- `POST /api/stock/adjust` - Adjust stock (admin only)
- `GET /api/stock/history` - View stock history
- `GET /api/stock/stats` - View stock statistics

---

## 🧪 Testing

### Run Full Test Suite

```bash
node test.js
```

This tests all features:
- ✅ Authentication & users
- ✅ Categories & products
- ✅ Stock IN/OUT operations
- ✅ Negative stock prevention
- ✅ Role-based access control
- ✅ Input validation
- ✅ Edge cases

Expected result: **100% tests passing (43/43)**

---

## 📋 Features

- ✅ User authentication with JWT
- ✅ Role-based access control (Admin, Manager, User)
- ✅ Negative stock prevention
- ✅ Complete stock movement tracking
- ✅ Low stock alerts
- ✅ Input validation & error handling
- ✅ Rate limiting
- ✅ Secure password hashing

---

## 🔐 Example: Login & Create Product

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"AdminPassword123!"}' \
  | jq -r '.data.token')

# 2. Create Product
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Laptop",
    "sku": "LP-001",
    "category": "<category_id>",
    "price": 999.99,
    "stock": 10,
    "minimumStock": 2
  }'
```

---

## ⚙️ Environment Variables

Create a `.env` file:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/stock-my-products
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
```

---

## 📁 Structure du Projet

```
stockMyProduct/
├── config/
│   └── db.js                 # Configuration MongoDB
├── controllers/
│   ├── auth.controller.js    # Logique d'authentification
│   ├── user.controller.js    # Gestion des utilisateurs
│   ├── category.controller.js # Gestion des catégories
│   ├── product.controller.js  # Gestion des produits
│   └── stock.controller.js    # Gestion des stocks
├── middleware/
│   ├── auth.middleware.js     # Vérification JWT
│   ├── role.middleware.js     # Contrôle d'accès RBAC
│   ├── rateLimiter.middleware.js # Limitation de taux
│   ├── validator.middleware.js # Validation des données
│   └── error.middleware.js    # Gestion d'erreurs
├── models/
│   ├── User.js               # Modèle utilisateur
│   ├── Category.js           # Modèle catégorie
│   ├── Product.js            # Modèle produit
│   └── StockMovement.js      # Modèle mouvement de stock
├── routes/
│   ├── auth.routes.js        # Routes d'authentification
│   ├── user.routes.js        # Routes utilisateurs
│   ├── category.routes.js    # Routes catégories
│   ├── product.routes.js     # Routes produits
│   └── stock.routes.js       # Routes stocks
├── .env                      # Variables d'environnement
├── .env.example              # Exemple de variables
├── server.js                 # Point d'entrée
├── package.json              # Dépendances
└── README.md                 # Documentation
```

---

## 🐛 Dépannage

### Erreur de connexion à MongoDB
- Vérifier que MongoDB est en cours d'exécution
- Vérifier l'URI MongoDB dans `.env`
- Vérifier les identifiants (si MongoDB Atlas)

### Erreur "Token invalide"
- Le token peut avoir expiré
- Relancer la connexion pour obtenir un nouveau token

### Erreur "Accès refusé"
- Vérifier le rôle de l'utilisateur
- Seuls les admins et managers peuvent effectuer certaines actions

### Erreur "Stock insuffisant"
- La quantité demandée dépasse le stock disponible
- Vérifier le stock actuel avec GET /api/products/{id}

---

## 📝 Variables d'environnement

```env
NODE_ENV=development                                   # Environnement (development, production)
PORT=5000                                              # Port du serveur
MONGODB_URI=mongodb://localhost:27017/stockmyproducts  # URI MongoDB
JWT_SECRET=your_secret                                 # Clé secrète JWT
JWT_EXPIRE=7d                                          # Expiration du token
CORS_ORIGIN=http://localhost:3000                      # Origine CORS autorisée
RATE_LIMIT_WINDOW_MS=900000                            # Fenêtre de rate limiting (ms)
RATE_LIMIT_MAX_REQUESTS=100                            # Nombre de requêtes max par fenêtre
```

---

## 🧪 Tests

Exemples de test avec cURL:

```bash
# Enregistrement
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jean",
    "lastName": "Dupont",
    "email": "jean@example.com",
    "password": "password123"
  }'

# Connexion
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean@example.com",
    "password": "password123"
  }'

# Health Check (sans authentification)
curl http://localhost:5000/api/health
```