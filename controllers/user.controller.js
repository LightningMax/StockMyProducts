const User = require("../models/User");

/**
 * Obtenir tous les utilisateurs
 * GET /api/users
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ isActive: true });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtenir un utilisateur par ID
 * GET /api/users/:id
 */
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour un utilisateur
 * PUT /api/users/:id
 */
exports.updateUser = async (req, res, next) => {
  try {
    const { firstName, lastName, email, role } = req.body;

    // Vérifier que l'utilisateur ne modifie pas son propre rôle
    if (role && req.user.id !== req.params.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Seul un administrateur peut changer les rôles",
      });
    }

    const updateData = {
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      email: email || undefined,
      role: role || undefined,
      updatedAt: Date.now(),
    };

    // Supprimer les champs undefined
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key],
    );

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé",
      });
    }

    res.status(200).json({
      success: true,
      message: "Utilisateur mis à jour avec succès",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Désactiver un utilisateur (soft delete)
 * DELETE /api/users/:id
 */
exports.deactivateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false, updatedAt: Date.now() },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé",
      });
    }

    res.status(200).json({
      success: true,
      message: "Utilisateur désactivé avec succès",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
