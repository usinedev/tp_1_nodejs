const UserService = require('./services/user.service');

(async() => {
    console.log(await UserService.findAll());
    console.log(await UserService.findById(2));

  try {
    console.log(await UserService.findById(999));
  } catch (e) {
    console.log('Erreur attendue:', e.message);
  }
    
})();