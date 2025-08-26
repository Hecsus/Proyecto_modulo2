const { body } = require('express-validator');

// Validación para el formulario de login
exports.loginValidator = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('La contraseña es requerida')
];
