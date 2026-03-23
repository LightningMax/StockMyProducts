const mongoose = require('mongoose');

// Schéma du produit
const productSchema = new mongoose.Schema(
  {
    // Nom du produit
    name: {
      type: String,
      required: [true, 'Le nom du produit est requis'],
      trim: true,
      minlength: [3, 'Le nom doit contenir au moins 3 caractères'],
      maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères'],
    },
    // Description du produit
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'La description ne peut pas dépasser 1000 caractères'],
    },
    // Référence SKU unique
    sku: {
      type: String,
      required: [true, 'Le SKU est requis'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    // Catégorie du produit
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'La catégorie est requise'],
    },
    // Prix unitaire
    price: {
      type: Number,
      required: [true, 'Le prix est requis'],
      min: [0, 'Le prix ne peut pas être négatif'],
    },
    // Quantité en stock (doit être >= 0)
    stock: {
      type: Number,
      required: [true, 'La quantité en stock est requise'],
      default: 0,
      min: [0, 'La quantité en stock ne peut pas être négative'],
    },
    // Quantité minimale recommandée
    minimumStock: {
      type: Number,
      default: 10,
      min: [0, 'La quantité minimale ne peut pas être négative'],
    },
    // Statut de suppression logique (soft delete)
    isDeleted: {
      type: Boolean,
      default: false,
    },
    // Image du produit (chemin du fichier)
    imageUrl: {
      type: String,
      default: null,
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
// Note: sku has unique: true which already creates an index
productSchema.index({ category: 1 });
productSchema.index({ isDeleted: 1 });

module.exports = mongoose.model('Product', productSchema);
