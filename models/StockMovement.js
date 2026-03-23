const mongoose = require('mongoose');

// Schéma du mouvement de stock
const stockMovementSchema = new mongoose.Schema(
  {
    // Produit concerné
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Le produit est requis'],
    },
    // Type de mouvement : entrant (in) ou sortant (out)
    movementType: {
      type: String,
      enum: {
        values: ['in', 'out'],
        message: 'Le type de mouvement doit être "in" ou "out"',
      },
      required: [true, 'Le type de mouvement est requis'],
    },
    // Quantité du mouvement
    quantity: {
      type: Number,
      required: [true, 'La quantité est requise'],
      min: [1, 'La quantité doit être au moins 1'],
    },
    // Motif du mouvement (ex: achat, vente, retour, ajustement)
    reason: {
      type: String,
      enum: {
        values: ['purchase', 'sale', 'return', 'adjustment', 'damage', 'other'],
        message: 'Le motif doit être purchase, sale, return, adjustment, damage ou other',
      },
      default: 'other',
    },
    // Détails supplémentaires
    details: {
      type: String,
      trim: true,
      maxlength: [500, 'Les détails ne peuvent pas dépasser 500 caractères'],
    },
    // Stock avant le mouvement
    stockBefore: {
      type: Number,
      required: true,
      min: [0, 'Le stock ne peut pas être négatif'],
    },
    // Stock après le mouvement
    stockAfter: {
      type: Number,
      required: true,
      min: [0, 'Le stock ne peut pas être négatif'],
    },
    // Utilisateur qui a effectué le mouvement
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'L\'utilisateur est requis'],
    },
    // Référence externe (ex: numéro de commande, facture)
    reference: {
      type: String,
      trim: true,
    },
    // Date et heure du mouvement
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index pour améliorer les performances sur les requêtes fréquentes
stockMovementSchema.index({ product: 1 });
stockMovementSchema.index({ movementType: 1 });
stockMovementSchema.index({ createdAt: -1 }); // Pour les requêtes historiques
stockMovementSchema.index({ user: 1 });

module.exports = mongoose.model('StockMovement', stockMovementSchema);
