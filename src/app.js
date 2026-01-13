const express = require('express');
const logger = require('./middlewares/logger.middleware')
const apiRoutes = require('./routes')

const app = express();

// TODO: Ajouter le middleware pour parser le JSON (express.json)
app.use(express.json());

app.use(logger);


// TODO: Créer une route de test GET / qui renvoie "API Running"
app.get('/', (req, res) => {
    res.send(`API Running`);
});

app.use('/api', apiRoutes);

module.exports = app;