const mongoose = require('mongoose');

/**
 * Connexion à la base de données MongoDB
 * Utilise les variables d'environnement pour configurer l'URI de connexion
 */
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stockmyproducts';
    
    const connection = await mongoose.connect(mongoURI);

    console.log(`Base de données connectée: ${connection.connection.host}`);
    return connection;
  } catch (error) {
    console.error(`Erreur de connexion à la base de données: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
