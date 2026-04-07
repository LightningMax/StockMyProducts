const Product = require("../models/Product");
const StockMovement = require("../models/StockMovement");

/**
 * Enregistrer une entrée de stock (Stock In)
 * POST /api/stock/in
 */
exports.stockIn = async (req, res, next) => {
  try {
    const {
      product: productId,
      quantity,
      reason,
      details,
      reference,
    } = req.body;

    // Récupérer le produit
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Produit non trouvé",
      });
    }

    // Sauvegarder le stock avant le mouvement
    const stockBefore = product.stock;

    // Ajouter le stock
    product.stock += quantity;
    await product.save();

    // Enregistrer le mouvement
    const movement = await StockMovement.create({
      product: productId,
      movementType: "in",
      quantity,
      reason: reason || "purchase",
      details,
      reference,
      stockBefore,
      stockAfter: product.stock,
      user: req.user.id,
    });

    await movement.populate("product", "name sku");

    res.status(201).json({
      success: true,
      message: "Entrée de stock enregistrée avec succès",
      data: {
        movement,
        product: {
          id: product._id,
          name: product.name,
          sku: product.sku,
          stockBefore,
          stockAfter: product.stock,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Enregistrer une sortie de stock (Stock Out)
 * POST /api/stock/out
 */
exports.stockOut = async (req, res, next) => {
  try {
    const {
      product: productId,
      quantity,
      reason,
      details,
      reference,
    } = req.body;

    // Récupérer le produit
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Produit non trouvé",
      });
    }

    // Vérifier que le stock est suffisant
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Stock insuffisant. Stock disponible: ${product.stock}, Quantité demandée: ${quantity}`,
        availableStock: product.stock,
        requestedQuantity: quantity,
      });
    }

    // Sauvegarder le stock avant le mouvement
    const stockBefore = product.stock;

    // Retirer le stock
    product.stock -= quantity;
    await product.save();

    // Enregistrer le mouvement
    const movement = await StockMovement.create({
      product: productId,
      movementType: "out",
      quantity,
      reason: reason || "sale",
      details,
      reference,
      stockBefore,
      stockAfter: product.stock,
      user: req.user.id,
    });

    await movement.populate("product", "name sku");

    res.status(201).json({
      success: true,
      message: "Sortie de stock enregistrée avec succès",
      data: {
        movement,
        product: {
          id: product._id,
          name: product.name,
          sku: product.sku,
          stockBefore,
          stockAfter: product.stock,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtenir l'historique des mouvements de stock
 * GET /api/stock/history
 */
exports.getMovementHistory = async (req, res, next) => {
  try {
    const { product, movementType, startDate, endDate, reason, sortBy } =
      req.query;
    let query = {};

    // Filtrer par produit
    if (product) {
      query.product = product;
    }

    // Filtrer par type de mouvement
    if (movementType) {
      query.movementType = movementType;
    }

    // Filtrer par raison
    if (reason) {
      query.reason = reason;
    }

    // Filtrer par date
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    let movements = StockMovement.find(query);

    // Tri
    if (sortBy === "oldest") {
      movements = movements.sort({ createdAt: 1 });
    } else {
      movements = movements.sort({ createdAt: -1 }); // Par défaut, plus récent d'abord
    }

    movements = await movements
      .populate("product", "name sku")
      .populate("user", "firstName lastName email");

    res.status(200).json({
      success: true,
      count: movements.length,
      data: movements,
    });
  } catch (error) {
    next(error);
  }
};

exports.getProductMovementHistory = async (req, res, next) => {
  try {
    const movements = await StockMovement.find({
      product: req.params.productId,
    })
      .populate("product", "name sku")
      .populate("user", "firstName lastName email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: movements.length,
      data: movements,
    });
  } catch (error) {
    next(error);
  }
};
