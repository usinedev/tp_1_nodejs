# TP Node.js / Express — Récap complet (Config → MVC → Routing modulaire)

> Objectif : construire une petite API Express **proprement structurée** (config centralisée, pattern MVC, routes modulaires), avec une “base de données” simulée en mémoire.

---

## Sommaire

1. [Prérequis et scripts npm](#1-prérequis-et-scripts-npm)
2. [Variables d’environnement : `.env`, `dotenv`, `process.env`](#2-variables-denvironnement-env-dotenv-processenv)
3. [Config centralisée : `src/config/index.js`](#3-config-centralisée-srcconfigindexjs)
4. [Séparation `app` vs `server` : `src/app.js` et `src/server.js`](#4-séparation-app-vs-server-srcappjs-et-srcserverjs)
5. [MVC : Model → Service → Controller](#5-mvc--model--service--controller)
6. [Routing modulaire : `user.routes.js`, `routes/index.js`, montage sur `/api`](#6-routing-modulaire-userroutesjs-routesindexjs-montage-sur-api)
7. [Comment tester (curl, navigateur, erreurs)](#7-comment-tester-curl-navigateur-erreurs)
8. [Erreurs fréquentes rencontrées et comment les éviter](#8-erreurs-fréquentes-rencontrées-et-comment-les-éviter)

---

## 1) Prérequis et scripts npm

### Pourquoi des scripts ?
Un script dans `package.json` est un **alias de commande**.  
- `npm start` : démarrer l’app “normalement”
- `npm run dev` : démarrer en mode dev avec **auto-reload**

### Exemple `package.json` (section scripts)

```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  }
}
```

### Installer nodemon (si nécessaire)

```bash
npm install --save-dev nodemon
```

---

## 2) Variables d’environnement : `.env`, `dotenv`, `process.env`

### C’est quoi `process.env` ?
- `process` est un objet global Node.js représentant le **processus** en cours.
- `process.env` contient les **variables d’environnement** du processus (des paires `clé=valeur`).

> Important : Node.js **ne lit pas** le fichier `.env` automatiquement.

### Alors à quoi sert `.env` ?
`.env` est un fichier texte “pratique” en dev pour stocker des variables :

```env
PORT=3000
NODE_ENV=development
API_KEY=secret123
```

### Le rôle de `dotenv`
`dotenv` sert à **copier** le contenu du `.env` dans `process.env` au démarrage :

```js
require('dotenv').config();
// maintenant process.env.PORT, process.env.NODE_ENV, etc. existent
```

---

## 3) Config centralisée : `src/config/index.js`

### Pourquoi centraliser la config ?
Énoncé : **ne jamais utiliser `process.env` dans le code métier**.

Donc on lit `process.env` **une seule fois** dans `src/config/index.js` puis tout le reste utilise `config`.

### Exemple `src/config/index.js`

```js
const dotenv = require('dotenv');

// 1) Charger .env dans process.env
dotenv.config();

module.exports = {
  // 2) Valeurs avec défauts
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  API_KEY: process.env.API_KEY
};
```

✅ Ici, tu as appris :
- que `development` doit être une **string** : `'development'`
- que `process.env` retourne toujours des **strings**

---

## 4) Séparation `app` vs `server` : `src/app.js` et `src/server.js`

### Pourquoi séparer ?
- `app.js` = **définition** de l’application Express (middlewares, routes)
- `server.js` = **lancement** du serveur (listen + logs)

Ça rend le code :
- plus testable,
- plus propre,
- plus “pro”.

---

### 4.1) `src/app.js` : le “cerveau” Express

#### Middleware JSON
Pour lire des bodies JSON dans les requêtes, tu ajoutes :

```js
app.use(express.json());
```

⚠️ Important : c’est `express.json()` avec parenthèses (sinon tu passes la factory au lieu du middleware).

#### Route test `GET /`

```js
app.get('/', (req, res) => {
  res.send('API Running');
});
```

#### Exemple complet `src/app.js`

```js
const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API Running');
});

module.exports = app;
```

---

### 4.2) `src/server.js` : démarrage du serveur

```js
const app = require('./app');
const config = require('./config');

app.listen(config.PORT, () => {
  console.log(
    `Serveur démarré sur le port ${config.PORT} en environnement ${config.NODE_ENV}`
  );
});
```

✅ Ici, tu as appris :
- pourquoi `app.listen is not a function` arrive quand `app.js` n’exporte pas une vraie app
- que le port / env sont de l’**infrastructure**, donc ça reste dans `server.js`

---

## 5) MVC : Model → Service → Controller

Le MVC ici sert à séparer les responsabilités.

### Modèle mental (ultra important)

```
HTTP → Routes → Controller → Service → Model
```

- **Model** : accès données (ici un tableau simulant une DB)
- **Service** : logique métier (règles : “si pas trouvé → erreur”)
- **Controller** : couche HTTP (req/res, status codes, JSON)

---

### 5.1) Model : `src/models/user.model.js`

On simule une base de données avec un tableau :

```js
const users = [
  { id: 1, name: 'Alice', email: 'alice@test.com' },
  { id: 2, name: 'Bob', email: 'bob@test.com' }
];
```

On veut des méthodes qui retournent des **Promises** (même si c’est synchrone) pour préparer l’arrivée d’une vraie DB plus tard.

#### `findAll()` : renvoie tous les users

```js
static findAll() {
  return new Promise((resolve) => {
    resolve(users);
  });
}
```

#### `findById(id)` : renvoie 1 user ou `undefined`

```js
static findById(id) {
  const idNumber = Number(id);
  const user = users.find(u => u.id === idNumber);

  return new Promise((resolve) => {
    resolve(user);
  });
}
```

✅ Tu as appris :
- que `users` est un tableau → pas `users.id`
- que la bonne méthode est `.find(...)`
- que la Promise doit **resolve** quelque chose

---

### 5.2) Service : `src/services/user.service.js`

Le service appelle le modèle, et impose la règle :
- si user introuvable → `throw new Error('User not found')`

```js
const UserModel = require('../models/user.model');

class UserService {
  async findAll() {
    const users = await UserModel.findAll();
    return users;
  }

  async findById(id) {
    const user = await UserModel.findById(id);

    if (user === undefined) {
      throw new Error('User not found');
    }

    return user;
  }
}

module.exports = new UserService();
```

✅ Tu as appris :
- `UserService` (classe) en Majuscule (convention)
- `module.exports = new UserService()` exporte une **instance**
- le `throw` remontera jusqu’au controller

---

### 5.3) Controller : `src/controllers/user.controller.js`

Le controller :
- reçoit `req` / `res`
- appelle le service
- renvoie la réponse JSON demandée :
  - `{ status: 'success', data: ... }`
- gère les erreurs :
  - 404 si `User not found`
  - 500 sinon

```js
const userService = require('../services/user.service');

exports.findAll = async (req, res) => {
  try {
    const users = await userService.findAll();
    return res.json({ status: 'success', data: users });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await userService.findById(id);
    return res.json({ status: 'success', data: user });
  } catch (err) {
    if (err.message === 'User not found') {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};
```

✅ Tu as appris :
- `req.params.id` vient de l’URL `/:id`
- que `'success'` doit être écrit **exactement** comme dans l’énoncé
- ne pas oublier `const user = ...` (sinon variable globale)

---

## 6) Routing modulaire : `user.routes.js`, `routes/index.js`, montage sur `/api`

But : `app.js` ne contient pas toutes les routes de chaque ressource.

### 6.1) Routes user : `src/routes/user.routes.js`

Règle d’or : **ne pas appeler** les controllers (`()`).  
On passe la **référence** de fonction :

```js
const router = require('express').Router();
const userController = require('../controllers/user.controller');

router.get('/', userController.findAll);
router.get('/:id', userController.findOne);

module.exports = router;
```

---

### 6.2) Router principal : `src/routes/index.js`

Il “monte” les routes users sur `/users` :

```js
const router = require('express').Router();
const userRoutes = require('./user.routes');

router.use('/users', userRoutes);

module.exports = router;
```

---

### 6.3) Montage dans `app.js` sur `/api`

Maintenant on branche tout le router principal sur `/api` :

```js
const express = require('express');
const app = express();

const apiRoutes = require('./routes');

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API Running');
});

// Tout ce qui est dans routes/index.js sera préfixé par /api
app.use('/api', apiRoutes);

module.exports = app;
```

Résultat final des endpoints :

- `GET /` → API Running
- `GET /api/users` → liste des users
- `GET /api/users/:id` → user unique

---

## 7) Comment tester (curl, navigateur, erreurs)

### Démarrer
```bash
npm run dev
```

### Tester la route racine
Navigateur : `http://localhost:3000/`

Ou curl :
```bash
curl http://localhost:3000/
```

### Tester l’API
```bash
curl http://localhost:3000/api/users
curl http://localhost:3000/api/users/1
```

### Vérifier le 404 (user inexistant)
```bash
curl -i http://localhost:3000/api/users/999
```

Tu dois voir un `HTTP/... 404` et le JSON :
```json
{ "error": "User not found" }
```

---

## 8) Erreurs fréquentes rencontrées et comment les éviter

### 8.1) `TypeError: app.listen is not a function`
Cause : tu importes quelque chose qui n’est pas une app Express.  
Fix :
- `app.js` doit faire `const app = express();`
- et `module.exports = app;`

### 8.2) Middleware JSON mal écrit
❌ `app.use(express.json);`  
✅ `app.use(express.json());`

### 8.3) Route mal écrite
❌ `app.get('GET/', ...)`  
✅ `app.get('/', ...)`

### 8.4) Routes qui appellent le controller
❌ `router.get('/', userController.findAll())`  
✅ `router.get('/', userController.findAll)`

### 8.5) Mauvais require dans les routes
Depuis `src/routes/user.routes.js`, le controller est :
✅ `../controllers/user.controller`

### 8.6) Erreurs de string contractuelle
Énoncé : `status: 'success'` → il faut **exactement** `'success'` (pas `'succes'`).

---

## Récap final (le “flow” complet)

Quand tu appelles :

```
GET /api/users/2
```

Il se passe :

1. `app.js` reçoit la requête et la redirige vers `/api`  
2. `routes/index.js` redirige vers `/users`  
3. `user.routes.js` match `/:id` et appelle `userController.findOne`  
4. `user.controller.js` lit `req.params.id`, appelle `userService.findById(id)`  
5. `user.service.js` appelle `UserModel.findById(id)`  
6. `user.model.js` cherche dans le tableau et renvoie une Promise  
7. Le service vérifie : si pas trouvé → throw “User not found”  
8. Le controller renvoie :
   - 200 + `{ status:'success', data:user }`
   - ou 404 + `{ error:'User not found' }`

---

## Bonus : pourquoi cette structure est “pro” ?
- Tu peux remplacer le tableau par une vraie DB sans toucher aux controllers.
- Tu peux ajouter des règles métier dans le service sans casser les routes.
- Tu peux ajouter d’autres ressources (posts, orders, etc.) en créant de nouveaux routers et services.

---

Si tu veux, je peux aussi te fournir une **arborescence finale attendue** (avec les fichiers) ou t’aider à ajouter un `POST /api/users` proprement (validation + création en mémoire).
