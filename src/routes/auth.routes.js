const express = require('express');
const router = express.Router();
const controller = require('../controllers/auth.controller');
const { loginValidator } = require('../validators/auth.validators');

router.get('/login', controller.showLogin);          // Formulario login
router.post('/auth/login', loginValidator, controller.login); // Procesa login
router.get('/auth/logout', controller.logout);      // Cierra sesión

module.exports = router;
