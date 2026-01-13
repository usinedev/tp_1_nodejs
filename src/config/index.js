const dotenv = require('dotenv');

// TODO: Initialiser la configuration dotenv ici
dotenv.config();

module.exports = {

    // TODO: Exporter le PORT (défaut 3000)
    PORT: process.env.PORT || 3000,         //ou pour éviter toute confusion : PORT: Number(process.env.PORT || 3000)

    // TODO: Exporter l'environnement (NODE_ENV, défaut 'development')
    NODE_ENV: process.env.NODE_ENV || 'development',

    // TODO: Exporter l'API_KEY
    API_KEY: process.env.API_KEY

};