const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Schéma de l'utilisateur
const userSchema = new mongoose.Schema(
  {
    // Informations de base
    firstName: {
      type: String,
      required: [true, 'Le prénom est requis'],
      trim: true,
      minlength: [2, 'Le prénom doit contenir au moins 2 caractères'],
    },
    lastName: {
      type: String,
      required: [true, 'Le nom est requis'],
      trim: true,
      minlength: [2, 'Le nom doit contenir au moins 2 caractères'],
    },
    email: {
      type: String,
      required: [true, 'Veuillez fournir une adresse email'],
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Veuillez fournir une adresse email valide'],
    },
    password: {
      type: String,
      required: [true, 'Veuillez fournir un mot de passe'],
      minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
      select: false, // N'inclure le mot de passe que si explicitement demandé
    },
    // Rôle de l'utilisateur (RBAC)
    role: {
      type: String,
      enum: {
        values: ['admin', 'manager', 'user'],
        message: 'Le rôle doit être admin, manager ou user',
      },
      default: 'user',
    },
    // Statut de l'utilisateur
    isActive: {
      type: Boolean,
      default: true,
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
    timestamps: true, // Met à jour automatiquement createdAt et updatedAt
  }
);

// Pré-traitement : Hash le mot de passe avant de sauvegarder
userSchema.pre('save', async function (next) {
  // Sauter le hachage si le mot de passe n'a pas été modifié
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function (passwordEntered) {
  return await bcrypt.compare(passwordEntered, this.password);
};

module.exports = mongoose.model('User', userSchema);
