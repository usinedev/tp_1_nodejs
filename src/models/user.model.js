const users = [
    { id: 1, name: 'Alice', email: 'alice@test.com' },
    { id: 2, name: 'Bob', email: 'bob@test.com' }
];

class UserModel {
    static findAll() {
        // TODO: Retourner une Promise qui résout le tableau users
        return new Promise((resolve, reject) => {
            resolve(users);
        });
        //Ou alors raccourci : return Promise.resolve(users);

    }
    static findById(id) {
        // TODO: Chercher l'utilisateur par ID dans le tableau
        const idNumber = Number(id);

        // TODO: Retourner une Promise qui résout l'utilisateur
        const user = users.find(u => u.id === idNumber);
        return new Promise((resolve, reject) => {
            resolve(user);
        })
    }
};

module.exports = UserModel;