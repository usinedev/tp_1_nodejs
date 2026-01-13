const userService = require('../services/user.service');

exports.findAll = async (req, res) => {
    try {
        // TODO: Appeler le service findAll
        const users = await userService.findAll();

        // TODO: Renvoyer la réponse JSON { status: 'success', data: ... }
        return res.json({ status: 'success', data: users })
        
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

exports.findOne = async (req, res) => {
    try {
        // TODO: Récupérer l'ID depuis req.params
        const id = req.params.id;

        // TODO: Appeler le service findById
        const user = await userService.findById(id)

        // TODO: Renvoyer la réponse JSON
        return res.json({ status: 'success', data: user })

    } catch (err) {
        // TODO: Gérer l'erreur 500
        if (err.message === 'User not found') {
            return res.status(404).json({ error: err.message })
        }
        else {
            return res.status(500).json({ error: err.message })
        }
    }
};