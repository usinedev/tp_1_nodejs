const router = require('express').Router();
const userRoutes = require('./user.routes');

// TODO: Monter les routes user sur le path '/users'
router.use('/users', userRoutes);

module.exports = router;