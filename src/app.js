const express = require('express');
const app = express();

const apiRoutes = require('./routes')


// TODO: Ajouter le middleware pour parser le JSON (express.json)
app.use(express.json());

// TODO: Créer une route de test GET / qui renvoie "API Running"
app.get('/', (req, res) => {
    res.send(`API Running`);
});

app.use('/api', apiRoutes)

module.exports = app;