const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');

/**
 * Enregistrer une entrée de stock (Stock In)
 * POST /api/stock/in
 */
exports.stockIn = async (req, res, next) => {
  try {
    const { product: productId, quantity, reason, details, reference } = req.body;

    // Récupérer le produit
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé',
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
      movementType: 'in',
      quantity,
      reason: reason || 'purchase',
      details,
      reference,
      stockBefore,
      stockAfter: product.stock,
      user: req.user.id,
    });

    await movement.populate('product', 'name sku');

    res.status(201).json({
      success: true,
      message: 'Entrée de stock enregistrée avec succès',
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
    const { product: productId, quantity, reason, details, reference } = req.body;

    // Récupérer le produit
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé',
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
      movementType: 'out',
      quantity,
      reason: reason || 'sale',
      details,
      reference,
      stockBefore,
      stockAfter: product.stock,
      user: req.user.id,
    });

    await movement.populate('product', 'name sku');

    res.status(201).json({
      success: true,
      message: 'Sortie de stock enregistrée avec succès',
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
    const { product, movementType, startDate, endDate, reason, sortBy } = req.query;
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
    if (sortBy === 'oldest') {
      movements = movements.sort({ createdAt: 1 });
    } else {
      movements = movements.sort({ createdAt: -1 }); // Par défaut, plus récent d'abord
    }

    movements = await movements.populate('product', 'name sku').populate('user', 'firstName lastName email');

    res.status(200).json({
      success: true,
      count: movements.length,
      data: movements,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtenir l'historique d'un produit spécifique
 * GET /api/stock/history/:productId
 */
exports.getProductMovementHistory = async (req, res, next) => {
  try {
    const movements = await StockMovement.find({ product: req.params.productId })
      .populate('product', 'name sku')
      .populate('user', 'firstName lastName email')
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

/**
 * Obtenir les statistiques de stock
 * GET /api/stock/stats
 */
exports.getStockStats = async (req, res, next) => {
  try {
    const totalProducts = await Product.countDocuments({ isDeleted: false });
    const lowStockProducts = await Product.countDocuments({
      isDeleted: false,
      $expr: { $lte: ['$stock', '$minimumStock'] }
    });
    const totalMovements = await StockMovement.countDocuments();
    const inMovements = await StockMovement.countDocuments({ movementType: 'in' });
    const outMovements = await StockMovement.countDocuments({ movementType: 'out' });

    // Calculer la valeur totale du stock
    const products = await Product.find({ isDeleted: false });
    const totalStockValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0);

    res.status(200).json({
      success: true,
      data: {
        products: {
          total: totalProducts,
          lowStock: lowStockProducts,
          normalStock: totalProducts - lowStockProducts,
        },
        movements: {
          total: totalMovements,
          in: inMovements,
          out: outMovements,
        },
        inventory: {
          totalStockValue,
          averageStockPerProduct: totalProducts > 0 ? totalStockValue / totalProducts : 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Ajuster le stock manuellement
 * POST /api/stock/adjust
 */
exports.adjustStock = async (req, res, next) => {
  try {
    const { product: productId, newStock, details } = req.body;

    // Récupérer le produit
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé',
      });
    }

    const stockBefore = product.stock;
    const difference = newStock - stockBefore;

    // Vérifier que le nouveau stock n'est pas négatif
    if (newStock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Le stock ne peut pas être négatif',
      });
    }

    // Mettre à jour le stock
    product.stock = newStock;
    await product.save();

    // Enregistrer le mouvement d'ajustement
    const movement = await StockMovement.create({
      product: productId,
      movementType: difference > 0 ? 'in' : 'out',
      quantity: Math.abs(difference),
      reason: 'adjustment',
      details: details || `Ajustement: ${stockBefore} → ${newStock}`,
      stockBefore,
      stockAfter: newStock,
      user: req.user.id,
    });

    await movement.populate('product', 'name sku');

    res.status(200).json({
      success: true,
      message: 'Stock ajusté avec succès',
      data: {
        movement,
        product: {
          id: product._id,
          name: product.name,
          sku: product.sku,
          stockBefore,
          stockAfter: newStock,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
