const UserModel = require('../models/user.model');

class UserService {
    async findAll() {
        // TODO: Appeler le modèle et retourner le résultat
        const users = await UserModel.findAll();
        return users;

    }

    async findById(id) {
        // TODO: Appeler le modèle
        const user = await UserModel.findById(id);

        // TODO: Si l'utilisateur n'existe pas, lancer une erreur: throw new Error('User not found')
        if (user === undefined) {
            throw new Error('User not found');
        }

        // TODO: Sinon, retourner l'utilisateur
        else {
            return user;
        }

    }
}
module.exports = new UserService();