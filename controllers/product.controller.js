const Product = require('../models/Product');

/**
 * Obtenir tous les produits
 * GET /api/products
 */
exports.getAllProducts = async (req, res, next) => {
  try {
    const { category, minPrice, maxPrice, search, sortBy } = req.query;
    let query = { isDeleted: false };

    // Filtrer par catégorie
    if (category) {
      query.category = category;
    }

    // Filtrer par prix
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = minPrice;
      if (maxPrice) query.price.$lte = maxPrice;
    }

    // Recherche textuelle
    if (search) {
      query.$text = { $search: search };
    }

    let products = Product.find(query);

    // Tri
    if (sortBy === 'price-asc') {
      products = products.sort({ price: 1 });
    } else if (sortBy === 'price-desc') {
      products = products.sort({ price: -1 });
    } else if (sortBy === 'newest') {
      products = products.sort({ createdAt: -1 });
    } else if (sortBy === 'name') {
      products = products.sort({ name: 1 });
    }

    products = await products.populate('category', 'name');

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
    const product = await Product.findById(req.params.id).populate('category', 'name description');

    if (!product || product.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé',
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
    const { name, description, sku, category, price, stock, minimumStock } = req.body;

    // Vérifier si le SKU existe déjà
    const existingSku = await Product.findOne({ sku: sku.toUpperCase() });
    if (existingSku) {
      return res.status(400).json({
        success: false,
        message: 'Un produit avec ce SKU existe déjà',
      });
    }

    const product = await Product.create({
      name,
      description,
      sku: sku.toUpperCase(),
      category,
      price,
      stock: stock || 0,
      minimumStock: minimumStock || 10,
    });

    await product.populate('category', 'name');

    res.status(201).json({
      success: true,
      message: 'Produit créé avec succès',
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
    const { name, description, sku, category, price, stock, minimumStock } = req.body;

    const updateData = {
      name,
      description,
      category,
      price,
      stock,
      minimumStock,
      updatedAt: Date.now(),
    };

    // Si le SKU est modifié, vérifier qu'il n'existe pas
    if (sku) {
      const existingSku = await Product.findOne({ 
        sku: sku.toUpperCase(),
        _id: { $ne: req.params.id }
      });
      if (existingSku) {
        return res.status(400).json({
          success: false,
          message: 'Un produit avec ce SKU existe déjà',
        });
      }
      updateData.sku = sku.toUpperCase();
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name');

    if (!product || product.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Produit mis à jour avec succès',
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
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Produit supprimé avec succès',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtenir les produits en alerte de stock
 * GET /api/products/alerts/low-stock
 */
exports.getLowStockProducts = async (req, res, next) => {
  try {
    const products = await Product.find({
      isDeleted: false,
      $expr: { $lte: ['$stock', '$minimumStock'] }
    }).populate('category', 'name').sort({ stock: 1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};
