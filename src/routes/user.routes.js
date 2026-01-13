const router = require('express').Router();
const userController = require('../controllers/user.controller');

// TODO: Définir la route GET / (appelle userController.findAll)
router.get('/', userController.findAll);

// TODO: Définir la route GET /:id (appelle userController.findOne)
router.get('/:id', userController.findOne)

module.exports = router;