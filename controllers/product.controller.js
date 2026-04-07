const Product = require("../models/Product");

/**
 * Obtenir tous les produits (liste simple sans filtres)
 * GET /api/products
 */
exports.getAllProducts = async (req, res, next) => {
  try {
    // Récupérer tous les produits qui ne sont pas supprimés
    const products = await Product.find({ isDeleted: false }).populate(
      "category",
      "name",
    );

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtenir un produit par ID
 * GET /api/products/:id
 */
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category",
      "name description",
    );

    if (!product || product.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Produit non trouvé",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Créer un nouveau produit
 * POST /api/products
 */
exports.createProduct = async (req, res, next) => {
  try {
    const { name, description, sku, category, price, stock } = req.body;

    // Vérifier si le SKU existe déjà
    const existingSku = await Product.findOne({ sku: sku.toUpperCase() });
    if (existingSku) {
      return res.status(400).json({
        success: false,
        message: "Un produit avec ce SKU existe déjà",
      });
    }

    // Créer le produit
    const product = await Product.create({
      name,
      description,
      sku: sku.toUpperCase(),
      category,
      price,
      stock: stock || 0,
    });

    // Récupérer le produit avec la catégorie peuplée
    await product.populate("category", "name");

    res.status(201).json({
      success: true,
      message: "Produit créé avec succès",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour un produit
 * PUT /api/products/:id
 */
exports.updateProduct = async (req, res, next) => {
  try {
    const { name, description, sku, category, price, stock } = req.body;

    // Préparer les données à mettre à jour
    const updateData = {
      name,
      description,
      category,
      price,
      stock,
      updatedAt: Date.now(),
    };

    // Si le SKU est modifié, vérifier qu'il n'existe pas
    if (sku) {
      const existingSku = await Product.findOne({
        sku: sku.toUpperCase(),
        _id: { $ne: req.params.id },
      });
      if (existingSku) {
        return res.status(400).json({
          success: false,
          message: "Un produit avec ce SKU existe déjà",
        });
      }
      updateData.sku = sku.toUpperCase();
    }

    // Mettre à jour le produit
    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate("category", "name");

    if (!product || product.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Produit non trouvé",
      });
    }

    res.status(200).json({
      success: true,
      message: "Produit mis à jour avec succès",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supprimer un produit (soft delete)
 * DELETE /api/products/:id
 */
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, updatedAt: Date.now() },
      { new: true },
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Produit non trouvé",
      });
    }

    res.status(200).json({
      success: true,
      message: "Produit supprimé avec succès",
    });
  } catch (error) {
    next(error);
  }
};
