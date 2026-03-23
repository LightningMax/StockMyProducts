const Category = require('../models/Category');

/**
 * Obtenir toutes les catégories
 * GET /api/categories
 */
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isDeleted: false });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtenir une catégorie par ID
 * GET /api/categories/:id
 */
exports.getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category || category.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Catégorie non trouvée',
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Créer une nouvelle catégorie
 * POST /api/categories
 */
exports.createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    // Vérifier si la catégorie existe déjà
    const existingCategory = await Category.findOne({ 
      name: { $regex: `^${name}$`, $options: 'i' },
      isDeleted: false 
    });
    
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Une catégorie avec ce nom existe déjà',
      });
    }

    const category = await Category.create({
      name,
      description,
    });

    res.status(201).json({
      success: true,
      message: 'Catégorie créée avec succès',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour une catégorie
 * PUT /api/categories/:id
 */
exports.updateCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!category || category.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Catégorie non trouvée',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Catégorie mise à jour avec succès',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supprimer une catégorie (soft delete)
 * DELETE /api/categories/:id
 */
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, updatedAt: Date.now() },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Catégorie non trouvée',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Catégorie supprimée avec succès',
    });
  } catch (error) {
    next(error);
  }
};
