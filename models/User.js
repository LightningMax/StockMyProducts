const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, // regex pour valider l'email
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false, // inclus le mdp si demande (evite faille de secu)
    },

    role: {
      type: String,
      enum: ["admin", "manager", "user"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
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
    timestamps: true, // mettre a jour create et update tout seul
  },
);

// hash le mot de passe avant de sauvegarder
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const saltBcrypt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, saltBcrypt);
    next();
  } catch (error) {
    next(error);
  }
});

// vérifie les mdp
userSchema.methods.comparePassword = async function (passwordEntered) {
  return await bcrypt.compare(passwordEntered, this.password);
};

module.exports = mongoose.model("User", userSchema);
