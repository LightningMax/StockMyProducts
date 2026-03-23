const mongoose = require('mongoose');

// Schéma de la catégorie
const categorySchema = new mongoose.Schema(
  {
    // Nom de la catégorie
    name: {
      type: String,
      required: [true, 'Le nom de la catégorie est requis'],
      unique: true,
      trim: true,
      minlength: [3, 'Le nom doit contenir au moins 3 caractères'],
      maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères'],
    },
    // Description optionnelle
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'La description ne peut pas dépasser 500 caractères'],
    },
    // Statut de suppression logique (soft delete)
    isDeleted: {
      type: Boolean,
      default: false,
    },
    // Dates de création et modification
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index pour améliorer les performances sur les requêtes fréquentes
// Note: name has unique: true which already creates an index
categorySchema.index({ isDeleted: 1 });

module.exports = mongoose.model('Category', categorySchema);
