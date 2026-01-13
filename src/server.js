const app = require('./app'); // Sera créé à l'étape suivante
const config = require('./config');
// TODO: Utiliser app.listen avec le port venant de la config
app.listen(config.PORT, () => {
    // TODO: Ajouter un console.log indiquant le port et l'environnement
    console.log(`Serveur démarré sur le port ${config.PORT} en environnement ${config.NODE_ENV}`);
});